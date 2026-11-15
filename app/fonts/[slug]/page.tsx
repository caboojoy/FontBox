  import { Metadata } from 'next'
  import { notFound } from 'next/navigation'
  import { cache } from 'react'
  import { getFontBySlug, getSimilarFonts, getAllFontSlugs } from '@/actions/fonts'
  import FontDetailClient from './FontDetailClient'

  // force-dynamic 제거 → 정적 생성으로 전환
  // export const dynamic = 'force-dynamic'  ← 이 줄 삭제

  // 1시간마다 다시 생성 — DB에 새로 넣은 폰트가 재배포 없이 열리고,
  // 등록 전에 한 번 404로 응답한 주소도 풀린다
  export const revalidate = 3600

  // React cache로 같은 요청 내 중복 쿼리 방지
  const getCachedFont = cache(getFontBySlug)

  // 빌드 시 모든 폰트 slug를 정적 페이지로 생성
  export async function generateStaticParams() {
    const slugs = await getAllFontSlugs()
    return slugs.map((slug) => ({ slug }))
  }

  interface Props {
    params: { slug: string }
  }

  export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const font = await getCachedFont(params.slug)  // cache 적용
    if (!font) return {}
    const title = `${font.name} — 무료 웹폰트`
    const description = `${font.name}을(를) 무료로 사용하세요. ${font.category} 계열, ${font.license} 라이선스. 웹폰트 CSS 코드를 바로 복사하세요.`
    const path = `/fonts/${font.slug}`
    return {
      title,
      description,
      // 이 페이지 자신의 주소를 대표 주소로 — 검색엔진이 폰트 페이지를 따로 색인하게 한다
      alternates: { canonical: path },
      openGraph: {
        title: `${title} | FontBox`,
        description,
        url: path,
        type: 'website',
        locale: 'ko_KR',
        siteName: 'FontBox',
      },
    }
  }

  export default async function FontDetailPage({ params }: Props) {
    const font = await getCachedFont(params.slug)  // 위와 같은 요청이면 캐시 hit

    if (!font) return notFound()

    const similarFonts = await getSimilarFonts(font, 4)

    return <FontDetailClient font={font} similarFonts={similarFonts} />
  }
  