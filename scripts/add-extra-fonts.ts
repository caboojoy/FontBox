/**
 * add-extra-fonts.ts
 *
 * Google Fonts에 없는 무료 한글 웹폰트(네이버·눈누 CDN 등)를 Supabase에 추가/갱신한다.
 * slug 기준 upsert라 여러 번 실행해도 중복되지 않는다.
 *
 * 실행:  npx tsx scripts/add-extra-fonts.ts [--dry-run]
 * 환경변수 (.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
  process.exit(1)
}
const DRY_RUN = process.argv.includes('--dry-run')
const db = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── @font-face 생성 헬퍼 ───────────────────────────────
type Face = [weight: number, url: string]

function fontFace(family: string, faces: Face[]): string {
  return faces
    .map(([w, url]) => {
      const fmt = url.endsWith('.woff2') ? 'woff2' : 'woff'
      return `@font-face { font-family: "${family}"; src: url("${url}") format("${fmt}"); font-weight: ${w}; font-display: swap; }`
    })
    .join('\n')
}

const NAVER  = 'https://hangeul.pstatic.net/hangeul_static/webfont'
const NOONNU = 'https://cdn.jsdelivr.net/gh/projectnoonnu'

// ─── 폰트 목록 ──────────────────────────────────────────
interface ExtraFont {
  name: string
  slug: string
  designer: string
  foundry: string
  category: string
  tags: string[]
  license: 'ofl' | 'free' | 'commercial-free' | 'apache-2'
  css_family: string
  weights: string[]
  preview_ko: string
  preview_en?: string | null
  language: 'korean' | 'both'
  supports_latin: boolean
  is_featured?: boolean
  source: 'naver' | 'noonnu' | 'github'
  cdn_url?: string | null        // 외부 CSS 한 줄로 로드되는 폰트
  webfont_css?: string | null    // @font-face 직접 정의하는 폰트
}

const FONTS: ExtraFont[] = [
  // ── 네이버 한글한글 아름답게 ──
  {
    name: '마루 부리', slug: 'maru-buri', designer: 'NAVER', foundry: 'NAVER',
    category: 'myeongjo', tags: ['명조', '본문', '부드러운', '현대적', '독서'],
    license: 'ofl', css_family: 'MaruBuri', weights: ['200', '300', '400', '600', '700'],
    preview_ko: '부드럽게 읽히는 새로운 바탕체', language: 'both', supports_latin: true,
    is_featured: true, source: 'naver',
    webfont_css: fontFace('MaruBuri', [
      [200, `${NAVER}/MaruBuri/MaruBuri-ExtraLight.woff2`],
      [300, `${NAVER}/MaruBuri/MaruBuri-Light.woff2`],
      [400, `${NAVER}/MaruBuri/MaruBuri-Regular.woff2`],
      [600, `${NAVER}/MaruBuri/MaruBuri-SemiBold.woff2`],
      [700, `${NAVER}/MaruBuri/MaruBuri-Bold.woff2`],
    ]),
  },
  {
    name: '나눔바른고딕', slug: 'nanum-barun-gothic', designer: 'NAVER', foundry: 'NAVER',
    category: 'gothic', tags: ['고딕', '본문', '깔끔', '가독성', 'UI'],
    license: 'ofl', css_family: 'NanumBarunGothic', weights: ['200', '300', '400', '700'],
    preview_ko: '바르고 반듯한 화면용 고딕', language: 'both', supports_latin: true,
    source: 'naver',
    webfont_css: fontFace('NanumBarunGothic', [
      [200, `${NAVER}/NanumBarunGothicL/NanumBarunGothicWebUltraLight.woff`],
      [300, `${NAVER}/NanumBarunGothicL/NanumBarunGothicWebLight.woff`],
      [400, `${NAVER}/NanumBarunGothic/NanumBarunGothicWeb.woff`],
      [700, `${NAVER}/NanumBarunGothic/NanumBarunGothicWebBold.woff`],
    ]),
  },
  {
    name: '나눔스퀘어 네오', slug: 'nanum-square-neo', designer: 'NAVER', foundry: 'NAVER',
    category: 'gothic', tags: ['고딕', '제목', '현대적', '다굵기', '프레젠테이션'],
    license: 'ofl', css_family: 'NanumSquareNeo', weights: ['300', '400', '700', '800', '900'],
    preview_ko: '네모반듯한 새 나눔스퀘어', language: 'both', supports_latin: true,
    is_featured: true, source: 'naver',
    webfont_css: fontFace('NanumSquareNeo', [
      [300, `${NAVER}/NanumSquareNeo/NanumSquareNeoTTF-aLt.woff`],
      [400, `${NAVER}/NanumSquareNeo/NanumSquareNeoTTF-bRg.woff`],
      [700, `${NAVER}/NanumSquareNeo/NanumSquareNeoTTF-cBd.woff`],
      [800, `${NAVER}/NanumSquareNeo/NanumSquareNeoTTF-dEb.woff`],
      [900, `${NAVER}/NanumSquareNeo/NanumSquareNeoTTF-eHv.woff`],
    ]),
  },
  {
    name: '나눔바른펜', slug: 'nanum-barun-pen', designer: 'NAVER', foundry: 'NAVER',
    category: 'handwriting', tags: ['손글씨', '펜글씨', '단정한', '일상', '메모'],
    license: 'ofl', css_family: 'NanumBarunpen', weights: ['400', '700'],
    preview_ko: '또박또박 써 내려간 펜글씨', language: 'korean', supports_latin: true,
    source: 'naver',
    webfont_css: fontFace('NanumBarunpen', [
      [400, `${NAVER}/NanumBarunpen/NanumBarunpenR.woff`],
      [700, `${NAVER}/NanumBarunpen/NanumBarunpenB.woff`],
    ]),
  },

  // ── 오픈소스 (GitHub 배포) ──
  {
    name: '스포카 한 산스 Neo', slug: 'spoqa-han-sans-neo', designer: 'Spoqa', foundry: 'Spoqa',
    category: 'gothic', tags: ['고딕', 'UI', '본문', '깔끔', '가독성'],
    license: 'ofl', css_family: 'Spoqa Han Sans Neo', weights: ['100', '300', '400', '500', '700'],
    preview_ko: '화면에서 가장 편안한 고딕', preview_en: 'Clean UI typeface for screens',
    language: 'both', supports_latin: true, is_featured: true, source: 'github',
    cdn_url: 'https://spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css',
  },
  {
    name: '원티드 산스', slug: 'wanted-sans', designer: 'Wanted Lab', foundry: 'Wanted Lab',
    category: 'gothic', tags: ['고딕', 'UI', '모던', '다굵기', '브랜드'],
    license: 'ofl', css_family: 'Wanted Sans', weights: ['400', '500', '600', '700', '800', '900'],
    preview_ko: '또렷하고 현대적인 UI 고딕', preview_en: 'Modern sans for product design',
    language: 'both', supports_latin: true, is_featured: true, source: 'github',
    cdn_url: 'https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/static/complete/WantedSans.min.css',
  },
  {
    name: 'Neo둥근모', slug: 'neodgm', designer: 'Dalgona', foundry: 'neodgm',
    category: 'display', tags: ['디스플레이', '픽셀', '레트로', '게임', '도트'],
    license: 'ofl', css_family: 'NeoDunggeunmo', weights: ['400'],
    preview_ko: '추억의 도트 글꼴 둥근모꼴', language: 'both', supports_latin: true,
    source: 'github',
    cdn_url: 'https://cdn.jsdelivr.net/gh/neodgm/neodgm-webfont@1.600/neodgm/style.css',
  },
  {
    name: '갈무리11', slug: 'galmuri11', designer: 'Minseo Lee', foundry: 'Galmuri',
    category: 'display', tags: ['디스플레이', '픽셀', '레트로', '게임', '도트'],
    license: 'ofl', css_family: 'Galmuri11', weights: ['400', '700'],
    preview_ko: '닌텐도 감성의 비트맵 글꼴', language: 'both', supports_latin: true,
    source: 'github',
    cdn_url: 'https://cdn.jsdelivr.net/npm/galmuri@2.39.3/dist/galmuri.css',
  },

  // ── 눈누 (기업·기관 무료 폰트) ──
  {
    name: 'G마켓 산스', slug: 'gmarket-sans', designer: 'G마켓', foundry: 'G마켓',
    category: 'gothic', tags: ['고딕', '제목', '기업', '굵은', '인기'],
    license: 'free', css_family: 'GmarketSans', weights: ['300', '500', '700'],
    preview_ko: '시원시원한 쇼핑몰 대표 고딕', language: 'both', supports_latin: true,
    is_featured: true, source: 'noonnu',
    webfont_css: fontFace('GmarketSans', [
      [300, `${NOONNU}/noonfonts_2001@1.1/GmarketSansLight.woff`],
      [500, `${NOONNU}/noonfonts_2001@1.1/GmarketSansMedium.woff`],
      [700, `${NOONNU}/noonfonts_2001@1.1/GmarketSansBold.woff`],
    ]),
  },
  {
    name: '어그로체', slug: 'sb-aggro', designer: '샌드박스', foundry: 'SANDBOX',
    category: 'display', tags: ['디스플레이', '유튜브', '썸네일', '굵은', '강렬한'],
    license: 'free', css_family: 'SBAggro', weights: ['300', '500', '700'],
    preview_ko: '눈길을 끄는 썸네일 전용 서체', language: 'korean', supports_latin: true,
    source: 'noonnu',
    webfont_css: fontFace('SBAggro', [
      [300, `${NOONNU}/noonfonts_2108@1.1/SBAggroL.woff`],
      [500, `${NOONNU}/noonfonts_2108@1.1/SBAggroM.woff`],
      [700, `${NOONNU}/noonfonts_2108@1.1/SBAggroB.woff`],
    ]),
  },
  {
    name: '메이플스토리체', slug: 'maplestory', designer: '넥슨', foundry: '넥슨',
    category: 'display', tags: ['디스플레이', '게임', '귀여운', '둥근', '캐주얼'],
    license: 'free', css_family: 'Maplestory', weights: ['300', '700'],
    preview_ko: '모험을 떠나는 메이플 월드', language: 'korean', supports_latin: true,
    source: 'noonnu',
    webfont_css: fontFace('Maplestory', [
      [300, `${NOONNU}/noonfonts_20-04@2.1/MaplestoryOTFLight.woff`],
      [700, `${NOONNU}/noonfonts_20-04@2.1/MaplestoryOTFBold.woff`],
    ]),
  },
  {
    name: '쿠키런체', slug: 'cookierun', designer: '데브시스터즈', foundry: '데브시스터즈',
    category: 'display', tags: ['디스플레이', '게임', '귀여운', '통통한', '캐주얼'],
    license: 'free', css_family: 'CookieRun', weights: ['400'],
    preview_ko: '말랑말랑 쿠키처럼 귀여운 서체', language: 'korean', supports_latin: true,
    source: 'noonnu',
    webfont_css: fontFace('CookieRun', [
      [400, `${NOONNU}/noonfonts_2001@1.1/CookieRun-Regular.woff`],
    ]),
  },
  {
    name: '티웨이 항공체', slug: 'tway-air', designer: '티웨이항공', foundry: '티웨이항공',
    category: 'display', tags: ['디스플레이', '기업', '둥근', '경쾌한', '여행'],
    license: 'free', css_family: 'twayair', weights: ['400'],
    preview_ko: '하늘을 나는 산뜻한 여행 서체', language: 'korean', supports_latin: true,
    source: 'noonnu',
    webfont_css: fontFace('twayair', [
      [400, `${NOONNU}/noonfonts_tway@1.0/twayair.woff`],
    ]),
  },
  {
    name: '티몬 몬소리체', slug: 'tmon-monsori', designer: '티몬', foundry: '티몬',
    category: 'display', tags: ['디스플레이', '굵은', '광고', '배너', '강렬한'],
    license: 'free', css_family: 'TmonMonsori', weights: ['900'],
    preview_ko: '크게 외치는 할인 배너 서체', language: 'korean', supports_latin: true,
    source: 'noonnu',
    webfont_css: fontFace('TmonMonsori', [
      [900, `${NOONNU}/noonfonts_two@1.0/TmonMonsori.woff`],
    ]),
  },
  {
    name: '원스토어 모바일POP체', slug: 'one-mobile-pop', designer: '원스토어', foundry: '원스토어',
    category: 'display', tags: ['디스플레이', '팝', '귀여운', '광고', '캐주얼'],
    license: 'free', css_family: 'ONE-Mobile-POP', weights: ['400'],
    preview_ko: '톡톡 튀는 팝 감성 서체', language: 'korean', supports_latin: true,
    source: 'noonnu',
    webfont_css: fontFace('ONE-Mobile-POP', [
      [400, `${NOONNU}/noonfonts_2105_2@1.0/ONE-Mobile-POP.woff`],
    ]),
  },
  {
    name: '고양체', slug: 'goyang', designer: '고양시', foundry: '고양시청',
    category: 'display', tags: ['디스플레이', '지자체', '둥근', '정겨운', '제목'],
    license: 'free', css_family: 'Goyang', weights: ['400'],
    preview_ko: '꽃의 도시 고양을 담은 서체', language: 'korean', supports_latin: true,
    source: 'noonnu',
    webfont_css: fontFace('Goyang', [
      [400, `${NOONNU}/noonfonts_one@1.0/Goyang.woff`],
    ]),
  },
]

// ─── 기존 폰트 수정 ─────────────────────────────────────
// Pretendard: @font-face src 에 CSS 파일을 넣어 깨져 있던 것을 cdn_url 로 교체
const FIXES: { slug: string; patch: Record<string, unknown> }[] = [
  {
    slug: 'pretendard',
    patch: {
      cdn_url: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css',
      webfont_css: null,
    },
  },
]

async function main() {
  const records = FONTS.map(f => ({
    ...f,
    cdn_url: f.cdn_url ?? null,
    webfont_css: f.webfont_css ?? null,
    preview_en: f.preview_en ?? null,
    is_featured: f.is_featured ?? false,
    is_commercial: true,
    supports_korean: true,
  }))

  if (DRY_RUN) {
    records.forEach(r => console.log(`🔍 ${r.name} (${r.slug}) ${r.weights.join(',')}`))
    console.log(`\n${records.length}개 (dry-run, 저장 안 함)`)
    return
  }

  // 이미 있는 slug 는 갱신 — 지정하지 않은 컬럼(download_count 등)은 그대로 유지
  const { error } = await db.schema('fonts').from('fonts').upsert(records, { onConflict: 'slug' })
  if (error) { console.error('❌ upsert 실패:', error.message); process.exit(1) }
  console.log(`✅ ${records.length}개 추가/갱신`)

  for (const { slug, patch } of FIXES) {
    const { error: e } = await db.schema('fonts').from('fonts').update(patch).eq('slug', slug)
    console.log(e ? `❌ ${slug} 수정 실패: ${e.message}` : `🔧 ${slug} 수정`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
