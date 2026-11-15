import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase-server'

// 1시간마다 다시 생성 — DB에 폰트를 넣거나 지우면 재배포 없이 반영된다
export const revalidate = 3600

// 환경변수 끝에 줄바꿈이 섞여 있어도 주소가 깨지지 않게 다듬는다
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://myfontbox.vercel.app')
  .trim()
  .replace(/\/$/, '')

const PAGE = 1000   // Supabase 가 한 번에 돌려주는 최대 행 수

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,              lastModified: now, changeFrequency: 'daily',  priority: 1.0 },
    { url: `${SITE_URL}/ai`,      lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/pairing`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  // DB의 모든 폰트 상세 페이지
  try {
    const db = createServerClient()
    const fonts: { slug: string; updated_at: string | null }[] = []
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await db
        .from('fonts')
        .select('slug, updated_at')
        .order('slug')
        .range(from, from + PAGE - 1)
      if (error) throw error
      fonts.push(...(data ?? []))
      if (!data || data.length < PAGE) break
    }

    const fontPages: MetadataRoute.Sitemap = fonts.map(font => ({
      url: `${SITE_URL}/fonts/${font.slug}`,
      lastModified: font.updated_at ? new Date(font.updated_at) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...fontPages]
  } catch (e) {
    // DB 접근 실패 시 정적 페이지만 반환
    console.error('sitemap: 폰트 목록 조회 실패', e)
    return staticPages
  }
}
