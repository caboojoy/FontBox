/**
 * lib/supabase.ts — 스키마별 격리된 클라이언트
 *
 * ★ 핵심 원칙
 *   - 각 앱은 자신의 스키마 클라이언트만 사용
 *   - 다른 앱의 클라이언트를 import 금지
 *   - PostgREST의 Content-Profile 헤더로 스키마를 강제 지정
 *     → DB가 해당 스키마 외 테이블 요청을 자동 거부
 *
 * ★ 새 앱 추가 시
 *   1. lib/clients/[앱명].ts 파일 생성
 *   2. 해당 파일에 스키마 클라이언트만 export
 *   3. 앱 코드에서 lib/clients/[앱명].ts 만 import
 */

import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co'
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY || anon

// ─────────────────────────────────────────────
// FontBox 전용 클라이언트 — fonts 스키마만 접근
// accounting, shopping 등 다른 스키마 접근 불가
// ─────────────────────────────────────────────
export const fontsDb = createClient(url, anon, {
  db: { schema: 'fonts' },  // Content-Profile: fonts 헤더 강제
})

// 서버 액션 전용 (service_role — RLS 우회, 여전히 fonts 스키마만)
export const createServerClient = () =>
  createClient(url, svc, {
    db: { schema: 'fonts' },
  })

// 공통 인증용 (public 스키마 — auth.users 연동)
export const authClient: SupabaseClient = createClient(url, anon)

// 하위 호환 별칭
export const supabase = fontsDb

// ─────────────────────────────────────────────
// 다른 앱 클라이언트 예시
// 각 앱 개발 시 lib/clients/ 폴더에 별도 파일로 분리
//
// lib/clients/accounting.ts:
//   export const accountingDb = createClient(url, anon, { db: { schema: 'accounting' } })
//
// lib/clients/shopping.ts:
//   export const shoppingDb = createClient(url, anon, { db: { schema: 'shopping' } })
//
// lib/clients/stock.ts:
//   export const stockDb = createClient(url, anon, { db: { schema: 'stock' } })
// ─────────────────────────────────────────────
