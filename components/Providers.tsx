'use client'

// next-themes 제거 — 라이트 모드 고정
// 다크모드가 필요하면 나중에 추가
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
