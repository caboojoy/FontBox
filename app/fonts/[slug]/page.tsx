import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFontBySlug, getSimilarFonts } from '@/actions/fonts'
import FontDetailClient from './FontDetailClient'

// Supabase를 런타임에 호출 → 빌드 시 정적 생성 시도 안 함
export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const font = await getFontBySlug(params.slug)
  if (!font) return {}
  return {
    title: `${font.name} — 무료 웹폰트`,
    description: `${font.name}을(를) 무료로 사용하세요. ${font.category} 계열, ${font.license} 라이선스. 웹폰트 CSS 코드를 바로 복사하세요.`,
  }
}

export default async function FontDetailPage({ params }: Props) {
  const font = await getFontBySlug(params.slug)

  // notFound()는 never를 반환하므로 아래부터 font는 non-null
  if (!font) return notFound()

  const similarFonts = await getSimilarFonts(font, 4)

  return <FontDetailClient font={font} similarFonts={similarFonts} />
}
