import type { Metadata } from 'next'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'FontBox — 한글·영문 무료 웹폰트 모음',
    template: '%s | FontBox',
  },
  description:
    '한글과 영문 무료 웹폰트를 한 곳에서. 실시간 미리보기, AI 추천, CSS 코드 자동 생성.',
  keywords: ['웹폰트', '한글폰트', '영문폰트', '무료폰트', '폰트추천', 'font', 'webfont'],
  openGraph: {
    title: 'FontBox — 한글·영문 무료 웹폰트 모음',
    description: '한글과 영문 무료 웹폰트를 한 곳에서. AI가 추천해드립니다.',
    type: 'website',
    locale: 'ko_KR',
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
                <p style={{ fontSize: 13, color: '#94a3b8' }}>
                  © 2025 FontBox. 모든 폰트의 저작권은 각 폰트 저작권자에게 있습니다.
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8', opacity: 0.6, marginTop: 6 }}>
                  Made with 🔤 FontBox
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}

