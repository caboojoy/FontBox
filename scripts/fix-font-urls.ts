/**
 * fix-font-urls.ts
 *
 * 웹폰트 주소가 404 로 죽어 있던 폰트의 @font-face 를 살아 있는 주소로 바꾼다 (2026-11-15 점검).
 * 대부분 눈누 CDN(jsDelivr projectnoonnu) 의 저장소·파일 이름이 실제와 달랐다.
 * 파일이 한 굵기만 있는 폰트는 weights 도 그에 맞춘다.
 *
 * 실행:  npx tsx scripts/fix-font-urls.ts [--dry-run]     (--dry-run: 새 주소가 열리는지만 확인, 저장 안 함)
 * 환경변수 (.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')
const NOONNU = 'https://cdn.jsdelivr.net/gh/projectnoonnu'
const NANUM_SQUARE = 'https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0'

type Face = [weight: number, url: string]
interface Fix { slug: string; family: string; faces: Face[]; name?: string }

// family 는 DB 의 css_family 와 같아야 한다
const FIXES: Fix[] = [
  { slug: 'baemin-hanna',         family: 'BM-HANNA',          faces: [[400, `${NOONNU}/noonfonts_seven@1.2/BMHANNAPro.woff`]] },
  { slug: 'baemin-dohyeon',       family: 'BM-DoHyeon',        faces: [[400, `${NOONNU}/noonfonts_one@1.0/BMDOHYEON.woff`]] },
  { slug: 'baemin-jua',           family: 'BM-JUA',            faces: [[400, `${NOONNU}/noonfonts_one@1.0/BMJUA.woff`]] },
  { slug: 'baemin-girang-harang', family: 'BM-Kirang-HaeRang', faces: [[400, `${NOONNU}/noonfonts_one@1.0/BMKIRANGHAERANG.woff`]] },
  { slug: 'baemin-yeonsung',      family: 'BM-YEONSUNG',       faces: [[400, `${NOONNU}/noonfonts_one@1.0/BMYEONSUNG.woff`]] },
  { slug: 'bingrae-ddaom',        family: 'BinggraeDdaom',     faces: [[400, `${NOONNU}/noonfonts_2302@1.1/BinggraeTaom.woff2`]] },
  { slug: 'cafe24-surround',      family: 'Cafe24Surround',    faces: [[400, `${NOONNU}/noonfonts_2105_2@1.1/Cafe24Ssurround.woff`]] },
  { slug: 'cafe24-gounbam',       family: 'Cafe24Gounbam',     faces: [[400, `${NOONNU}/noonfonts_twelve@1.2/Cafe24Oneprettynight.woff`]] },
  // ChosunGu 는 조선굴림체다. '조선일보고딕'으로 등록돼 있던 이름도 바로잡는다
  { slug: 'chosun-gothic',        family: 'ChosunGu',          faces: [[400, `${NOONNU}/noonfonts_20-04@2.3/ChosunGu.woff`]], name: '조선굴림체' },
  { slug: 'chosun-myeongjo',      family: 'ChosunMyeongjo',    faces: [[400, `${NOONNU}/noonfonts_one@1.0/Chosunilbo_myungjo.woff`]] },
  { slug: 'gangwon-edu-modu',     family: 'Gangwon Edu Modu',  faces: [[400, `${NOONNU}/noonfonts_2201-2@1.0/GangwonEdu_OTFBoldA.woff`]] },
  { slug: 'gabia-flat-block',     family: 'GabiaFlatBlock',    faces: [[400, `${NOONNU}/noonfonts_two@1.0/NapjakBlock.woff`]] },
  { slug: 'gabia-solmee',         family: 'GabiaSolmee',       faces: [[400, `${NOONNU}/noonfonts_one@1.0/GabiaSolmee.woff`]] },
  { slug: 'jalnan',               family: 'Jalnan',            faces: [[400, `${NOONNU}/noonfonts_four@1.2/JalnanOTF00.woff`]] },
  { slug: 'mapo-kkotseom',        family: 'MapoFlowerIsland',  faces: [[400, `${NOONNU}/noonfonts_2001@1.4/MapoFlowerIslandA.woff`]] },
  { slug: 'mapo-dacapo',          family: 'MapoDacapo',        faces: [[400, `${NOONNU}/noonfonts_2001@1.4/MapoDacapoA.woff`]] },
  { slug: 'kyobo-handwriting',    family: 'KyoboHandwriting2021', faces: [[400, `${NOONNU}/noonfonts_2212@1.0/KyoboHandwriting2021sjy.woff2`]] },
  { slug: 'lee-soon-sin-dotum',   family: 'Lee Soon Sin Dotum', faces: [[400, `${NOONNU}/noonfonts_two@1.0/YiSunShinDotumM.woff`]] },
  { slug: 'jeonju-wanpanbon',     family: 'Jeonju Wanpanbon',  faces: [[400, `${NOONNU}/noonfonts_2102-01@1.0/Jeonju_soonR.woff`]] },
  { slug: 'gyeonggi-millennium-batang', family: 'Gyeonggi Millennium Batang', faces: [[400, `${NOONNU}/noonfonts_one@1.0/GyeonggiBatang.woff`]] },
  // 아래는 CDN 에 한 굵기만 있다 → weights 도 줄인다
  { slug: 'gyeonggi-millennium-title',  family: 'Gyeonggi Millennium Title',  faces: [[500, `${NOONNU}/noonfonts_one@1.0/GyeonggiTitleM.woff`]] },
  { slug: 'seoul-hangang',        family: 'Seoul Hangang',     faces: [[500, `${NOONNU}/noonfonts_two@1.0/SeoulHangangM.woff`]] },
  { slug: 'seoul-namsan',         family: 'Seoul Namsan',      faces: [[500, `${NOONNU}/noonfonts_two@1.0/SeoulNamsanM.woff`]] },
  { slug: 'nanum-square-round',   family: 'NanumSquareRound',  faces: [[400, `${NOONNU}/noonfonts_two@1.0/NanumSquareRound.woff`]] },
  { slug: 'nanum-square',         family: 'NanumSquare',       faces: [
    [300, `${NANUM_SQUARE}/NanumSquareL.woff2`], [400, `${NANUM_SQUARE}/NanumSquareR.woff2`],
    [700, `${NANUM_SQUARE}/NanumSquareB.woff2`], [800, `${NANUM_SQUARE}/NanumSquareEB.woff2`],
  ] },
]

// 대체 주소를 찾지 못한 폰트 — 눈누 CDN 에 해당 파일이 없다. 이름 자체가 실제 폰트와 맞는지 확인이 필요하다.
const UNRESOLVED = ['nexon-lope', 'sk-stoa', 'ongeulip-parkdayeon', 'ongeulip-uiseong']

function fontFace(family: string, faces: Face[]): string {
  return faces
    .map(([w, url]) =>
      `@font-face { font-family: "${family}"; src: url("${url}") format("${url.endsWith('.woff2') ? 'woff2' : 'woff'}"); font-weight: ${w}; font-display: swap; }`)
    .join('\n')
}

async function main() {
  // 새 주소가 실제로 열리는지 먼저 확인한다. 하나라도 죽어 있으면 저장하지 않는다.
  let dead = 0
  for (const fix of FIXES) {
    for (const [, url] of fix.faces) {
      const res = await fetch(url, { method: 'HEAD' })
      if (!res.ok) { dead++; console.error(`❌ ${fix.slug}: ${res.status} ${url}`) }
    }
  }
  if (dead) { console.error(`\n새 주소 ${dead}개가 열리지 않아 중단합니다.`); process.exit(1) }
  console.log(`✅ 새 주소 ${FIXES.reduce((n, f) => n + f.faces.length, 0)}개 모두 열림`)

  if (DRY_RUN) {
    FIXES.forEach(f => console.log(`🔍 ${f.slug} → ${f.faces.map(([w]) => w).join(',')}`))
    console.log(`\n${FIXES.length}개 (dry-run, 저장 안 함). 미해결: ${UNRESOLVED.join(', ')}`)
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
    process.exit(1)
  }
  const db = createClient(url, key)

  let ok = 0
  for (const fix of FIXES) {
    const { data, error } = await db.schema('fonts').from('fonts')
      .update({
        webfont_css: fontFace(fix.family, fix.faces),
        weights: fix.faces.map(([w]) => String(w)),
        ...(fix.name ? { name: fix.name } : {}),
      })
      .eq('slug', fix.slug)
      .eq('css_family', fix.family)        // css_family 가 다르면 건드리지 않는다
      .select('slug')
    if (error) console.error(`❌ ${fix.slug}: ${error.message}`)
    else if (!data?.length) console.error(`⚠️ ${fix.slug}: 대상 없음 (slug 또는 css_family 가 다름)`)
    else { ok++; console.log(`🔧 ${fix.slug}`) }
  }
  console.log(`\n${ok}/${FIXES.length}개 수정. 미해결: ${UNRESOLVED.join(', ')}`)
}

main().catch(err => { console.error(err); process.exit(1) })
