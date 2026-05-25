export type FontLanguage = 'korean' | 'english' | 'both'
export type FontLicense = 'free' | 'commercial-free' | 'ofl' | 'apache-2'

export type KoreanCategory =
  | 'gothic'
  | 'myeongjo'
  | 'handwriting'
  | 'display'
  | 'monospace'

export type EnglishCategory =
  | 'sans-serif'
  | 'serif'
  | 'script'
  | 'display'
  | 'slab-serif'
  | 'monospace'

export interface Font {
  id: string
  name: string
  slug: string
  designer?: string
  foundry?: string
  category: string
  tags: string[]
  license: FontLicense
  is_commercial: boolean
  cdn_url: string
  css_family: string
  weights: string[]
  preview_ko?: string   // DB 컬럼명과 일치 (preview_text_ko → preview_ko)
  preview_en?: string   // DB 컬럼명과 일치 (preview_text_en → preview_en)
  language: FontLanguage
  supports_korean: boolean
  supports_latin: boolean
  download_count: number
  is_featured: boolean
  created_at: string
  updated_at?: string
}

export interface Favorite {
  id: string
  device_id: string
  font_slug: string
  created_at: string
}

// AI 추천 결과 — actions/ai.ts 반환값과 정확히 일치
export interface AIRecommendation {
  fonts: Font[]
  reasoning: string
  pairing_tip?: string
  cached: boolean
}

export type SortOption = 'popular' | 'newest' | 'name'
export type LanguageFilter = 'all' | 'korean' | 'english' | 'both'
export type LicenseFilter = 'all' | 'free' | 'commercial-free' | 'ofl' | 'apache-2'

export interface FontFilters {
  language: LanguageFilter
  category: string
  license: LicenseFilter
  sort: SortOption
  search: string
}
