/**
 * sync-google-fonts.ts
 *
 * Google Fonts API에서 한글 + 영문 폰트를 가져와 Supabase에 자동 추가
 *
 * 실행 방법:
 *   npx tsx scripts/sync-google-fonts.ts
 *
 * 옵션:
 *   --korean-only   한글 폰트만 추가
 *   --english-only  영문 폰트만 추가
 *   --dry-run       DB에 저장하지 않고 결과만 출력
 *
 * 필요한 환경변수 (.env.local):
 *   GOOGLE_FONTS_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
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

const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: {
    fetch: fetch,
  },
})

// ─── CLI 옵션 ───────────────────────────────────────────
const args        = process.argv.slice(2)
const KOREAN_ONLY  = args.includes('--korean-only')
const ENGLISH_ONLY = args.includes('--english-only')
const DRY_RUN      = args.includes('--dry-run')

// ─── 영문 폰트 제한 (너무 많으면 부하) ─────────────────
// 인기순으로 상위 N개만 추가. 0이면 전체
const ENGLISH_LIMIT = 300

// ─── 타입 ───────────────────────────────────────────────
interface GoogleFont {
  family:       string
  category:     string
  subsets:      string[]
  variants:     string[]
  lastModified: string
}

// ─── 유틸리티 ───────────────────────────────────────────

function toSlug(family: string): string {
  return family.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function toWeights(variants: string[]): string[] {
  return variants
    .filter(v => !v.includes('italic'))
    .map(v => v === 'regular' ? '400' : v)
    .filter(v => /^\d+$/.test(v))
    .sort((a, b) => Number(a) - Number(b))
}

function toKoreanCategory(googleCategory: string): string {
  const map: Record<string, string> = {
    'sans-serif':  'gothic',
    'serif':       'myeongjo',
    'handwriting': 'handwriting',
    'display':     'display',
    'monospace':   'monospace',
  }
  return map[googleCategory] ?? 'gothic'
}

function toCdnUrl(family: string, weights: string[]): string {
  const familyParam = family.replace(/ /g, '+')
  const weightParam = weights.join(';')
  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightParam}&display=swap`
}

function getLanguage(subsets: string[]): 'korean' | 'english' | 'both' {
  const hasKorean = subsets.includes('korean')
  const hasLatin  = subsets.includes('latin') || subsets.includes('latin-ext')
  if (hasKorean && hasLatin) return 'both'
  if (hasKorean) return 'korean'
  return 'english'
}

function autoTags(font: GoogleFont, isKorean: boolean): string[] {
  const tags: string[] = []
  if (isKorean) {
    const map: Record<string, string> = {
      'sans-serif':  '고딕',
      'serif':       '명조',
      'handwriting': '손글씨',
      'display':     '디스플레이',
      'monospace':   '모노스페이스',
    }
    if (map[font.category]) tags.push(map[font.category])
    tags.push('한글', 'Google Fonts')
  } else {
    tags.push(font.category, 'Google Fonts')
    if (font.variants.length > 6) tags.push('multi-weight')
    if (font.category === 'monospace') tags.push('coding', 'developer')
    if (font.category === 'handwriting') tags.push('script', 'calligraphy')
  }
  if (font.variants.length > 5) tags.push('다양한굵기')
  return [...new Set(tags)]  // 중복 제거
}

function buildRecord(font: GoogleFont) {
  const weights  = toWeights(font.variants)
  const isKorean = font.subsets.includes('korean')
  const language = getLanguage(font.subsets)

  return {
    name:            font.family,
    slug:            toSlug(font.family),
    designer:        'Google',
    foundry:         'Google',
    category:        isKorean ? toKoreanCategory(font.category) : font.category,
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
    supports_latin:  font.subsets.includes('latin') || font.subsets.includes('latin-ext'),
    is_featured:     false,
    download_count:  0,
  }
}

// ─── 메인 ───────────────────────────────────────────────
async function main() {
  console.log('🔄 Google Fonts 동기화 시작...')
  if (DRY_RUN) console.log('   (dry-run 모드: DB에 저장하지 않음)\n')

  /// 1. Google Fonts 전체 목록 (인기순) — API 키 불필요
  const apiUrl = `https://fonts.google.com/metadata/fonts`
  const res    = await fetch(apiUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })

  if (!res.ok) {
    console.error('❌ Google Fonts API 오류:', res.status, await res.text())
    process.exit(1)
  }

  const text     = await res.text()
  const cleaned  = text.replace(/^\)\]\}'/, '') // XSSI 방어 문자 제거
  const json     = JSON.parse(cleaned)
  const allFonts: GoogleFont[] = json.familyMetadataList.map((f: any) => ({
    family:       f.family,
    category:     f.category?.toLowerCase() ?? 'sans-serif',
    subsets:      f.subsets ?? [],
    variants:     (f.fonts ? Object.keys(f.fonts) : ['400']),
    lastModified: f.lastModified ?? '',
  }))
  console.log(`📦 Google Fonts 전체: ${allFonts.length}개`)

  // 2. 한글 / 영문 분리
  const koreanFonts  = allFonts.filter(f => f.subsets.includes('korean'))
  const englishFonts = allFonts
    .filter(f => !f.subsets.includes('korean'))
    .slice(0, ENGLISH_LIMIT || allFonts.length)

  console.log(`🇰🇷 한글 폰트: ${koreanFonts.length}개`)
  console.log(`🔤 영문 폰트: ${englishFonts.length}개 (상위 ${ENGLISH_LIMIT || '전체'})\n`)

  // 3. 처리 대상 결정
  let targetFonts: GoogleFont[] = []
  if (KOREAN_ONLY)       targetFonts = koreanFonts
  else if (ENGLISH_ONLY) targetFonts = englishFonts
  else                   targetFonts = [...koreanFonts, ...englishFonts]

  // 4. DB 기존 slug 조회
  const { data: existing } = await db.schema('fonts').from('fonts').select('slug')
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug))
  console.log(`💾 현재 DB 폰트: ${existingSlugs.size}개`)

  // 5. 신규 폰트만 필터
  const newFonts = targetFonts.filter(f => !existingSlugs.has(toSlug(f.family)))
  console.log(`✨ 추가 대상: ${newFonts.length}개\n`)

  if (newFonts.length === 0) {
    console.log('✅ 추가할 새 폰트가 없습니다.')
    return
  }

  // 6. 삽입
  let added  = 0
  let failed = 0
  let skipped = 0

  for (const font of newFonts) {
    const record = buildRecord(font)

    if (record.weights.length === 0) {
      console.warn(`  ⚠️  굵기 없음, 건너뜀: ${font.family}`)
      skipped++
      continue
    }

    if (DRY_RUN) {
      console.log(`  🔍 [dry-run] ${font.family} (${record.language}, ${record.weights.length}굵기)`)
      added++
      continue
    }

    const { error } = await db.schema('fonts').from('fonts').insert(record)
    

    if (error) {
      if (error.code === '23505') { skipped++; continue }  // 중복
      console.error(`  ❌ 실패: ${font.family} — ${error.message}`)
      failed++
    } else {
      console.log(`  ✅ ${font.family} (${record.language}, weights: ${record.weights.join(',')})`)
      added++
    }
  }

  // 7. 결과 요약
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅ 추가 완료 : ${added}개`)
  if (skipped > 0) console.log(`⏭️  건너뜀    : ${skipped}개 (중복 또는 굵기 없음)`)
  if (failed  > 0) console.log(`❌ 실패      : ${failed}개`)
  console.log(`${'─'.repeat(50)}`)

  // 8. 최종 DB 현황
  const { count } = await db.from('fonts').select('*', { count: 'exact', head: true })
  console.log(`\n📊 최종 DB 폰트 수: ${count}개`)
}

main().catch(err => {
  console.error('❌ 동기화 실패:', err)
  process.exit(1)
})