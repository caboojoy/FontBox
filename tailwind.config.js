/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 파스텔 스카이 브랜드 팔레트
        brand: {
          50:  '#F0F9FF', // 페이지 배경
          100: '#E0F2FE', // 섹션 배경 · 카드
          200: '#BAE6FD', // 테두리 · 구분선
          300: '#7DD3FC', // 호버 강조
          400: '#38BDF8', // CTA 버튼 · 주요 액센트
          500: '#0EA5E9', // 버튼 호버
          600: '#0284C7', // 네비게이션 · 로고 · 헤더
          700: '#0369A1', // 강조 텍스트
          800: '#075985', // 다크 텍스트
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
