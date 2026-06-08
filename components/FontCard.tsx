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
}: FontCardProps) {
  const [copied, setCopied]           = useState(false)
  const [fontLoaded, setFontLoaded]   = useState(false)
  const [hovered, setHovered]         = useState(false)
  const displayText = previewText || getDefaultPreviewText(font)

  useEffect(() => {
    if (font.cdn_url) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = font.cdn_url
      link.onload = () => setFontLoaded(true)
      document.head.appendChild(link)
      return () => {
        if (document.head.contains(link)) document.head.removeChild(link)
      }
    } else if (font.webfont_css) {
      const style = document.createElement('style')
      style.textContent = font.webfont_css
      document.head.appendChild(style)
      setFontLoaded(true)
      return () => {
        if (document.head.contains(style)) document.head.removeChild(style)
      }
    }
  }, [font.cdn_url, font.webfont_css])



  const handleCopyCSS = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    navigator.clipboard.writeText(generateCSSCode(font))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    onToggleFavorite?.(font.slug)
  }

  // 언어별 포인트 컬러
  const accentColor =
    font.language === 'korean'  ? '#1E90FF' :
    font.language === 'english' ? '#22c55e' : '#a855f7'

  const langLabel = getLanguageLabel(font.language)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: hovered ? `1.5px solid ${accentColor}` : '1.5px solid #e2e8f0',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.10), 0 0 0 4px ${accentColor}18`
          : '0 2px 12px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
        height: 280,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 언어 컬러 바 */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
        flexShrink: 0,
      }} />

      <Link
        href={`/fonts/${font.slug}`}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 18px 12px', textDecoration: 'none', overflow: 'hidden' }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700,
              fontSize: 15,
              color: '#0f172a',
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {font.name}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {font.designer || font.foundry || '–'}
            </div>
          </div>

          {/* 즐겨찾기 */}
          <button
            onClick={handleFavorite}
            style={{
              marginLeft: 8,
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: isFavorited ? '1.5px solid #fca5a5' : '1.5px solid #e2e8f0',
              background: isFavorited ? '#fee2e2' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Heart size={13} style={{
              fill: isFavorited ? '#ef4444' : 'none',
              color: isFavorited ? '#ef4444' : '#cbd5e1',
            }} />
          </button>
        </div>

        {/* 폰트 미리보기 */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: '#f8fafc',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 12,
          overflow: 'hidden',
          border: '1px solid #f1f5f9',
        }}>
          <span style={{
            fontFamily: fontLoaded ? `'${font.css_family}', sans-serif` : 'inherit',
            fontSize: Math.min(previewSize, 32),
            color: '#0f172a',
            lineHeight: 1.3,
            opacity: fontLoaded ? 1 : 0.3,
            transition: 'opacity 0.4s',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'keep-all',
          }}>
            {displayText}
          </span>
        </div>

        {/* 배지 */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flexShrink: 0 }}>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 100, fontWeight: 600,
            background: `${accentColor}12`, color: accentColor,
            border: `1px solid ${accentColor}22`,
          }}>
            {langLabel}
          </span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 100, fontWeight: 600,
            background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
          }}>
            {getLicenseLabel(font.license)}
          </span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 100, fontWeight: 500,
            background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0',
          }}>
            {getCategoryLabel(font.category)}
          </span>
        </div>
      </Link>

      {/* 하단 액션 바 */}
      <div style={{
        padding: '8px 14px 10px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* 굵기 */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {(font.weights ?? []).slice(0, 3).map(w => (
            <span key={w} style={{
              fontSize: 10, padding: '2px 5px', borderRadius: 4,
              background: '#eff6ff', color: '#1E90FF', fontWeight: 700,
            }}>
              {w}
            </span>
          ))}
          {(font.weights ?? []).length > 3 && (
            <span style={{ fontSize: 10, color: '#cbd5e1' }}>
              +{(font.weights ?? []).length - 3}
            </span>
          )}
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 3 }}>
          <button onClick={handleCopyCSS} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '4px 9px', borderRadius: 7, fontSize: 11, fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: copied ? '#f0fdf4' : '#eff6ff',
            color: copied ? '#16a34a' : '#1E90FF',
          }}>
            {copied ? <><Check size={10}/>복사됨</> : <><Copy size={10}/>CSS</>}
          </button>

          <a
            href={getDownloadUrl(font)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '4px 9px', borderRadius: 7, fontSize: 11, fontWeight: 600,
              background: '#f0fdf4', color: '#16a34a', textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <Download size={10}/>다운로드
          </a>

          <Link href={`/fonts/${font.slug}`} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '4px 9px', borderRadius: 7, fontSize: 11, fontWeight: 600,
            background: '#f8fafc', color: '#64748b', textDecoration: 'none',
            transition: 'all 0.15s',
          }}>
            <ExternalLink size={10}/>상세
          </Link>
        </div>
      </div>
    </div>
  )
}
