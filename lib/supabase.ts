import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co'
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY || anon

// 기본 클라이언트 — schema 옵션 없이 사용 (public 기본값)
export const supabase = createClient(url, anon)
export const fontsDb  = supabase   // 별칭 (하위호환)

// 서버 액션 전용
export const createServerClient = () => createClient(url, svc)
