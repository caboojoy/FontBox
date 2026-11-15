import { MetadataRoute } from 'next'

// 환경변수 끝에 줄바꿈이 섞여 있어도 Sitemap 줄이 깨지지 않게 다듬는다
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://myfontbox.vercel.app')
  .trim()
  .replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/debug'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
