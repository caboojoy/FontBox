'use client'

import { useState, useEffect, useRef } from 'react'
import FontCard from '@/components/FontCard'
import FilterBar from '@/components/FilterBar'
import PreviewControl from '@/components/PreviewControl'
import { Font, FontFilters } from '@/types'
import { createClient } from '@supabase/supabase-js'

const DEFAULT_FILTERS: FontFilters = {
  language: 'all',
  category: 'all',
  license: 'all',
  sort: 'popular',
  search: '',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: 'fonts' } }
)

function escapeLike(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&')
}

export default function HomePage() {
  const [fonts, setFonts]     = useState<Font[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [filters, setFilters] = useState<FontFilters>(DEFAULT_FILTERS)
  const [previewText, setPreviewText] = useState('')
  const [previewSize, setPreviewSize] = useState(28)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const prevSearchRef = useRef('')
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('fontbox_favorites')
    if (saved) setFavorites(new Set(JSON.parse(saved)))
  }, [])

  // 폰트 조회 — useCallback 제거, 직접 useEffect에서 실행
  useEffect(() => {
    const searchChanged = filters.search !== prevSearchRef.current
    prevSearchRef.current = filters.search
    const delay = searchChanged ? 300 : 0

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        let query = supabase.from('fonts').select('*')

        if (filters.language !== 'all') {
          if (filters.language === 'korean')  query = query.eq('supports_korean', true)
          if (filters.language === 'english') query = query.eq('supports_latin', true).neq('language', 'korean')
          if (filters.language === 'both')    query = query.eq('language', 'both')
        }
        if (filters.category !== 'all') query = query.eq('category', filters.category)
        if (filters.license  !== 'all') query = query.eq('license',  filters.license)

        if (filters.search.trim()) {
          const q = escapeLike(filters.search.trim())
          query = query.or(`name.ilike.%${q}%,designer.ilike.%${q}%`)
        }

        switch (filters.sort) {
          case 'popular': query = query.order('download_count', { ascending: false }); break
          case 'newest':  query = query.order('created_at',     { ascending: false }); break
          case 'name':    query = query.order('name',           { ascending: true  }); break
          default:
            query = query
              .order('is_featured',    { ascending: false })
              .order('download_count', { ascending: false })
        }

        const { data, error: qErr } = await query

        if (!isMounted.current) return

        if (qErr) {
          console.error('Supabase error:', qErr)
          setError(`DB 오류: ${qErr.message}`)
          setFonts([])
        } else {
          setFonts((data as Font[]) || [])
        }
      } catch (e) {
        if (!isMounted.current) return
        const msg = e instanceof Error ? `${e.message} ${e.stack}` : JSON.stringify(e)
        setError(`오류: ${msg}`)  
        setFonts([])
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [filters])

  const handleFilterChange = (partial: Partial<FontFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }))
  }

  const handleToggleFavorite = (fontSlug: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(fontSlug)) next.delete(fontSlug)
      else next.add(fontSlug)
      localStorage.setItem('fontbox_favorites', JSON.stringify(Array.from(next)))
      return next
    })
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 80px' }}>

      {/* 히어로 */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 100, marginBottom: 24,
          background: 'rgba(30,144,255,0.08)',
          border: '1px solid rgba(30,144,255,0.2)',
          color: '#1E90FF', fontSize: 13, fontWeight: 600,
        }}>
          ✦ 한글 · 영문 무료 웹폰트 모음
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 800, lineHeight: 1.15,
          letterSpacing: '-0.02em', color: '#0f172a', marginBottom: 20,
        }}>
          Find Your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #1E90FF, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Perfect
          </span>{' '}Font
        </h1>

        <p style={{ fontSize: 18, color: '#475569', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          실시간 미리보기와 AI 추천으로<br />딱 맞는 폰트를 빠르게 찾아보세요
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 32 }}>
          {[
            { num: '55+', label: '무료 폰트' },
            { num: 'AI',  label: '폰트 추천' },
            { num: '즉시', label: 'CSS 복사' },
          ].map(({ num, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{num}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 구분선 */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
        marginBottom: 36,
      }} />

      {/* 미리보기 입력 */}
      <div style={{ maxWidth: 640, margin: '0 auto 32px' }}>
        <PreviewControl
          onTextChange={setPreviewText}
          onSizeChange={setPreviewSize}
          defaultSize={previewSize}
        />
      </div>

      {/* 필터 */}
      <div style={{ marginBottom: 32 }}>
        <FilterBar filters={filters} onChange={handleFilterChange} totalCount={fonts.length} />
      </div>

      {/* DB 오류 표시 */}
      {error && (
        <div style={{
          padding: '14px 18px', borderRadius: 12, marginBottom: 24,
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 14,
        }}>
          ⚠️ {error}
          <br />
          <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>
            {error}
          </span>
        </div>
      )}

      {/* 폰트 그리드 */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              height: 280, borderRadius: 16,
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              animation: 'shimmer 1.5s infinite',
            }} />
          ))}
        </div>
      ) : fonts.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#334155' }}>검색 결과가 없습니다</p>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>다른 키워드나 필터를 시도해보세요</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {fonts.map((font) => (
            <FontCard
              key={font.id}
              font={font}
              previewText={previewText}
              previewSize={previewSize}
              isFavorited={favorites.has(font.slug)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
