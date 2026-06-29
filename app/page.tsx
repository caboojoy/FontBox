'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import FontCard from '@/components/FontCard'
import FilterBar from '@/components/FilterBar'
import PreviewControl from '@/components/PreviewControl'
import { Font, FontFilters } from '@/types'
import { supabase } from '@/lib/supabase-client'

function escapeLike(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&')
}

// 한글 검색어 → 영문 카테고리 매핑
const KOREAN_CATEGORY_MAP: Record<string, string> = {
  '고딕': 'gothic', '고딕체': 'gothic',
  '산세리프': 'sans-serif', '산스세리프': 'sans-serif',
  '세리프': 'serif',
  '손글씨': 'handwriting', '손글씨체': 'handwriting', '핸드라이팅': 'handwriting',
  '필기': 'handwriting', '필기체': 'handwriting',
  '디스플레이': 'display', '장식': 'display', '디자인': 'display',
  '모노': 'monospace', '모노스페이스': 'monospace', '코딩': 'monospace',
  '명조': 'serif', '명조체': 'serif',
  '둥근': 'rounded', '둥근고딕': 'rounded',
}

// 한글 태그 → 영문 태그 매핑
const KOREAN_TAG_MAP: Record<string, string[]> = {
  '굵은': ['bold', 'heavy'],
  '얇은': ['thin', 'light'],
  '가는': ['thin', 'light'],
  '깔끔한': ['clean', 'minimal'],
  '깔끔': ['clean', 'minimal'],
  '현대적': ['modern', 'contemporary'],
  '클래식': ['classic', 'traditional'],
  '전통': ['classic', 'traditional'],
  '브랜드': ['brand', 'branding'],
  '로고': ['logo', 'brand'],
  '제목': ['display', 'heading', 'title'],
  '본문': ['body', 'readable', 'text'],
  '가독성': ['readable', 'legible', 'body'],
  '귀여운': ['cute', 'casual', 'friendly'],
  '귀여움': ['cute', 'casual'],
  '캐주얼': ['casual', 'friendly'],
  '블로그': ['blog', 'web'],
  '앱': ['app', 'ui'],
  '웹': ['web', 'ui'],
  '포스터': ['poster', 'display'],
  '광고': ['advertising', 'display'],
}

const DEFAULT_FILTERS: FontFilters = {
  language: 'all',
  category: 'all',
  license: 'all',
  sort: 'popular',
  search: '',
}

const PAGE_SIZE = 24

export default function HomePage() {
  const [fonts, setFonts]             = useState<Font[]>([])
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [filters, setFilters]         = useState<FontFilters>(DEFAULT_FILTERS)
  const [previewText, setPreviewText] = useState('')
  const [previewSize, setPreviewSize] = useState(28)
  const [favorites, setFavorites]     = useState<Set<string>>(new Set())
  const [page, setPage]               = useState(0)
  const [hasMore, setHasMore]         = useState(true)
  const [totalCount, setTotalCount]   = useState(0)
  const prevSearchRef = useRef('')
  const isMounted    = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('fontbox_favorites')
    if (saved) setFavorites(new Set(JSON.parse(saved)))
  }, [])

  // 전체 폰트 수량 (필터 무관) — 마운트 시 1회만
  useEffect(() => {
    supabase
      .schema('fonts')
      .from('fonts')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count !== null) setTotalCount(count)
      })
  }, [])

  // 쿼리 빌더 공통 함수
  const buildQuery = useCallback((currentFilters: FontFilters) => {
    let query = supabase
      .schema('fonts')
      .from('fonts')
      .select('*')

    if (currentFilters.language !== 'all') {
      if (currentFilters.language === 'korean')  query = query.eq('supports_korean', true)
      if (currentFilters.language === 'english') query = query.eq('supports_latin', true).neq('language', 'korean')
      if (currentFilters.language === 'both')    query = query.eq('language', 'both')
    }
    if (currentFilters.category !== 'all') query = query.eq('category', currentFilters.category)
    if (currentFilters.license  !== 'all') query = query.eq('license',  currentFilters.license)

    if (currentFilters.search.trim()) {
      const raw = currentFilters.search.trim()
      const q   = escapeLike(raw)

      // 한글 → 영문 카테고리 매핑
      const mappedCategory = KOREAN_CATEGORY_MAP[raw]
      // 한글 → 영문 태그 매핑
      const mappedTags = KOREAN_TAG_MAP[raw] ?? []

      // or 조건 조합
      const orParts: string[] = [
        `name.ilike.%${q}%`,
        `designer.ilike.%${q}%`,
        `category.ilike.%${q}%`,
      ]

      // 카테고리 매핑 히트 시 추가
      if (mappedCategory) {
        orParts.push(`category.eq.${mappedCategory}`)
      }

      // 태그 매핑 히트 시 추가 (tags는 text[] 배열 — cs: contains)
      mappedTags.forEach(tag => {
        orParts.push(`tags.cs.{${tag}}`)
      })

      // 영문 검색어면 tags 배열에서도 직접 검색
      if (/^[a-zA-Z\s]+$/.test(raw)) {
        orParts.push(`tags.cs.{${raw.toLowerCase()}}`)
      }

      query = query.or(orParts.join(','))
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

    return query
  }, [])

  // 필터 변경 시 첫 페이지 로드
  useEffect(() => {
    const searchChanged = filters.search !== prevSearchRef.current
    prevSearchRef.current = filters.search
    const delay = searchChanged ? 300 : 0

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      setPage(0)

      try {
        const isSearching = filters.search.trim().length > 0

        // 검색 중일 땐 전체 결과, 아닐 땐 첫 PAGE_SIZE개만
        const query = isSearching
          ? buildQuery(filters)
          : buildQuery(filters).range(0, PAGE_SIZE - 1)

        const { data, error: qErr } = await query

        if (!isMounted.current) return

        if (qErr) {
          setError(`DB 오류: ${qErr.message}`)
          setFonts([])
          setHasMore(false)
        } else {
          const result = (data as Font[]) || []
          setFonts(result)
          setHasMore(!isSearching && result.length === PAGE_SIZE)
        }
      } catch (e) {
        if (!isMounted.current) return
        const msg = e instanceof Error ? e.message : JSON.stringify(e)
        setError(`오류: ${msg}`)
        setFonts([])
        setHasMore(false)
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [filters, buildQuery])

  // 더보기
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    try {
      const nextPage = page + 1
      const from = nextPage * PAGE_SIZE
      const to   = from + PAGE_SIZE - 1

      const query = buildQuery(filters).range(from, to)
      const { data, error: qErr } = await query

      if (!isMounted.current) return

      if (!qErr && data) {
        const result = data as Font[]
        setFonts(prev => [...prev, ...result])
        setPage(nextPage)
        setHasMore(result.length === PAGE_SIZE)
      }
    } catch (e) {
      console.error('더보기 오류:', e)
    } finally {
      if (isMounted.current) setLoadingMore(false)
    }
  }

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
            { num: totalCount ? `${totalCount}+` : '700+', label: '무료 폰트' },
            { num: 'AI',   label: '폰트 추천' },
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
        <FilterBar filters={filters} onChange={handleFilterChange} totalCount={totalCount} />
      </div>

      {/* DB 오류 */}
      {error && (
        <div style={{
          padding: '14px 18px', borderRadius: 12, marginBottom: 24,
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 14,
        }}>
          ⚠️ {error}
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
        <>
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

          {/* 더보기 버튼 */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{
                  padding: '13px 40px', borderRadius: 100,
                  background: loadingMore ? '#94a3b8' : '#1E90FF',
                  color: '#fff', border: 'none',
                  fontSize: 15, fontWeight: 600,
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {loadingMore ? '불러오는 중...' : '더 보기'}
              </button>
            </div>
          )}

          {/* 전체 로드 완료 */}
          {!hasMore && fonts.length > PAGE_SIZE && (
            <div style={{ textAlign: 'center', marginTop: 48, color: '#94a3b8', fontSize: 14 }}>
              총 {fonts.length}개 폰트를 모두 불러왔어요 ✓
            </div>
          )}
        </>
      )}
    </div>
  )
}

