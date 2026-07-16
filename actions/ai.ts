'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase-server'
import { Font } from '@/types'
import crypto from 'crypto'

function hashPrompt(p: string) {
  return crypto.createHash('md5').update(p.toLowerCase().trim()).digest('hex')
}

// 질문에서 카테고리/언어 힌트 추출
function extractFilters(prompt: string): { category?: string; language?: string } {
  const p = prompt.toLowerCase()

  const category =
    p.match(/손글씨|필기|핸드라이팅|handwriting/) ? 'handwriting' :
    p.match(/고딕|sans.?serif|산세리프|고딕체/) ? 'sans-serif' :
    p.match(/명조|serif|세리프/) ? 'serif' :
    p.match(/모노|코딩|coding|monospace|개발/) ? 'monospace' :
    p.match(/디스플레이|display|장식|제목|포스터/) ? 'display' :
    p.match(/스크립트|script|캘리/) ? 'script' :
    undefined

  const language =
    p.match(/한글|한국어|korean/) ? 'korean' :
    p.match(/영문|영어|english|latin/) ? 'english' :
    undefined

  return { category, language }
}

export async function getAIRecommendation(prompt: string): Promise<
  | { fonts: Font[]; reasoning: string; pairing_tip?: string; cached: boolean }
  | { error: string }
> {
  if (!prompt.trim() || prompt.length < 5)
    return { error: '요청을 좀 더 자세히 입력해주세요.' }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { error: 'AI 추천 서비스가 설정되지 않았습니다.' }

  const anthropic = new Anthropic({ apiKey })
  const db = createServerClient()
  const cacheKey = hashPrompt(prompt)

  // 캐시 확인
  const { data: cached } = await db
    .schema('fonts')
    .from('ai_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .maybeSingle()

  if (cached) {
    await db.schema('fonts').from('ai_cache')
      .update({ hit_count: (cached.hit_count || 0) + 1 })
      .eq('cache_key', cacheKey)

    const { data: fonts } = await db
      .schema('fonts').from('fonts')
      .select('*').in('slug', cached.font_slugs)

    return {
      fonts: (fonts as Font[]) || [],
      reasoning: cached.reasoning,
      pairing_tip: cached.pairing_tip ?? undefined,
      cached: true,
    }
  }

  // 스마트 필터링 — 질문 분석 후 관련 폰트만 추출
  const { category, language } = extractFilters(prompt)

  let query = db
    .schema('fonts')
    .from('fonts')
    .select('slug, name, category, language')
    .order('download_count', { ascending: false })

  if (category) query = query.eq('category', category)
  if (language === 'korean') query = query.eq('supports_korean', true)
  if (language === 'english') query = query.eq('supports_latin', true)

  // 필터 적용 후 최대 120개
  query = query.limit(120)

  const { data: filteredFonts } = await query

  // 필터 결과가 너무 적으면 인기순 100개 + 최신 추가 50개로 폴백
  let allFonts = filteredFonts
  if (!allFonts || allFonts.length < 10) {
    const [{ data: popular }, { data: newest }] = await Promise.all([
      db.schema('fonts').from('fonts')
        .select('slug, name, category, language')
        .order('download_count', { ascending: false })
        .limit(100),
      db.schema('fonts').from('fonts')
        .select('slug, name, category, language')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    // 중복 제거 후 합치기
    const seen = new Set<string>()
    allFonts = [...(popular || []), ...(newest || [])].filter(f => {
      if (seen.has(f.slug)) return false
      seen.add(f.slug)
      return true
    })
  }

  if (!allFonts?.length) return { error: '폰트 데이터를 불러올 수 없습니다.' }

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: `Typography expert. Return ONLY JSON: {"font_slugs":["slug1","slug2"],"reasoning":"한국어 추천 이유 2~3문장","pairing_tip":"한+영 조합 팁 or null"}. Recommend 2-4 fonts from: ${JSON.stringify(allFonts)}`,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')

    const parsed = JSON.parse(text.replace(/```[\s\S]*?```/g, '').trim())
    const validSlugs = (parsed.font_slugs as string[])
      .filter((s: string) => allFonts!.some(f => f.slug === s))

    if (validSlugs.length === 0)
      return { error: '적합한 폰트를 찾지 못했습니다. 다시 시도해주세요.' }

    await db.schema('fonts').from('ai_cache').insert({
      cache_key: cacheKey,
      prompt,
      font_slugs: validSlugs,
      reasoning: parsed.reasoning,
      pairing_tip: parsed.pairing_tip || null,
    })

    const { data: fonts } = await db
      .schema('fonts').from('fonts')
      .select('*').in('slug', validSlugs)

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
