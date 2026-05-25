import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? anon

// public 스키마 클라이언트 (기본)
export const supabase = createClient(url, anon)

// ─────────────────────────────────────────────────────────────
// fontsDb: fonts 스키마 클라이언트
//
// Supabase Settings → API → Exposed schemas 에
// "fonts" 를 추가했다면 이 설정이 동작합니다.
//
// 만약 여전히 0개가 나온다면:
//   1. 아래 SCHEMA 값을 'public' 으로 변경
//   2. Supabase SQL Editor 에서 아래 실행:
//      ALTER TABLE fonts.fonts     SET SCHEMA public;
//      ALTER TABLE fonts.ai_cache  SET SCHEMA public;
//      ALTER TABLE fonts.favorites SET SCHEMA public;
// ─────────────────────────────────────────────────────────────
const SCHEMA = 'public'   // fonts 스키마 이슈로 public으로 이동

export const fontsDb = createClient(url, anon, {
  db: { schema: SCHEMA },
})

// 서버 액션 전용 (service_role)
export const createServerClient = () =>
  createClient(url, svc, {
    db: { schema: SCHEMA },
  })
