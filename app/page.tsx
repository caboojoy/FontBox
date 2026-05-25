'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import FontCard from '@/components/FontCard'
import FilterBar from '@/components/FilterBar'
import PreviewControl from '@/components/PreviewControl'
import { Font, FontFilters } from '@/types'
import { fontsDb as supabase } from '@/lib/supabase'

const DEFAULT_FILTERS: FontFilters = {
  language: 'all',
  category: 'all',
  license: 'all',
  sort: 'popular',
  search: '',
}

// ilike 특수문자 이스케이프 (서버 액션과 동일하게 적용)
function escapeLike(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&')
}

export default function HomePage() {
  const [fonts, setFonts]     = useState<Font[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FontFilters>(DEFAULT_FILTERS)
  const [previewText, setPreviewText] = useState('')
  const [previewSize, setPreviewSize] = useState(28)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const prevSearchRef = useRef('')  // 이전 검색어 추적 (디바운스 판단용)

  useEffect(() => {
    const saved = localStorage.getItem('fontbox_favorites')
    if (saved) setFavorites(new Set(JSON.parse(saved)))
  }, [])

  const fetchFonts = useCallback(async (currentFilters: FontFilters) => {
    setLoading(true)

    let query = supabase.from('fonts').select('*')

    if (currentFilters.language !== 'all') {
      if (currentFilters.language === 'korean')  query = query.eq('supports_korean', true)
      if (currentFilters.language === 'english') query = query.eq('supports_latin', true).neq('language', 'korean')
      if (currentFilters.language === 'both')    query = query.eq('language', 'both')
    }
    if (currentFilters.category !== 'all') query = query.eq('category', currentFilters.category)
    if (currentFilters.license  !== 'all') query = query.eq('license',  currentFilters.license)

    if (currentFilters.search.trim()) {
      const q = escapeLike(currentFilters.search.trim())
      query = query.or(`name.ilike.%${q}%,designer.ilike.%${q}%`)
    }

    switch (currentFilters.sort) {
      case 'popular': query = query.order('download_count', { ascending: false }); break
      case 'newest':  query = query.order('created_at',     { ascending: false }); break
      case 'name':    query = query.order('name',           { ascending: true  }); break
      default:
        query = query
          .order('is_featured',    { ascending: false })
          .order('download_count', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('🔴 Supabase 쿼리 오류:', error.message, error)
    }

    setFonts((data as Font[]) || [])
    setLoading(false)
  }, [supabase])  // supabase 인스턴스는 안정적이므로 의존성 최소화

  useEffect(() => {
    // 검색어 변경이면 300ms 디바운스, 그 외 필터 변경은 즉시 실행
    const searchChanged = filters.search !== prevSearchRef.current
    prevSearchRef.current = filters.search

    const delay = searchChanged ? 300 : 0
    const timer = setTimeout(() => fetchFonts(filters), delay)
    return () => clearTimeout(timer)
  }, [filters, fetchFonts])

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/* 히어로 */}
      <div className="text-center mb-12">
        <h1
          className="font-display text-5xl sm:text-6xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Find Your
          <span style={{ color: 'var(--accent)' }}> Perfect</span>
          <br />Font
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          한글과 영문 무료 웹폰트를 한 곳에서.
          <br />
          실시간 미리보기와 AI 추천으로 빠르게 찾아보세요.
        </p>
      </div>

      {/* 미리보기 텍스트 입력 */}
      <div className="max-w-2xl mx-auto mb-10">
        <PreviewControl
          onTextChange={setPreviewText}
          onSizeChange={setPreviewSize}
          defaultSize={previewSize}
        />
      </div>

      {/* 필터 */}
      <div className="mb-8">
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          totalCount={fonts.length}
        />
      </div>

      {/* 폰트 그리드 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-52" />
          ))}
        </div>
      ) : fonts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
            검색 결과가 없습니다
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            다른 키워드나 필터를 시도해보세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {fonts.map((font, i) => (
            <FontCard
              key={font.id}
              font={font}
              previewText={previewText}
              previewSize={previewSize}
              isFavorited={favorites.has(font.slug)}
              onToggleFavorite={handleToggleFavorite}
              animationDelay={i * 50}
            />
          ))}
        </div>
      )}
    </div>
  )
}
