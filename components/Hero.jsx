'use client'

import { ChevronDown, Bell } from 'lucide-react'

export default function Hero() {
  return (
    <section className="bg-brand-600 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">

        {/* 서브 레이블 */}
        <p className="text-brand-200 text-sm font-medium tracking-widest uppercase mb-4">
          caboo · AI-Powered Software Studio
        </p>

        {/* 메인 헤드라인 */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
          AI가 만드는
          <br />
          <span className="text-brand-200">도구들</span>
        </h1>

        {/* 서브 문구 */}
        <p className="text-brand-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          자동화 · 분석 · 회계 · 비즈니스,
          <br className="hidden sm:block" />
          AI가 설계하고 검증한 솔루션을 제공합니다.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-brand-700 hover:bg-brand-50 rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            프로젝트 보기
            <ChevronDown size={16} strokeWidth={2} />
          </a>
          <a
            href="#news"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#news')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 border border-brand-300 text-brand-100 hover:bg-brand-500 rounded-full text-sm font-medium transition-colors"
          >
            AI 뉴스 피드
            <Bell size={16} strokeWidth={1.5} />
          </a>
        </div>

        {/* 통계 요약 */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto border-t border-brand-500 pt-10">
          {[
            { value: '2', label: '완료' },
            { value: '4+', label: '진행 중' },
            { value: '17', label: '전체 프로젝트' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-brand-200 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 웨이브 구분선 */}
      <div className="overflow-hidden">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  )
}
