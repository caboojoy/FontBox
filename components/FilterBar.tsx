'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { FontFilters, LanguageFilter } from '@/types'
import { KOREAN_CATEGORIES, ENGLISH_CATEGORIES } from '@/lib/fonts'

interface FilterBarProps {
  filters: FontFilters
  onChange: (filters: Partial<FontFilters>) => void
  totalCount: number
}

const LANGUAGE_TABS: { value: LanguageFilter; label: string; color: string }[] = [
  { value: 'all',     label: '전체',    color: '#1E90FF' },
  { value: 'korean',  label: '한글',    color: '#1E90FF' },
  { value: 'english', label: 'English', color: '#22c55e' },
  { value: 'both',    label: '한+영',   color: '#a855f7' },
]

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'newest',  label: '최신순' },
  { value: 'name',    label: '이름순' },
]

const LICENSE_OPTIONS = [
  { value: 'all',             label: '전체' },
  { value: 'ofl',             label: 'OFL' },
  { value: 'apache-2',        label: 'Apache 2.0' },
  { value: 'commercial-free', label: '상업무료' },
  { value: 'free',            label: '무료' },
]

export default function FilterBar({ filters, onChange, totalCount }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchValue, setSearchValue]   = useState(filters.search || '')

  useEffect(() => {
    setSearchValue(filters.search || '')
  }, [filters.search])

  const categories =
    filters.language === 'english' ? ENGLISH_CATEGORIES :
    filters.language === 'korean'  ? KOREAN_CATEGORIES  :
    [...KOREAN_CATEGORIES, ...ENGLISH_CATEGORIES.filter(
      e => !KOREAN_CATEGORIES.find(k => k.value === e.value)
    )]

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    onChange({ search: e.target.value })
  }, [onChange])

  const btn = (
    active: boolean,
    onClick: () => void,
    label: string,
    color = '#1E90FF'
  ) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 100,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        border: active ? `1.5px solid ${color}` : '1.5px solid #e2e8f0',
        background: active ? color : '#ffffff',
        color: active ? '#ffffff' : '#64748b',
        cursor: 'pointer',
        whiteSpace: 'nowrap' as const,
        transition: 'all 0.18s ease',
        boxShadow: active ? `0 2px 10px ${color}30` : 'none',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* 검색창 */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none',
        }} />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearch}
          placeholder="폰트 이름, 디자이너, 태그로 검색..."
          style={{
            width: '100%', padding: '11px 40px 11px 40px',
            borderRadius: 12, border: '1.5px solid #e2e8f0',
            background: '#ffffff', fontSize: 14, color: '#0f172a',
            outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = '#1E90FF')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
        {searchValue && (
          <button
            onClick={() => { setSearchValue(''); onChange({ search: '' }) }}
            style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', color: '#94a3b8',
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* 언어 탭 + 카테고리 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* 언어 탭 */}
        {LANGUAGE_TABS.map(tab =>
          btn(
            filters.language === tab.value,
            () => onChange({ language: tab.value, category: 'all' }),
            tab.label,
            tab.color
          )
        )}

        {/* 구분선 */}
        <div style={{ width: 1, height: 20, background: '#e2e8f0', flexShrink: 0 }} />

        {/* 카테고리 - 전체 */}
        {btn(
          filters.category === 'all',
          () => onChange({ category: 'all' }),
          '전체'
        )}

        {/* 카테고리 목록 */}
        {categories.map(cat =>
          btn(
            filters.category === cat.value,
            () => onChange({ category: cat.value }),
            cat.label
          )
        )}
      </div>

      {/* 하단: 폰트 수 + 상세 필터 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
          총{' '}
          <span style={{ fontWeight: 700, color: '#1E90FF', fontSize: 14 }}>
            {totalCount}
          </span>
          개 폰트
        </p>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
            border: '1px solid #e2e8f0', background: showAdvanced ? '#f8fafc' : '#ffffff',
            color: '#64748b', cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={12} />
          상세 필터
        </button>
      </div>

      {/* 상세 필터 */}
      {showAdvanced && (
        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: '#f8fafc', border: '1px solid #e2e8f0',
          display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center',
        }}>
          {/* 라이선스 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>라이선스</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {LICENSE_OPTIONS.map(opt =>
                btn(
                  filters.license === opt.value,
                  () => onChange({ license: opt.value as FontFilters['license'] }),
                  opt.label
                )
              )}
            </div>
          </div>

          <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />

          {/* 정렬 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>정렬</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {SORT_OPTIONS.map(opt =>
                btn(
                  filters.sort === opt.value,
                  () => onChange({ sort: opt.value as FontFilters['sort'] }),
                  opt.label
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
