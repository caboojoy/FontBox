'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase'
import { Font } from '@/types'
import crypto from 'crypto'

function hashPrompt(p: string) {
  return crypto.createHash('md5').update(p.toLowerCase().trim()).digest('hex')
}

export async function getAIRecommendation(prompt: string): Promise<
  | { fonts: Font[]; reasoning: string; pairing_tip?: string; cached: boolean }
  | { error: string }
> {
  if (!prompt.trim() || prompt.length < 5)
    return { error: '요청을 좀 더 자세히 입력해주세요.' }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { error: 'AI 추천 서비스가 설정되지 않았습니다.' }

  // 정적 import — 빌드 시 번들에 포함
  const anthropic = new Anthropic({ apiKey })

  const db = createServerClient()
  const cacheKey = hashPrompt(prompt)

  const { data: cached } = await db
    .from('ai_cache').select('*').eq('cache_key', cacheKey).maybeSingle()

  if (cached) {
    await db.from('ai_cache')
      .update({ hit_count: (cached.hit_count || 0) + 1 })
      .eq('cache_key', cacheKey)

    const { data: fonts } = await db
      .from('fonts').select('*').in('slug', cached.font_slugs)

    return {
      fonts: (fonts as Font[]) || [],
      reasoning: cached.reasoning,
      pairing_tip: cached.pairing_tip ?? undefined,
      cached: true,
    }
  }

  const { data: allFonts } = await db
    .from('fonts').select('slug, name, category, language, tags')

  if (!allFonts?.length) return { error: '폰트 데이터를 불러올 수 없습니다.' }

  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: `You are a Korean/English typography expert.
Return ONLY a JSON object, no markdown or code fences.
Format: {"font_slugs":["slug1","slug2"],"reasoning":"한국어 추천 이유 2~3문장","pairing_tip":"한+영 조합 팁 or null"}
Recommend 2-4 fonts from: ${JSON.stringify(allFonts)}`,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')

    const parsed = JSON.parse(text.replace(/```[\s\S]*?```/g, '').trim())
    const validSlugs = (parsed.font_slugs as string[])
      .filter((s: string) => allFonts.some(f => f.slug === s))

    if (validSlugs.length === 0)
      return { error: '적합한 폰트를 찾지 못했습니다. 다시 시도해주세요.' }

    await db.from('ai_cache').insert({
      cache_key: cacheKey, prompt,
      font_slugs: validSlugs,
      reasoning: parsed.reasoning,
      pairing_tip: parsed.pairing_tip || null,
    })

    const { data: fonts } = await db
      .from('fonts').select('*').in('slug', validSlugs)

    return {
      fonts: (fonts as Font[]) || [],
      reasoning: parsed.reasoning,
      pairing_tip: parsed.pairing_tip ?? undefined,
      cached: false,
    }
  } catch (err) {
    console.error('AI error:', err)
    return { error: 'AI 추천 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }
}
