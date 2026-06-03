/**
 * lib/clients/fonts.ts — FontBox 전용 클라이언트
 *
 * FontBox 앱 코드에서는 이 파일만 import
 * 다른 스키마(accounting, shopping 등) 접근 불가
 */
export { fontsDb, createServerClient } from '@/lib/supabase'
