import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY || anon

// 환경변수 누락 시 명확한 에러
if (!url || !anon) {
  throw new Error(`Supabase 환경변수 누락: URL=${url}, ANON=${anon ? '있음' : '없음'}`)
}

export const fontsDb: SupabaseClient = createClient(url, anon, {
  db: { schema: 'fonts' },
})

export const createServerClient = (): SupabaseClient =>
  createClient(url, svc!, {
    db: { schema: 'fonts' },
  })

export const authClient: SupabaseClient = createClient(url, anon)
export const supabase = fontsDb