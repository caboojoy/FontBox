'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Copy, Check, ExternalLink, Download } from 'lucide-react'
import { Font } from '@/types'
import {
  getDefaultPreviewText,
  generateCSSCode,
  getLicenseLabel,
  getLanguageLabel,
  getCategoryLabel,
  getDownloadUrl,
} from '@/lib/fonts'

interface FontCardProps {
  font: Font
  previewText?: string
  previewSize?: number
  isFavorited?: boolean
  onToggleFavorite?: (fontSlug: string) => void
  animationDelay?: number
}

export default function FontCard({
  font,
  previewText,
  previewSize = 26,
  isFavorited = false,
  onToggleFavorite,
  animationDelay = 0,
}: FontCardProps) {
  const [copied, setCopied]         = useState(false)
  const [fontLoaded, setFontLoaded] = useState(false)
  const displayText = previewText || getDefaultPreviewText(font)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = font.cdn_url
    link.onload = () => setFontLoaded(true)
    document.head.appendChild(link)
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link)
    }
  }, [font.cdn_url])

  const handleCopyCSS = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(generateCSSCode(font))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite?.(font.slug)
  }

  const langClass =
    font.language === 'korean'  ? 'badge-korean' :
    font.language === 'english' ? 'badge-english' : 'badge-both'

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.82)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 4px 24px rgba(30,90,140,0.10), 0 1px 4px rgba(30,90,140,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 12px 40px rgba(30,90,140,0.18), 0 2px 8px rgba(30,90,140,0.10)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 4px 24px rgba(30,90,140,0.10), 0 1px 4px rgba(30,90,140,0.06)'
      }}
    >
      {/* 카드 상단 — 컬러 포인트 바 */}
      <div style={{
        height: 4,
        background: font.language === 'korean'
          ? 'linear-gradient(90deg,#1E90FF,#38bdf8)'
          : font.language === 'english'
          ? 'linear-gradient(90deg,#22c55e,#4ade80)'
          : 'linear-gradient(90deg,#a855f7,#ec4899)',
      }}/>

      <Link href={`/fonts/${font.slug}`} className="block p-5 flex-1" style={{ textDecoration: 'none' }}>
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontWeight: 700,
              fontSize: 15,
              color: '#0f172a',
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {font.name}
            </h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              {font.designer || font.foundry || '–'}
            </p>
          </div>

          {/* 즐겨찾기 */}
          <button
            onClick={handleFavorite}
            aria-label="즐겨찾기"
            style={{
              marginLeft: 8,
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: isFavorited ? '1px solid #fca5a5' : '1px solid #e2e8f0',
              background: isFavorited ? '#fee2e2' : 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Heart
              size={14}
              style={{
                fill: isFavorited ? '#ef4444' : 'none',
                color: isFavorited ? '#ef4444' : '#94a3b8',
              }}
            />
          </button>
        </div>

        {/* 폰트 미리보기 영역 */}
        <div style={{
          background: 'rgba(241,245,249,0.6)',
          borderRadius: 10,
          padding: '14px 12px',
          marginBottom: 14,
          minHeight: 72,
          display: 'flex',
          alignItems: 'center',
        }}>
          <span
            style={{
              fontFamily: fontLoaded ? `'${font.css_family}', sans-serif` : 'inherit',
              fontSize: previewSize,
              color: '#1e293b',
              lineHeight: 1.35,
              opacity: fontLoaded ? 1 : 0.35,
              transition: 'opacity 0.4s',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'keep-all',
            }}
          >
            {displayText}
          </span>
        </div>

        {/* 배지 */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className={`badge ${langClass}`}>{getLanguageLabel(font.language)}</span>
          <span className="badge badge-free">{getLicenseLabel(font.license)}</span>
          <span style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 100,
            background: 'rgba(30,144,255,0.07)',
            color: '#1E90FF',
            fontWeight: 500,
          }}>
            {getCategoryLabel(font.category)}
          </span>
        </div>
      </Link>

      {/* 카드 하단 */}
      <div style={{
        padding: '10px 16px 12px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(248,250,252,0.8)',
      }}>
        {/* 굵기 태그 */}
        <div style={{ display: 'flex', gap: 3 }}>
          {(font.weights ?? []).slice(0, 4).map(w => (
            <span key={w} style={{
              fontSize: 10,
              padding: '2px 5px',
              borderRadius: 4,
              background: 'rgba(30,144,255,0.08)',
              color: '#1E90FF',
              fontWeight: 600,
            }}>
              {w}
            </span>
          ))}
          {(font.weights ?? []).length > 4 && (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              +{(font.weights ?? []).length - 4}
            </span>
          )}
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={handleCopyCSS}
            title="CSS 코드 복사"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(30,144,255,0.09)',
              color: copied ? '#16a34a' : '#1E90FF',
              transition: 'all 0.15s',
            }}
          >
            {copied
              ? <><Check size={11}/> 복사됨</>
              : <><Copy size={11}/> CSS</>}
          </button>

          {/* 다운로드 — 원본 배포처 링크 */}
          <a
            href={getDownloadUrl(font)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            title="폰트 다운로드 (원본 사이트)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              background: 'rgba(34,197,94,0.09)',
              color: '#16a34a',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <Download size={11}/> 다운로드
          </a>

          <Link
            href={`/fonts/${font.slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              background: 'rgba(100,116,139,0.08)',
              color: '#475569',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <ExternalLink size={11}/> 상세
          </Link>
        </div>
      </div>
    </div>
  )
}
