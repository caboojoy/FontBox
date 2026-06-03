import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY || anon

if (!url || !anon) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다.')
}

export const fontsDb: SupabaseClient = createClient(url, anon, {
  db: { schema: 'fonts' },
})

export const createServerClient = (): SupabaseClient =>
  createClient(url, svc, {
    db: { schema: 'fonts' },
  })

export const authClient: SupabaseClient = createClient(url, anon)

export const supabase = fontsDb
