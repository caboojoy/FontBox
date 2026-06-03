import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app'
).replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/ai`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/pairing`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  ]

  // DB에서 폰트 페이지 동적 추가
  try {
    const { createServerClient } = await import('@/lib/supabase')
    const db = createServerClient()
    const { data: fonts } = await db
      .from('fonts')
      .select('slug, updated_at')
      .limit(500)

    const fontPages: MetadataRoute.Sitemap = (fonts || []).map(font => ({
      url: `${SITE_URL}/fonts/${font.slug}`,
      lastModified: new Date(font.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...fontPages]
  } catch {
    // DB 접근 실패 시 정적 페이지만 반환
    return staticPages
  }
}
