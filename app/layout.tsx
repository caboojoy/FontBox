import type { Metadata } from 'next'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import './globals.css'
import Image from 'next/image'


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FontBox — 한글·영문 무료 웹폰트 모음',
    template: '%s | FontBox',
  },
  description: '한글과 영문 무료 웹폰트 55개+를 한 곳에서. 실시간 미리보기, AI 폰트 추천, CSS 코드 자동 생성. 상업적 이용 가능한 무료 폰트.',
  keywords: [
    '웹폰트', '한글폰트', '영문폰트', '무료폰트', '폰트추천',
    '상업용폰트', '무료한글폰트', 'webfont', 'free font', 'google fonts',
    '나눔폰트', '고딕체', '명조체', 'CSS폰트', '폰트모음',
  ],
  authors: [{ name: 'FontBox' }],
  creator: 'FontBox',
  publisher: 'FontBox',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'FontBox — 한글·영문 무료 웹폰트 모음',
    description: '한글과 영문 무료 웹폰트 55개+. AI 추천, 실시간 미리보기, CSS 코드 자동 생성.',
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: 'FontBox',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FontBox — 한글·영문 무료 웹폰트 모음',
    description: '한글과 영문 무료 웹폰트 55개+. AI 추천, 실시간 미리보기.',
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: 'a5NOfXxOOAjwioA0dxpf1uvUE1i9vZUhZhpw8F3FEwk',
    other: {
      'naver-site-verification': ['baca438580f1db8f3e992fca7f2148d905224e8d'],
    },
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <div className="relative z-10">
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <footer style={{
              padding: '48px 24px',
              marginTop: 64,
              borderTop: '1px solid #e2e8f0',
            }}>
              <div style={{
                maxWidth: 1280,
                margin: '0 auto',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 12, color: '#94a3b8', opacity: 0.6, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Made with{' '}
                  <Image
                    src="/caboo_blue_02.png"
                    alt="FontBox"
                    width={20}
                    height={20}
                    style={{ borderRadius: 4 }}
                  />
                  {' '}FontBox
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}

