'use client'

import { useState } from 'react'
import { Sparkles, Send, Lightbulb, ArrowRight } from 'lucide-react'
import { getAIRecommendation } from '@/actions/ai'
import { AIRecommendation } from '@/types'
import FontCard from '@/components/FontCard'

const EXAMPLE_PROMPTS = [
  '따뜻하고 친근한 느낌의 브랜드 로고용 한글 폰트',
  '개발자 포트폴리오 사이트에 어울리는 영문 모노스페이스',
  '웨딩 초대장에 쓸 우아한 영문 필기체',
  '앱 UI에 가독성 좋은 한글+영문 혼용 폰트',
  '강렬하고 임팩트 있는 포스터용 디스플레이 폰트',
  '카페 메뉴판에 어울리는 손글씨 느낌 폰트',
]

export default function AIPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIRecommendation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!prompt.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    const res = await getAIRecommendation(prompt)

    if ('error' in res) {
      setError(res.error)
    } else {
      setResult(res)
    }
    setLoading(false)
  }

  const handleExample = (text: string) => {
    setPrompt(text)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/* 헤더 */}
      <div className="text-center mb-10 animate-fade-up">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
          style={{
            background: 'rgba(30,144,255,0.12)',
            color: 'var(--accent)',
            border: '1px solid rgba(30,144,255,0.2)',
          }}
        >
          <Sparkles size={14} />
          AI 폰트 추천
        </div>
        <h1 className="font-display text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          어떤 폰트를 찾고 계세요?
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          사용 목적, 분위기, 스타일을 자유롭게 설명해주세요.
          <br />
          AI가 딱 맞는 폰트를 추천해드립니다.
        </p>
      </div>

      {/* 입력창 */}
      <form onSubmit={handleSubmit} className="mb-8 animate-fade-up delay-100">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1.5px solid var(--border)', background: 'rgba(255,255,255,0.3)' }}
        >
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="예: 따뜻하고 친근한 느낌의 카페 브랜딩용 한글 폰트를 찾고 있어요. 손글씨 느낌이면 더 좋겠어요."
            rows={3}
            className="w-full p-4 bg-transparent text-sm outline-none resize-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Enter로 전송 · Shift+Enter로 줄바꿈
            </p>
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Send size={13} />
                  추천받기
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 예시 프롬프트 */}
      {!result && !loading && (
        <div className="animate-fade-up delay-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              이런 것도 물어볼 수 있어요
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_PROMPTS.map(ex => (
              <button
                key={ex}
                onClick={() => handleExample(ex)}
                className="flex items-center gap-2 p-3 rounded-xl text-left text-sm transition-all hover:border-sky-accent"
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <ArrowRight size={12} style={{ flexShrink: 0, color: 'var(--accent)' }} />
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div
          className="p-4 rounded-xl text-sm animate-fade-in"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#dc2626',
          }}
        >
          {error}
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div className="space-y-6 animate-fade-up">
          {/* AI 설명 */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(30,144,255,0.06)',
              border: '1px solid rgba(30,144,255,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                AI 추천 이유
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {result.reasoning}
            </p>
            {result.pairing_tip && (
              <p
                className="text-sm mt-3 pt-3 border-t leading-relaxed"
                style={{ borderColor: 'rgba(30,144,255,0.15)', color: 'var(--text-muted)' }}
              >
                💡 {result.pairing_tip}
              </p>
            )}
          </div>

          {/* 추천 폰트 카드 */}
          {result.fonts && result.fonts.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
                추천 폰트 {result.fonts.length}개
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.fonts.map((font, i) => (
                  <FontCard key={font.id} font={font} animationDelay={i * 80} />
                ))}
              </div>
            </div>
          )}

          {/* 다시 검색 */}
          <button
            onClick={() => { setResult(null); setPrompt('') }}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            다시 추천받기
          </button>
        </div>
      )}
    </div>
  )
}
