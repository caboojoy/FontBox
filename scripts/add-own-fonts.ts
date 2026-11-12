/**
 * add-own-fonts.ts
 *
 * FontBox 자체 제작 폰트(개발폰트/배포)를 Supabase에 추가/갱신한다.
 * slug 기준 upsert라 여러 번 실행해도 중복되지 않는다.
 *
 * 웹폰트 파일은 public/webfonts/ 에 있고(개발폰트/배포/도구/site_webfonts.py 로 생성),
 * 다운로드·라이선스 링크는 lib/fonts.ts 의 OWN_PACKAGES 가 slug 로 연결한다.
 * slug 를 바꾸면 그쪽도 같이 바꿔야 한다.
 *
 * 실행:  npx tsx scripts/add-own-fonts.ts [--dry-run]
 * 환경변수 (.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')

// 한글 2,350자만 담은 미리보기용 파일에 붙이는 안내
const SUBSET_NOTE = '/* 웹용 경량 파일: 한글 2,350자 + 영문·기호. 전체 11,172자는 다운로드 파일에 들어 있습니다. */\n'

function fontFace(family: string, faces: [weight: number, file: string][]): string {
  return faces
    .map(([w, file]) =>
      `@font-face { font-family: "${family}"; src: url("/webfonts/${file}") format("woff2"); font-weight: ${w}; font-display: swap; }`)
    .join('\n')
}

const COMMON = {
  designer: '도겸', foundry: 'FontBox', license: 'ofl', source: 'fontbox',
  language: 'korean', supports_korean: true, supports_latin: true,
  is_commercial: true, cdn_url: null, preview_en: null,
}

const FONTS = [
  {
    ...COMMON,
    name: '천의체', slug: 'cheonui', category: 'myeongjo',
    tags: ['명조', '제목', '전통', '장식', '구름', '연하장', '컬러'],
    css_family: 'Cheonui', weights: ['400', '700'],
    preview_ko: '병오년 새해 복 많이 받으세요', is_featured: true,
    webfont_css: fontFace('Cheonui', [[400, 'Cheonui-Regular.woff2'], [700, 'Cheonui-Bold.woff2']]),
  },
  {
    ...COMMON,
    name: '수염체 붓털', slug: 'suyeom-brush', category: 'display',
    tags: ['디스플레이', '제목', '장식', '수염', '붓', '로고', '재미'],
    css_family: 'Suyeom Brush', weights: ['400'],
    preview_ko: '소요강호 선생님 안녕하세요', is_featured: false,
    webfont_css: fontFace('Suyeom Brush', [[400, 'SuyeomBrush-Regular.woff2']]),
  },
  {
    ...COMMON,
    name: '수염체 콧수염', slug: 'suyeom-mustache', category: 'display',
    tags: ['디스플레이', '제목', '장식', '수염', '콧수염', '로고', '재미'],
    css_family: 'Suyeom Mustache', weights: ['400'],
    preview_ko: '아버지 할아버지 안녕하세요', is_featured: false,
    webfont_css: fontFace('Suyeom Mustache', [[400, 'SuyeomMustache-Regular.woff2']]),
  },
  {
    ...COMMON,
    name: '뭉툭마커', slug: 'mungtuk-marker', category: 'handwriting',
    tags: ['손글씨', '마커', '굵은', '둥근', '메모', '썸네일', '캐주얼'],
    css_family: 'Mungtuk Marker', weights: ['400'],
    preview_ko: '꾹꾹 눌러 쓴 마커 손글씨', is_featured: false,
    webfont_css: SUBSET_NOTE + fontFace('Mungtuk Marker', [[400, 'MungtukMarker-Regular.woff2']]),
  },
  {
    ...COMMON,
    name: '황야웨스턴', slug: 'hwangya-western', category: 'display',
    tags: ['디스플레이', '제목', '서부', '빈티지', '거친', '포스터', '굵은'],
    css_family: 'Hwangya Western', weights: ['400'],
    preview_ko: '황야의 무법자 석양의 목장', is_featured: false,
    webfont_css: SUBSET_NOTE + fontFace('Hwangya Western', [[400, 'HwangyaWestern-Regular.woff2']]),
  },
]

async function main() {
  if (DRY_RUN) {
    FONTS.forEach(f => console.log(`🔍 ${f.name} (${f.slug}) ${f.weights.join(',')}\n${f.webfont_css}\n`))
    console.log(`${FONTS.length}개 (dry-run, 저장 안 함)`)
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
    process.exit(1)
  }
  const db = createClient(url, key)

  // 이미 있는 slug 는 갱신 — 지정하지 않은 컬럼(download_count 등)은 그대로 유지
  const { error } = await db.schema('fonts').from('fonts').upsert(FONTS, { onConflict: 'slug' })
  if (error) { console.error('❌ upsert 실패:', error.message); process.exit(1) }
  console.log(`✅ ${FONTS.length}개 추가/갱신: ${FONTS.map(f => f.slug).join(', ')}`)
}

main().catch(err => { console.error(err); process.exit(1) })
