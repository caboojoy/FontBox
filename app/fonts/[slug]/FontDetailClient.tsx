'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, Heart, Download } from 'lucide-react'
import { Font } from '@/types'
import { generateCSSCode, getDefaultPreviewText, getLicenseLabel, getLanguageLabel, getCategoryLabel, getDownloadUrl } from '@/lib/fonts'
import FontCard from '@/components/FontCard'

interface Props {
  font: Font
  similarFonts: Font[]
}

const SAMPLE_TEXTS: Record<string, string[]> = {
  korean: [
    '다람쥐 헌 쳇바퀴에 타고파',
    '가나다라마바사아자차카타파하',
    '세상의 모든 글자는 아름답다',
    '디자인은 말 없이 말한다',
  ],
  english: [
    'The quick brown fox jumps over the lazy dog',
    'Typography is the art of arranging type',
    'Good design is good business',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ],
  both: [
    '디자인 스튜디오 Design Studio 2025',
    '브랜드 아이덴티티 Brand Identity',
    'Hello 안녕하세요 World 세계',
  ],
}

export default function FontDetailClient({ font, similarFonts }: Props) {
  const [copied, setCopied]         = useState(false)
  const [previewText, setPreviewText] = useState(getDefaultPreviewText(font))
  const [previewSize, setPreviewSize] = useState(40)
  const [fontLoaded, setFontLoaded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  // contentEditable 대신 ref로 직접 DOM 제어 → React children 충돌 방지
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('fontbox_favorites')
    if (saved) {
      const slugs: string[] = JSON.parse(saved)
      setIsFavorited(slugs.includes(font.slug))
    }
  }, [font.slug])

  useEffect(() => {
    // 웹폰트 로드 — cleanup 시 안전하게 제거
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = font.cdn_url
    link.onload = () => setFontLoaded(true)
    document.head.appendChild(link)
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link)
    }
  }, [font.cdn_url])

  // 미리보기 div 초기 텍스트 세팅 (ref 방식)
  useEffect(() => {
    if (previewRef.current && previewRef.current.textContent !== previewText) {
      previewRef.current.textContent = previewText
    }
  }, [previewText])

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCSSCode(font))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFavorite = () => {
    const saved = localStorage.getItem('fontbox_favorites')
    const slugs: string[] = saved ? JSON.parse(saved) : []
    const next = isFavorited
      ? slugs.filter(s => s !== font.slug)
      : [...slugs, font.slug]
    localStorage.setItem('fontbox_favorites', JSON.stringify(next))
    setIsFavorited(!isFavorited)
  }

  const setSampleText = (t: string) => {
    setPreviewText(t)
    if (previewRef.current) previewRef.current.textContent = t
  }

  const sampleTexts = SAMPLE_TEXTS[font.language] ?? SAMPLE_TEXTS.korean

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Link href="/"
        className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity animate-fade-up"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={15} /> 폰트 목록으로
      </Link>

      {/* 헤더 */}
      <div className="font-card p-8 mb-6 animate-fade-up">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {font.name}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              {[font.designer, font.foundry].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button onClick={handleFavorite}
            className={`favorite-btn ${isFavorited ? 'active' : ''}`}>
            <Heart size={18}
              className={isFavorited ? 'fill-red-500 text-red-500' : ''}
              style={{ color: isFavorited ? undefined : 'var(--text-muted)' }} />
          </button>
        </div>

        {/* 배지 + 다운로드 */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className={`badge ${
            font.language === 'korean' ? 'badge-korean' :
            font.language === 'english' ? 'badge-english' : 'badge-both'
          }`}>{getLanguageLabel(font.language)}</span>
          <span className="badge badge-free">{getLicenseLabel(font.license)}</span>
          <span className="badge" style={{ background:'rgba(0,0,0,0.05)', color:'var(--text-muted)', border:'1px solid var(--border)' }}>
            {getCategoryLabel(font.category)}
          </span>
          {font.is_commercial && (
            <span className="badge badge-commercial">상업적 사용 가능</span>
          )}

          {/* 다운로드 링크 — 원본 배포처로 연결 */}
          <a
            href={getDownloadUrl(font)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ml-auto transition-all hover:opacity-80"
            style={{
              background: 'rgba(34,197,94,0.1)',
              color: '#16a34a',
              border: '1px solid rgba(34,197,94,0.25)',
              textDecoration: 'none',
            }}
          >
            <Download size={13} />
            폰트 다운로드
          </a>
        </div>

        {/* 크기 슬라이더 */}
        <div className="flex items-center gap-4 mb-4">
          <input type="range" min={16} max={80} value={previewSize}
            onChange={e => setPreviewSize(Number(e.target.value))}
            className="flex-1 accent-sky-accent" />
          <span className="text-sm w-12 text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {previewSize}px
          </span>
        </div>

        {/* 메인 프리뷰 — contentEditable + ref, children 없음 */}
        <div
          ref={previewRef}
          className="preview-text mb-6 outline-none rounded-lg px-1"
          style={{
            fontFamily: fontLoaded ? `'${font.css_family}', sans-serif` : 'inherit',
            fontSize: `${previewSize}px`,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            minHeight: '60px',
          }}
          contentEditable
          suppressContentEditableWarning
          onInput={e => setPreviewText(e.currentTarget.textContent || '')}
        />

        {/* 샘플 텍스트 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {sampleTexts.map(t => (
            <button key={t} onClick={() => setSampleText(t)}
              className="filter-btn"
              style={{ fontSize: '11px', padding: '4px 10px' }}>
              {t.slice(0, 14)}{t.length > 14 ? '…' : ''}
            </button>
          ))}
        </div>

        {/* 굵기별 미리보기 */}
        <div className="space-y-3 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            굵기별 미리보기
          </p>
          {font.weights.map(w => (
            <div key={w} className="flex items-center gap-4">
              <span className="text-xs w-10 tabular-nums" style={{ color: 'var(--text-muted)' }}>{w}</span>
              <span style={{
                fontFamily: fontLoaded ? `'${font.css_family}', sans-serif` : 'inherit',
                fontWeight: Number(w),
                fontSize: '20px',
                color: 'var(--text-primary)',
              }}>
                {previewText || getDefaultPreviewText(font)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CSS 코드 */}
      <div className="font-card p-6 mb-6 animate-fade-up delay-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>웹폰트 CSS 코드</h2>
          <button onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: copied ? 'rgba(34,197,94,0.15)' : 'var(--accent)',
              color: copied ? '#16a34a' : 'white',
            }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '복사됨' : '코드 복사'}
          </button>
        </div>
        <pre className="code-block text-sm overflow-x-auto whitespace-pre-wrap">
          {generateCSSCode(font)}
        </pre>
      </div>

      {/* 유사 폰트 */}
      {similarFonts.length > 0 && (
        <div className="animate-fade-up delay-200">
          <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            비슷한 폰트
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {similarFonts.map((f, i) => (
              <FontCard key={f.id} font={f} animationDelay={i * 50} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
