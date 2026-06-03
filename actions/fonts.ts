'use server'

import { createServerClient } from '@/lib/supabase-server'
import { Font } from '@/types'

// 검색어의 ilike 특수문자 이스케이프 (%, _ 는 SQL 와일드카드)
function escapeLike(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&')
}

export async function getFonts(filters: {
  language?: string
  category?: string
  license?: string
  search?: string
  sort?: string
} = {}): Promise<Font[]> {
  const db = createServerClient()
  let query = db.from('fonts').select('*')

  if (filters.language && filters.language !== 'all') {
    if (filters.language === 'korean')  query = query.eq('supports_korean', true)
    if (filters.language === 'english') query = query.eq('supports_latin', true).neq('language', 'korean')
    if (filters.language === 'both')    query = query.eq('language', 'both')
  }
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }
  if (filters.license && filters.license !== 'all') {
    query = query.eq('license', filters.license)
  }
  if (filters.search?.trim()) {
    // 특수문자 이스케이프 후 검색
    const q = escapeLike(filters.search.trim())
    query = query.or(
      `name.ilike.%${q}%,designer.ilike.%${q}%,foundry.ilike.%${q}%`
    )
  }

  switch (filters.sort) {
    case 'popular': query = query.order('download_count', { ascending: false }); break
    case 'newest':  query = query.order('created_at',     { ascending: false }); break
    case 'name':    query = query.order('name',           { ascending: true  }); break
    default:
      query = query
        .order('is_featured',    { ascending: false })
        .order('download_count', { ascending: false })
  }

  const { data, error } = await query
  if (error) { console.error('getFonts:', error); return [] }
  return (data as Font[]) || []
}

export async function getFontBySlug(slug: string): Promise<Font | null> {
  const db = createServerClient()
  const { data, error } = await db
    .from('fonts').select('*').eq('slug', slug).single()
  if (error) return null

  // 조회수 증가 — await 추가 (Vercel serverless에서 floating promise 방지)
  await db.from('fonts')
    .update({ download_count: (data.download_count || 0) + 1 })
    .eq('id', data.id)

  return data as Font
}

export async function getSimilarFonts(font: Font, limit = 4): Promise<Font[]> {
  const db = createServerClient()
  const { data } = await db
    .from('fonts').select('*')
    .eq('category', font.category)
    .eq('language', font.language)
    .neq('id', font.id)
    .limit(limit)
  return (data as Font[]) || []
}

export async function addFont(
  font: Omit<Font, 'id' | 'created_at' | 'updated_at' | 'download_count'>
): Promise<{ success: boolean; error?: string }> {
  const db = createServerClient()
  const { error } = await db.from('fonts').insert({ ...font, download_count: 0 })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updateFont(
  id: string,
  updates: Partial<Font>
): Promise<{ success: boolean; error?: string }> {
  const db = createServerClient()
  const { error } = await db.from('fonts').update(updates).eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteFont(id: string): Promise<{ success: boolean; error?: string }> {
  const db = createServerClient()
  const { error } = await db.from('fonts').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getFontStats(): Promise<{
  total: number; korean: number; english: number; both: number; featured: number
}> {
  const db = createServerClient()
  const { data } = await db
    .from('fonts')
    .select('language, is_featured, supports_korean')

  if (!data) return { total: 0, korean: 0, english: 0, both: 0, featured: 0 }

  return {
    total:    data.length,
    korean:   data.filter(f => f.supports_korean).length,
    english:  data.filter(f => f.language === 'english').length,
    both:     data.filter(f => f.language === 'both').length,
    featured: data.filter(f => f.is_featured).length,
  }
}
