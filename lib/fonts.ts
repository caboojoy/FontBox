import { Font, FontLanguage } from '@/types'

export const KOREAN_CATEGORIES = [
  { value: 'gothic',      label: '고딕' },
  { value: 'myeongjo',    label: '명조' },
  { value: 'handwriting', label: '손글씨' },
  { value: 'display',     label: '디스플레이' },
  { value: 'monospace',   label: '모노스페이스' },
]

export const ENGLISH_CATEGORIES = [
  { value: 'sans-serif',  label: 'Sans-Serif' },
  { value: 'serif',       label: 'Serif' },
  { value: 'script',      label: 'Script' },
  { value: 'display',     label: 'Display' },
  { value: 'slab-serif',  label: 'Slab Serif' },
  { value: 'monospace',   label: 'Monospace' },
]

export const ALL_CATEGORIES = [
  ...KOREAN_CATEGORIES,
  ...ENGLISH_CATEGORIES.filter(c => !KOREAN_CATEGORIES.find(k => k.value === c.value)),
]

// preview_ko / preview_en — DB 컬럼명 기준
export function getDefaultPreviewText(font: Font, lang?: string): string {
  if (font.language === 'english' || lang === 'en') {
    return font.preview_en || 'The quick brown fox jumps over the lazy dog'
  }
  if (font.language === 'korean' || lang === 'ko') {
    return font.preview_ko || '다람쥐 헌 쳇바퀴에 타고파'
  }
  return '디자인 스튜디오 Design Studio 2025'
}

export function generateCSSCode(font: Font): string {
  const license  = `/* 라이선스: ${font.license} | 상업적 이용: ${font.is_commercial ? '가능 ✓' : '불가 ✗'} */`
  const importLine = `@import url('${font.cdn_url}');`
  const cssClass = `.my-font {\n  font-family: '${font.css_family}', ${
    font.language === 'english' ? 'sans-serif' : "'Apple SD Gothic Neo', sans-serif"
  };\n}`
  const usage = `/* 사용 예시 */\nbody {\n  font-family: '${font.css_family}', sans-serif;\n}`
  return [license, importLine, '', cssClass, '', usage].join('\n')
}

export function getLicenseLabel(license: string): string {
  const labels: Record<string, string> = {
    'free':            '무료',
    'commercial-free': '상업무료',
    'ofl':             'OFL',
    'apache-2':        'Apache 2.0',
  }
  return labels[license] || license
}

export function getLanguageLabel(language: FontLanguage): string {
  const labels: Record<FontLanguage, string> = {
    korean:  '한글',
    english: 'English',
    both:    '한+영',
  }
  return labels[language]
}

export function getCategoryLabel(category: string): string {
  return ALL_CATEGORIES.find(c => c.value === category)?.label || category
}

// 폰트별 다운로드/원본 페이지 URL 자동 생성
// DB 변경 없이 기존 foundry, css_family 데이터 활용
export function getDownloadUrl(font: Font): string {
  const family = font.css_family.replace(/ /g, '+')

  switch (font.foundry) {
    case 'NAVER':
      return 'https://hangeul.naver.com/font'
    case 'JetBrains':
      return 'https://www.jetbrains.com/lp/mono/'
    case 'IBM':
      // IBM Plex 시리즈는 Google Fonts에도 있음
      return `https://fonts.google.com/specimen/${family}`
    default:
      // Google Fonts (대부분의 폰트)
      return `https://fonts.google.com/specimen/${family}`
  }
}
