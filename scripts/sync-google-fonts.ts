/**
 * sync-google-fonts.ts
 *
 * Google Fonts API에서 새 폰트를 가져와 Supabase에 자동 추가
 *
 * 실행 방법:
 *   npx tsx scripts/sync-google-fonts.ts
 *
 * 필요한 환경변수 (.env.local 또는 GitHub Secrets):
 *   GOOGLE_FONTS_API_KEY   — Google Cloud Console에서 발급
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

// ─── 환경변수 ───────────────────────────────────────────
const GOOGLE_FONTS_API_KEY = process.env.GOOGLE_FONTS_API_KEY ?? ''
const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY         = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!GOOGLE_FONTS_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 환경변수가 누락되었습니다.')
  console.error('   GOOGLE_FONTS_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 확인')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── 타입 ───────────────────────────────────────────────
interface GoogleFont {
  family: string
  category: string                  // 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace'
  subsets: string[]                 // ['korean', 'latin', ...]
  variants: string[]                // ['100', 'regular', '700italic', ...]
  lastModified: string              // '2024-01-15'
}

// ─── 유틸리티 ───────────────────────────────────────────

// "Noto Sans KR" → "noto-sans-kr"
function toSlug(family: string): string {
  return family.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Google variants → 굵기 배열 ("regular" → "400", "700italic" 제외)
function toWeights(variants: string[]): string[] {
  return variants
    .filter(v => !v.includes('italic'))
    .map(v => v === 'regular' ? '400' : v)
    .filter(v => /^\d+$/.test(v))
    .sort((a, b) => Number(a) - Number(b))
}

// Google category → 우리 category
function toCategory(googleCategory: string, isKorean: boolean): string {
  if (isKorean) {
    const map: Record<string, string> = {
      'sans-serif':  'gothic',
      'serif':       'myeongjo',
      'handwriting': 'handwriting',
      'display':     'display',
      'monospace':   'monospace',
    }
    return map[googleCategory] ?? 'gothic'
  }
  return googleCategory  // 영문은 Google category 그대로 사용
}

// Google Fonts CDN URL 생성
function toCdnUrl(family: string, weights: string[]): string {
  const familyParam = family.replace(/ /g, '+')
  const weightParam = weights.join(';')
  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightParam}&display=swap`
}

// 언어 판단
function getLanguage(subsets: string[]): 'korean' | 'english' | 'both' {
  const hasKorean = subsets.includes('korean')
  const hasLatin  = subsets.includes('latin') || subsets.includes('latin-ext')
  if (hasKorean && hasLatin) return 'both'
  if (hasKorean) return 'korean'
  return 'english'
}

// 자동 태그 생성
function autoTags(font: GoogleFont, isKorean: boolean): string[] {
  const tags: string[] = []
  if (isKorean) {
    const categoryTags: Record<string, string> = {
      'sans-serif':  '고딕',
      'serif':       '명조',
      'handwriting': '손글씨',
      'display':     '디스플레이',
      'monospace':   '모노스페이스',
    }
    if (categoryTags[font.category]) tags.push(categoryTags[font.category])
  }
  tags.push(font.category)
  if (font.variants.length > 5) tags.push('다양한굵기')
  return tags
}

// ─── 메인 ───────────────────────────────────────────────
async function main() {
  console.log('🔄 Google Fonts API 동기화 시작...\n')

  // 1. Google Fonts 전체 목록 가져오기 (최신순 정렬)
  const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=date`
  const res  = await fetch(url)

  if (!res.ok) {
    console.error('❌ Google Fonts API 오류:', res.status, await res.text())
    process.exit(1)
  }

  const json = await res.json() as { items: GoogleFont[] }
  console.log(`📦 Google Fonts 전체: ${json.items.length}개`)

  // 2. 한글 지원 폰트만 필터
  const koreanFonts = json.items.filter(f => f.subsets.includes('korean'))
  console.log(`🇰🇷 한글 지원 폰트: ${koreanFonts.length}개\n`)

  // 3. 현재 DB의 slug 목록 가져오기 (중복 방지)
  const { data: existing } = await db.from('fonts').select('slug')
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug))
  console.log(`💾 현재 DB 폰트: ${existingSlugs.size}개`)

  // 4. 새 폰트만 필터링
  const newFonts = koreanFonts.filter(f => !existingSlugs.has(toSlug(f.family)))
  console.log(`✨ 새로 추가될 폰트: ${newFonts.length}개\n`)

  if (newFonts.length === 0) {
    console.log('✅ 추가할 새 폰트가 없습니다.')
    return
  }

  // 5. DB에 삽입
  let addedCount = 0
  let failedCount = 0

  for (const font of newFonts) {
    const weights  = toWeights(font.variants)
    const isKorean = font.subsets.includes('korean')
    const language = getLanguage(font.subsets)
    const slug     = toSlug(font.family)

    if (weights.length === 0) {
      console.warn(`  ⚠️  굵기 없음, 건너뜀: ${font.family}`)
      continue
    }

    const record = {
      name:            font.family,
      slug,
      foundry:         'Google',
      category:        toCategory(font.category, isKorean),
      tags:            autoTags(font, isKorean),
      license:         'ofl' as const,
      is_commercial:   true,
      cdn_url:         toCdnUrl(font.family, weights),
      css_family:      font.family,
      weights,
      preview_ko:      isKorean ? '다람쥐 헌 쳇바퀴에 타고파' : null,
      preview_en:      !isKorean ? 'The quick brown fox jumps over the lazy dog' : null,
      language,
      supports_korean: isKorean,
      supports_latin:  font.subsets.includes('latin'),
      is_featured:     false,
      download_count:  0,
    }

    const { error } = await db.from('fonts').insert(record)

    if (error) {
      if (error.code === '23505') {
        // slug 중복 — 정상 (이미 있는 폰트)
        continue
      }
      console.error(`  ❌ 실패: ${font.family} —`, error.message)
      failedCount++
    } else {
      console.log(`  ✅ 추가됨: ${font.family} (${language}, ${weights.length}굵기)`)
      addedCount++
    }
  }

  console.log(`\n${'─'.repeat(40)}`)
  console.log(`✅ 추가 완료: ${addedCount}개`)
  if (failedCount > 0) console.log(`❌ 실패: ${failedCount}개`)
  console.log(`${'─'.repeat(40)}`)
}

main().catch(err => {
  console.error('❌ 동기화 실패:', err)
  process.exit(1)
})
