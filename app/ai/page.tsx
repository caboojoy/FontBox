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
  const [prompt, setPrompt]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<AIRecommendation | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!prompt.trim() || loading) return
    setLoading(true); setError(null); setResult(null)
    const res = await getAIRecommendation(prompt)
    if ('error' in res) setError(res.error)
    else setResult(res)
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '96px 24px 80px' }}>

      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 100, marginBottom: 20,
          background: 'rgba(30,144,255,0.08)', border: '1px solid rgba(30,144,255,0.2)',
          color: '#1E90FF', fontSize: 13, fontWeight: 600,
        }}>
          <Sparkles size={13} /> AI 폰트 추천
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' }}>
          어떤 폰트를 찾고 계세요?
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7 }}>
          사용 목적, 분위기, 스타일을 자유롭게 설명해주세요.<br />
          AI가 딱 맞는 폰트를 추천해드립니다.
        </p>
      </div>

      {/* 입력창 */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          border: '1.5px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSubmit()} }}
            placeholder="예: 따뜻하고 친근한 느낌의 카페 브랜딩용 한글 폰트를 찾고 있어요."
            rows={3}
            style={{
              width: '100%', padding: '18px 20px',
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: 15, color: '#0f172a', resize: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid #f1f5f9',
          }}>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Enter로 전송 · Shift+Enter로 줄바꿈</p>
            <button type="submit" disabled={!prompt.trim()||loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: '#1E90FF', color: '#ffffff',
                opacity: (!prompt.trim()||loading) ? 0.5 : 1,
              }}>
              {loading
                ? <><span style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',animation:'spin 0.8s linear infinite',display:'inline-block' }}/>분석 중...</>
                : <><Send size={13}/>추천받기</>}
            </button>
          </div>
        </div>
      </form>

      {/* 예시 프롬프트 */}
      {!result && !loading && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Lightbulb size={13} style={{ color: '#94a3b8' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>이런 것도 물어볼 수 있어요</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {EXAMPLE_PROMPTS.map(ex => (
              <button key={ex} onClick={() => setPrompt(ex)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                  border: '1.5px solid #e2e8f0', background: '#ffffff',
                  fontSize: 13, color: '#475569', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                <ArrowRight size={12} style={{ color: '#1E90FF', flexShrink: 0 }} />
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div style={{
          padding: '14px 18px', borderRadius: 12,
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* AI 설명 */}
          <div style={{
            padding: '20px', borderRadius: 16,
            background: 'rgba(30,144,255,0.04)', border: '1px solid rgba(30,144,255,0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Sparkles size={14} style={{ color: '#1E90FF' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1E90FF' }}>AI 추천 이유</span>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{result.reasoning}</p>
            {result.pairing_tip && (
              <p style={{
                fontSize: 13, color: '#64748b', marginTop: 10, paddingTop: 10,
                borderTop: '1px solid rgba(30,144,255,0.1)',
              }}>
                💡 {result.pairing_tip}
              </p>
            )}
          </div>

          {/* 폰트 카드 */}
          {result.fonts && result.fonts.length > 0 && (
            <div>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>
                추천 폰트 {result.fonts.length}개
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                {result.fonts.map(font => (
                  <FontCard key={font.id} font={font} />
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { setResult(null); setPrompt('') }}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 500,
              border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#64748b', cursor: 'pointer',
            }}>
            다시 추천받기
          </button>
        </div>
      )}
    </div>
  )
}
