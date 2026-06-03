import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const fontsDb = createClient(url, anon, {
  db: { schema: 'fonts' },
})

export const supabase = fontsDb
