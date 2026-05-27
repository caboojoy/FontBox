import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/ai`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pairing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  // 폰트 상세 페이지 (DB에서 동적으로 생성)
  try {
    const db = createServerClient()
    const { data: fonts } = await db
      .from('fonts')
      .select('slug, updated_at')

    const fontPages: MetadataRoute.Sitemap = (fonts || []).map(font => ({
      url: `${SITE_URL}/fonts/${font.slug}`,
      lastModified: new Date(font.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...fontPages]
  } catch {
    return staticPages
  }
}
