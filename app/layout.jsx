import './globals.css'

export const metadata = {
  title: 'caboo — AI가 만드는 도구들',
  description: '자동화 · 분석 · 회계 · 비즈니스, AI가 설계하고 실무가 검증한 솔루션',
  keywords: ['AI 도구', 'AI 자동화', '회계 AI', '1인 사업', 'caboo'],
  icons: {
    icon: '/caboo_blue_02.png',
    apple: '/caboo_blue_02.png',
  },
  verification: {
    google: 'q-nyXudpr8auCvojo61jyc5u1tiRwwVgfVRlZwyhXbQ',
  },
  verification: {
    google: 'OGIACsFe9tioMIpPIN_g6V704Mq8WgpzSY37eOs5L2o',
    other: {
      'naver-site-verification': ['fb5b01a3fb33c297fb23a0c2b81f5b07df24e0c3'],
    },
  },
  openGraph: {
    title: 'caboo — AI가 만드는 도구들',
    description: '자동화 · 분석 · 회계 · 비즈니스, AI가 설계하고 실무가 검증한 솔루션',
    url: 'https://caboo.net',
    siteName: 'caboo',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
