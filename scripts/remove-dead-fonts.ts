/**
 * remove-dead-fonts.ts
 *
 * 웹폰트 파일을 찾을 수 없는 폰트를 목록에서 삭제한다 (2026-11-15 점검).
 * 눈누 CDN 전체에서 대체 파일을 찾지 못한 4종이 대상이다.
 *
 * 안전장치: 삭제 직전에 주소를 다시 확인해, 웹폰트 주소가 하나라도 열리는 폰트는 지우지 않는다.
 * 삭제한 행은 되돌릴 수 없으므로, 지우기 전 내용을 JSON 으로 출력한다(필요하면 복사해 둔다).
 *
 * 실행:  npx tsx scripts/remove-dead-fonts.ts [--dry-run]
 * 환경변수 (.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')
const TARGETS = ['nexon-lope', 'sk-stoa', 'ongeulip-parkdayeon', 'ongeulip-uiseong']

function urlsOf(row: { cdn_url: string | null; webfont_css: string | null }): string[] {
  const inCss = [...(row.webfont_css ?? '').matchAll(/url\(["']?([^"')]+)/g)].map(m => m[1])
  return [...(row.cdn_url ? [row.cdn_url] : []), ...inCss]
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
    process.exit(1)
  }
  const db = createClient(url, key)

  const { data: rows, error } = await db.schema('fonts').from('fonts').select('*').in('slug', TARGETS)
  if (error) { console.error('❌ 조회 실패:', error.message); process.exit(1) }

  const toDelete: string[] = []
  for (const row of rows ?? []) {
    const urls = urlsOf(row)
    const alive: string[] = []
    for (const u of urls) {
      const res = await fetch(u, { method: 'HEAD' }).catch(() => null)
      if (res?.ok) alive.push(u)
    }
    if (alive.length || urls.length === 0) {
      console.log(`⏭️  ${row.slug} (${row.name}): 건너뜀 — ${urls.length ? '열리는 주소가 있음' : '주소가 없음'}`)
      continue
    }
    console.log(`🗑️  ${row.slug} (${row.name}): 주소 ${urls.length}개 모두 404`)
    console.log(JSON.stringify(row))
    toDelete.push(row.slug)
  }
  const missing = TARGETS.filter(s => !(rows ?? []).some(r => r.slug === s))
  if (missing.length) console.log(`ℹ️  DB 에 없음: ${missing.join(', ')}`)

  if (DRY_RUN || toDelete.length === 0) {
    console.log(`\n삭제 대상 ${toDelete.length}개${DRY_RUN ? ' (dry-run, 삭제 안 함)' : ''}`)
    return
  }

  const { data: deleted, error: delErr } = await db.schema('fonts').from('fonts')
    .delete().in('slug', toDelete).select('slug')
  if (delErr) { console.error('❌ 삭제 실패:', delErr.message); process.exit(1) }
  console.log(`\n✅ ${deleted?.length ?? 0}개 삭제: ${(deleted ?? []).map(d => d.slug).join(', ')}`)
}

main().catch(err => { console.error(err); process.exit(1) })
