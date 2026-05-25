'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { FontFilters, LanguageFilter } from '@/types'
import { KOREAN_CATEGORIES, ENGLISH_CATEGORIES } from '@/lib/fonts'

interface FilterBarProps {
  filters: FontFilters
  onChange: (filters: Partial<FontFilters>) => void
  totalCount: number
}

const LANGUAGE_TABS: { value: LanguageFilter; label: string }[] = [
  { value: 'all',     label: '전체' },
  { value: 'korean',  label: '한글' },
  { value: 'english', label: 'English' },
  { value: 'both',    label: '한+영' },
]

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'newest',  label: '최신순' },
  { value: 'name',    label: '이름순' },
]

const LICENSE_OPTIONS = [
  { value: 'all',             label: '전체 라이선스' },
  { value: 'ofl',             label: 'OFL' },
  { value: 'apache-2',        label: 'Apache 2.0' },  // Roboto Slab 등
  { value: 'commercial-free', label: '상업무료' },
  { value: 'free',            label: '무료' },
]

export default function FilterBar({ filters, onChange, totalCount }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  // 외부에서 filters.search가 초기화될 때 input 동기화
  useEffect(() => {
    setSearchValue(filters.search || '')
  }, [filters.search])

  const categories =
    filters.language === 'english'
      ? ENGLISH_CATEGORIES
      : filters.language === 'korean'
      ? KOREAN_CATEGORIES
      : [...KOREAN_CATEGORIES, ...ENGLISH_CATEGORIES.filter(
          e => !KOREAN_CATEGORIES.find(k => k.value === e.value)
        )]

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value)
      onChange({ search: e.target.value })
    },
    [onChange]
  )

  const clearSearch = () => {
    setSearchValue('')
    onChange({ search: '' })
  }

  return (
    <div className="space-y-4">
      {/* 검색창 */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-placeholder)' }}
        />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearch}
          placeholder="폰트 이름, 디자이너, 태그로 검색..."
          className="search-input w-full pl-10 pr-10 py-3 text-sm"
          style={{ color: 'var(--text-primary)' }}
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* 언어 탭 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {LANGUAGE_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => onChange({ language: tab.value, category: 'all' })}
            className={`filter-btn ${filters.language === tab.value ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}

        <div className="w-px h-5 flex-shrink-0 mx-1" style={{ background: 'var(--border)' }} />

        {/* 카테고리 */}
        <button
          onClick={() => onChange({ category: 'all' })}
          className={`filter-btn ${filters.category === 'all' ? 'active' : ''}`}
        >
          전체
        </button>
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => onChange({ category: cat.value })}
            className={`filter-btn ${filters.category === cat.value ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 상세 필터 토글 */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          총{' '}
          <span className="font-semibold" style={{ color: 'var(--accent)' }}>
            {totalCount}
          </span>
          개 폰트
        </p>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all hover:bg-white/30"
          style={{ color: 'var(--text-muted)' }}
        >
          <SlidersHorizontal size={13} />
          상세 필터
        </button>
      </div>

      {/* 상세 필터 패널 */}
      {showAdvanced && (
        <div
          className="flex flex-wrap items-center gap-4 p-4 rounded-xl animate-fade-in"
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid var(--border)' }}
        >
          {/* 라이선스 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              라이선스
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LICENSE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ license: opt.value as FontFilters['license'] })}
                  className={`filter-btn text-xs ${filters.license === opt.value ? 'active' : ''}`}
                  style={{ padding: '4px 10px' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-5 hidden sm:block" style={{ background: 'var(--border)' }} />

          {/* 정렬 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              정렬
            </span>
            <div className="flex gap-1.5">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ sort: opt.value as FontFilters['sort'] })}
                  className={`filter-btn text-xs ${filters.sort === opt.value ? 'active' : ''}`}
                  style={{ padding: '4px 10px' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
