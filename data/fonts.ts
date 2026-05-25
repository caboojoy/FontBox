/**
 * FONTBOX — 정적 폰트 카탈로그
 *
 * ✅ 구조 원칙
 * - 폰트 데이터는 이 파일에서 관리 (DB 불필요 → 비용 0원)
 * - Supabase는 즐겨찾기 + AI 캐시에만 사용
 * - 새 폰트 추가: 이 파일 하단에 항목 추가 후 git push
 * - cdn_url: 폰트 파일을 직접 서빙하지 않고 외부 CDN 링크만 사용
 *
 * ✅ 폰트 추가 방법
 * 1. 아래 FontEntry 형식으로 항목 추가
 * 2. Google Fonts URL: https://fonts.googleapis.com/css2?family=폰트명+치환(공백→+):wght@400;700
 * 3. npm run dev 로 바로 확인
 */

export interface FontEntry {
  id: string              // 고유 ID (slug와 동일하게)
  name: string            // 표시 이름
  slug: string            // URL용 식별자 (영문 소문자, 하이픈)
  designer?: string       // 디자이너
  foundry?: string        // 폰트 제작사
  category: string        // 카테고리
  tags: string[]          // 검색/필터용 태그
  license: 'ofl' | 'free' | 'commercial-free' | 'apache-2'
  is_commercial: boolean  // 상업적 이용 가능 여부
  cdn_url: string         // Google Fonts / 외부 CDN CSS URL
  css_family: string      // CSS font-family 값
  weights: string[]       // 지원 굵기
  preview_ko?: string     // 한글 미리보기 문장
  preview_en?: string     // 영문 미리보기 문장
  language: 'korean' | 'english' | 'both'
  supports_korean: boolean
  supports_latin: boolean
  is_featured: boolean    // 추천 폰트 여부
  added_at: string        // 추가일 (YYYY-MM-DD)
}

// ============================================================
// 🇰🇷 한글 폰트 (Google Fonts 기준, 전부 무료 상업 이용 가능)
// ============================================================
const KOREAN_FONTS: FontEntry[] = [
  {
    id: 'noto-sans-kr', name: 'Noto Sans KR', slug: 'noto-sans-kr',
    designer: 'Google', foundry: 'Google',
    category: 'gothic', tags: ['고딕', '본문', '깔끔', '현대적', '다목적'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap',
    css_family: 'Noto Sans KR', weights: ['100','300','400','500','700','900'],
    preview_ko: '다람쥐 헌 쳇바퀴에 타고파', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'noto-serif-kr', name: 'Noto Serif KR', slug: 'noto-serif-kr',
    designer: 'Google', foundry: 'Google',
    category: 'myeongjo', tags: ['명조', '본문', '전통', '우아함', '독서'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600;700&display=swap',
    css_family: 'Noto Serif KR', weights: ['300','400','600','700'],
    preview_ko: '세상의 모든 글자는 아름답다', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'nanum-gothic', name: '나눔고딕', slug: 'nanum-gothic',
    designer: '한재준', foundry: 'NAVER',
    category: 'gothic', tags: ['고딕', '본문', '기업', '공공', '깔끔'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap',
    css_family: 'Nanum Gothic', weights: ['400','700','800'],
    preview_ko: '나눔의 정신으로 만든 무료 폰트', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'nanum-myeongjo', name: '나눔명조', slug: 'nanum-myeongjo',
    designer: '한재준', foundry: 'NAVER',
    category: 'myeongjo', tags: ['명조', '본문', '전통', '격식', '독서'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap',
    css_family: 'Nanum Myeongjo', weights: ['400','700','800'],
    preview_ko: '한국의 전통 명조체 무료 폰트', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'nanum-pen', name: '나눔손글씨 펜', slug: 'nanum-pen',
    designer: '한재준', foundry: 'NAVER',
    category: 'handwriting', tags: ['손글씨', '귀여운', '개성', '자유', '일상'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap',
    css_family: 'Nanum Pen Script', weights: ['400'],
    preview_ko: '손으로 쓴 것 같은 자연스러운 글씨', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'nanum-brush', name: '나눔손글씨 붓', slug: 'nanum-brush',
    designer: '한재준', foundry: 'NAVER',
    category: 'handwriting', tags: ['손글씨', '붓글씨', '예술', '전통', '감성'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap',
    css_family: 'Nanum Brush Script', weights: ['400'],
    preview_ko: '붓으로 쓴 듯한 힘찬 획', language: 'korean',
    supports_korean: true, supports_latin: false, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'black-han-sans', name: 'Black Han Sans', slug: 'black-han-sans',
    designer: 'Jongsang Yoon', foundry: 'Google Fonts',
    category: 'display', tags: ['디스플레이', '제목', '강렬', '임팩트', '헤드라인'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap',
    css_family: 'Black Han Sans', weights: ['400'],
    preview_ko: '강렬한 임팩트 헤드라인', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'jua', name: 'Jua', slug: 'jua',
    designer: 'Woowahan Brothers', foundry: 'Google Fonts',
    category: 'display', tags: ['디스플레이', '둥근', '귀여운', '제목', '앱'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Jua&display=swap',
    css_family: 'Jua', weights: ['400'],
    preview_ko: '동글동글 귀여운 제목 폰트', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'gaegu', name: 'Gaegu', slug: 'gaegu',
    designer: 'TanType', foundry: 'Google Fonts',
    category: 'handwriting', tags: ['손글씨', '자연스러운', '일상', '노트', '캐주얼'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&display=swap',
    css_family: 'Gaegu', weights: ['300','400','700'],
    preview_ko: '노트에 끄적인 손글씨 느낌', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'dokdo', name: 'Dokdo', slug: 'dokdo',
    designer: 'NAVER', foundry: 'NAVER',
    category: 'display', tags: ['디스플레이', '개성', '독특', '강렬'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Dokdo&display=swap',
    css_family: 'Dokdo', weights: ['400'],
    preview_ko: '독특하고 개성 넘치는 폰트', language: 'korean',
    supports_korean: true, supports_latin: false, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'gowun-dodum', name: 'Gowun Dodum', slug: 'gowun-dodum',
    designer: 'Google', foundry: 'Google Fonts',
    category: 'gothic', tags: ['고딕', '둥근', '귀여운', '본문', '가독성'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap',
    css_family: 'Gowun Dodum', weights: ['400'],
    preview_ko: '둥글둥글 따뜻한 고딕체', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'gowun-batang', name: 'Gowun Batang', slug: 'gowun-batang',
    designer: 'Google', foundry: 'Google Fonts',
    category: 'myeongjo', tags: ['명조', '바탕체', '본문', '독서', '가독성'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap',
    css_family: 'Gowun Batang', weights: ['400','700'],
    preview_ko: '편안하게 읽히는 바탕체', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'gothic-a1', name: 'Gothic A1', slug: 'gothic-a1',
    designer: 'Yanghee Lee', foundry: 'Google Fonts',
    category: 'gothic', tags: ['고딕', '현대적', '다목적', '깔끔', '다양한굵기'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Gothic+A1:wght@100;200;300;400;500;600;700;800;900&display=swap',
    css_family: 'Gothic A1', weights: ['100','200','300','400','500','600','700','800','900'],
    preview_ko: '9가지 굵기를 지원하는 다목적 고딕', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'do-hyeon', name: 'Do Hyeon', slug: 'do-hyeon',
    designer: 'Jongsang Yoon', foundry: 'Google Fonts',
    category: 'gothic', tags: ['고딕', '모던', '깔끔', '제목', 'UI'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap',
    css_family: 'Do Hyeon', weights: ['400'],
    preview_ko: '모던하고 깔끔한 제목용 고딕', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'ibm-plex-sans-kr', name: 'IBM Plex Sans KR', slug: 'ibm-plex-sans-kr',
    designer: 'Mike Abbink', foundry: 'IBM',
    category: 'gothic', tags: ['고딕', 'IBM', '기업', '테크', '현대적'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@100;200;300;400;500;600;700&display=swap',
    css_family: 'IBM Plex Sans KR', weights: ['100','200','300','400','500','600','700'],
    preview_ko: 'IBM이 만든 테크 감성 고딕체', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'sunflower', name: 'Sunflower', slug: 'sunflower',
    designer: 'Yanghee Lee', foundry: 'Google Fonts',
    category: 'gothic', tags: ['고딕', '밝은', '화사한', '여성적', '브랜딩'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Sunflower:wght@300;500;700&display=swap',
    css_family: 'Sunflower', weights: ['300','500','700'],
    preview_ko: '밝고 화사한 해바라기 같은 폰트', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'poor-story', name: 'Poor Story', slug: 'poor-story',
    designer: 'Yoon Design', foundry: 'Google Fonts',
    category: 'handwriting', tags: ['손글씨', '캐릭터', '웹툰', '개성', '독특'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Poor+Story&display=swap',
    css_family: 'Poor Story', weights: ['400'],
    preview_ko: '웹툰 느낌의 독특한 손글씨', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'gamja-flower', name: 'Gamja Flower', slug: 'gamja-flower',
    designer: 'Yoon Design', foundry: 'Google Fonts',
    category: 'handwriting', tags: ['손글씨', '귀여운', '감자', '동글동글', '아동'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap',
    css_family: 'Gamja Flower', weights: ['400'],
    preview_ko: '감자꽃처럼 귀여운 손글씨', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'hi-melody', name: 'Hi Melody', slug: 'hi-melody',
    designer: 'HiType', foundry: 'Google Fonts',
    category: 'handwriting', tags: ['손글씨', '여성적', '부드러운', '감성', '다이어리'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Hi+Melody&display=swap',
    css_family: 'Hi Melody', weights: ['400'],
    preview_ko: '감성 다이어리 손글씨 폰트', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'gugi', name: 'Gugi', slug: 'gugi',
    designer: 'Jaemin Cha', foundry: 'Google Fonts',
    category: 'display', tags: ['디스플레이', '레트로', '게임', '픽셀', '개성'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Gugi&display=swap',
    css_family: 'Gugi', weights: ['400'],
    preview_ko: '레트로 게임 감성의 독특한 폰트', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'nanum-gothic-coding', name: '나눔고딕코딩', slug: 'nanum-gothic-coding',
    designer: '한재준', foundry: 'NAVER',
    category: 'monospace', tags: ['모노스페이스', '코딩', '개발자', '등폭'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&display=swap',
    css_family: 'Nanum Gothic Coding', weights: ['400','700'],
    preview_ko: 'const hello = "안녕하세요";', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'cute-font', name: 'Cute Font', slug: 'cute-font',
    designer: 'Yoon Design', foundry: 'Google Fonts',
    category: 'display', tags: ['디스플레이', '귀여운', '아동', '밝은', '팝'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Cute+Font&display=swap',
    css_family: 'Cute Font', weights: ['400'],
    preview_ko: '귀엽고 발랄한 디스플레이 폰트', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'kirang-haerang', name: 'Kirang Haerang', slug: 'kirang-haerang',
    designer: 'Yoon Design', foundry: 'Google Fonts',
    category: 'display', tags: ['디스플레이', '개성', '빈티지', '레트로'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Kirang+Haerang&display=swap',
    css_family: 'Kirang Haerang', weights: ['400'],
    preview_ko: '빈티지 감성의 독특한 폰트', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'yeon-sung', name: '연성체', slug: 'yeon-sung',
    designer: 'Yoon Design', foundry: 'Google Fonts',
    category: 'handwriting', tags: ['손글씨', '부드러운', '감성', '연필', '필기'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Yeon+Sung&display=swap',
    css_family: 'Yeon Sung', weights: ['400'],
    preview_ko: '부드럽고 감성적인 연성체', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'single-day', name: 'Single Day', slug: 'single-day',
    designer: 'Yoon Design', foundry: 'Google Fonts',
    category: 'handwriting', tags: ['손글씨', '하루', '일상', '캐주얼'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Single+Day&display=swap',
    css_family: 'Single Day', weights: ['400'],
    preview_ko: '하루하루 쌓이는 일상의 기록', language: 'korean',
    supports_korean: true, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
]

// ============================================================
// 🔤 영문 폰트
// ============================================================
const ENGLISH_FONTS: FontEntry[] = [
  // --- Sans-Serif ---
  {
    id: 'inter', name: 'Inter', slug: 'inter',
    designer: 'Rasmus Andersson', foundry: 'Google Fonts',
    category: 'sans-serif', tags: ['sans-serif', 'modern', 'ui', 'clean', 'versatile'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;900&display=swap',
    css_family: 'Inter', weights: ['100','300','400','500','600','700','900'],
    preview_en: 'The future of interface design', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'dm-sans', name: 'DM Sans', slug: 'dm-sans',
    designer: 'Colophon Foundry', foundry: 'Google Fonts',
    category: 'sans-serif', tags: ['sans-serif', 'geometric', 'modern', 'branding', 'clean'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap',
    css_family: 'DM Sans', weights: ['300','400','500','700'],
    preview_en: 'Geometric Sans for Modern Brands', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'outfit', name: 'Outfit', slug: 'outfit',
    designer: 'On Brand', foundry: 'Google Fonts',
    category: 'sans-serif', tags: ['sans-serif', 'geometric', 'minimal', 'startup', 'tech'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;600;700;900&display=swap',
    css_family: 'Outfit', weights: ['100','300','400','500','600','700','900'],
    preview_en: 'Clean Geometric for Startups', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'plus-jakarta-sans', name: 'Plus Jakarta Sans', slug: 'plus-jakarta-sans',
    designer: 'Tokotype', foundry: 'Google Fonts',
    category: 'sans-serif', tags: ['sans-serif', 'modern', 'ui', 'dashboard', 'saas'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
    css_family: 'Plus Jakarta Sans', weights: ['300','400','500','600','700','800'],
    preview_en: 'The perfect SaaS & Dashboard font', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'manrope', name: 'Manrope', slug: 'manrope',
    designer: 'Mikhail Sharanda', foundry: 'Google Fonts',
    category: 'sans-serif', tags: ['sans-serif', 'geometric', 'elegant', 'modern', 'variable'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap',
    css_family: 'Manrope', weights: ['200','300','400','500','600','700','800'],
    preview_en: 'Elegant Geometric Variable Font', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'nunito', name: 'Nunito', slug: 'nunito',
    designer: 'Vernon Adams', foundry: 'Google Fonts',
    category: 'sans-serif', tags: ['sans-serif', 'rounded', 'friendly', 'app', 'ui'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700;800;900&display=swap',
    css_family: 'Nunito', weights: ['200','300','400','500','600','700','800','900'],
    preview_en: 'Friendly Rounded Sans for Apps', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'rubik', name: 'Rubik', slug: 'rubik',
    designer: 'Hubert & Fischer', foundry: 'Google Fonts',
    category: 'sans-serif', tags: ['sans-serif', 'rounded', 'bold', 'branding', 'tech'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap',
    css_family: 'Rubik', weights: ['300','400','500','600','700','800','900'],
    preview_en: 'Bold Rounded for Modern Brands', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },

  // --- Serif ---
  {
    id: 'playfair-display', name: 'Playfair Display', slug: 'playfair-display',
    designer: 'Claus Eggers Sørensen', foundry: 'Google Fonts',
    category: 'serif', tags: ['serif', 'elegant', 'editorial', 'luxury', 'magazine'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap',
    css_family: 'Playfair Display', weights: ['400','500','600','700','800','900'],
    preview_en: 'Elegant Editorial Typography', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'merriweather', name: 'Merriweather', slug: 'merriweather',
    designer: 'Sorkin Type', foundry: 'Google Fonts',
    category: 'serif', tags: ['serif', 'reading', 'body', 'comfortable', 'news'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap',
    css_family: 'Merriweather', weights: ['300','400','700','900'],
    preview_en: 'Designed for comfortable long-form reading', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'cormorant', name: 'Cormorant', slug: 'cormorant',
    designer: 'Christian Thalmann', foundry: 'Google Fonts',
    category: 'serif', tags: ['serif', 'luxury', 'fashion', 'elegant', 'display'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400;500;600;700&display=swap',
    css_family: 'Cormorant', weights: ['300','400','500','600','700'],
    preview_en: 'Luxury Fashion Editorial Font', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'lora', name: 'Lora', slug: 'lora',
    designer: 'Cyreal', foundry: 'Google Fonts',
    category: 'serif', tags: ['serif', 'modern', 'calligraphy', 'blog', 'reading'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
    css_family: 'Lora', weights: ['400','500','600','700'],
    preview_en: 'Modern serif with calligraphic roots', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'dm-serif', name: 'DM Serif Display', slug: 'dm-serif',
    designer: 'Colophon Foundry', foundry: 'Google Fonts',
    category: 'serif', tags: ['serif', 'display', 'editorial', 'contrast', 'elegant'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap',
    css_family: 'DM Serif Display', weights: ['400'],
    preview_en: 'High Contrast Display Serif', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },

  // --- Display ---
  {
    id: 'oswald', name: 'Oswald', slug: 'oswald',
    designer: 'Vernon Adams', foundry: 'Google Fonts',
    category: 'display', tags: ['display', 'bold', 'condensed', 'headline', 'poster'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&display=swap',
    css_family: 'Oswald', weights: ['200','300','400','500','600','700'],
    preview_en: 'BOLD CONDENSED HEADLINES', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'bebas-neue', name: 'Bebas Neue', slug: 'bebas-neue',
    designer: 'Ryoichi Tsunekawa', foundry: 'Google Fonts',
    category: 'display', tags: ['display', 'condensed', 'poster', 'impact', 'uppercase'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    css_family: 'Bebas Neue', weights: ['400'],
    preview_en: 'POWERFUL DISPLAY IMPACT', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'space-grotesk', name: 'Space Grotesk', slug: 'space-grotesk',
    designer: 'Florian Karsten', foundry: 'Google Fonts',
    category: 'display', tags: ['display', 'tech', 'futuristic', 'startup', 'modern'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
    css_family: 'Space Grotesk', weights: ['300','400','500','600','700'],
    preview_en: 'Tech & Futuristic Display Font', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'anton', name: 'Anton', slug: 'anton',
    designer: 'Vernon Adams', foundry: 'Google Fonts',
    category: 'display', tags: ['display', 'bold', 'impact', 'sports', 'headline'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
    css_family: 'Anton', weights: ['400'],
    preview_en: 'LOUD BOLD HEADLINE FONT', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'ultra', name: 'Ultra', slug: 'ultra',
    designer: 'Cyreal', foundry: 'Google Fonts',
    category: 'display', tags: ['display', 'heavy', 'serif', 'poster', 'impactful'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Ultra&display=swap',
    css_family: 'Ultra', weights: ['400'],
    preview_en: 'Ultra Heavy Serif Display', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },

  // --- Script ---
  {
    id: 'dancing-script', name: 'Dancing Script', slug: 'dancing-script',
    designer: 'Impallari Type', foundry: 'Google Fonts',
    category: 'script', tags: ['script', 'elegant', 'wedding', 'invitation', 'cursive'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap',
    css_family: 'Dancing Script', weights: ['400','600','700'],
    preview_en: 'Elegant Script for Special Occasions', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'pacifico', name: 'Pacifico', slug: 'pacifico',
    designer: 'Vernon Adams', foundry: 'Google Fonts',
    category: 'script', tags: ['script', 'fun', 'casual', 'logo', 'retro'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
    css_family: 'Pacifico', weights: ['400'],
    preview_en: 'Fun & Casual Script Logo', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'great-vibes', name: 'Great Vibes', slug: 'great-vibes',
    designer: 'TypeSETit', foundry: 'Google Fonts',
    category: 'script', tags: ['script', 'luxury', 'calligraphy', 'wedding', 'formal'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
    css_family: 'Great Vibes', weights: ['400'],
    preview_en: 'Luxurious Calligraphy Script', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'sacramento', name: 'Sacramento', slug: 'sacramento',
    designer: 'Astigmatic', foundry: 'Google Fonts',
    category: 'script', tags: ['script', 'thin', 'elegant', 'minimalist', 'branding'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Sacramento&display=swap',
    css_family: 'Sacramento', weights: ['400'],
    preview_en: 'Minimal & Elegant Thin Script', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'satisfy', name: 'Satisfy', slug: 'satisfy',
    designer: 'Sideshow', foundry: 'Google Fonts',
    category: 'script', tags: ['script', 'casual', 'flowing', 'signature', 'brand'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap',
    css_family: 'Satisfy', weights: ['400'],
    preview_en: 'Flowing Casual Script', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },

  // --- Slab Serif ---
  {
    id: 'roboto-slab', name: 'Roboto Slab', slug: 'roboto-slab',
    designer: 'Christian Robertson', foundry: 'Google Fonts',
    category: 'slab-serif', tags: ['slab-serif', 'robust', 'reading', 'editorial', 'versatile'],
    license: 'apache-2', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;300;400;500;700;900&display=swap',
    css_family: 'Roboto Slab', weights: ['100','300','400','500','700','900'],
    preview_en: 'Robust Slab Serif for Editorial', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'courier-prime', name: 'Courier Prime', slug: 'courier-prime',
    designer: 'Quote-Unquote Apps', foundry: 'Google Fonts',
    category: 'slab-serif', tags: ['slab-serif', 'typewriter', 'retro', 'screenplay', 'classic'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap',
    css_family: 'Courier Prime', weights: ['400','700'],
    preview_en: 'Classic Typewriter Style Font', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },

  // --- Monospace ---
  {
    id: 'fira-code', name: 'Fira Code', slug: 'fira-code',
    designer: 'Nikita Prokopov', foundry: 'Google Fonts',
    category: 'monospace', tags: ['monospace', 'coding', 'developer', 'ligatures', 'terminal'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap',
    css_family: 'Fira Code', weights: ['300','400','500','600','700'],
    preview_en: 'const code = () => "beautiful"', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'jetbrains-mono', name: 'JetBrains Mono', slug: 'jetbrains-mono',
    designer: 'JetBrains', foundry: 'JetBrains',
    category: 'monospace', tags: ['monospace', 'coding', 'developer', 'ide', 'terminal'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;300;400;500;700&display=swap',
    css_family: 'JetBrains Mono', weights: ['100','300','400','500','700'],
    preview_en: 'function dev() { return joy; }', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: true, added_at: '2025-01-01',
  },
  {
    id: 'source-code-pro', name: 'Source Code Pro', slug: 'source-code-pro',
    designer: 'Paul D. Hunt', foundry: 'Adobe',
    category: 'monospace', tags: ['monospace', 'coding', 'adobe', 'clear', 'terminal'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200;300;400;500;600;700;900&display=swap',
    css_family: 'Source Code Pro', weights: ['200','300','400','500','600','700','900'],
    preview_en: 'Monospace for Serious Coders', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'space-mono', name: 'Space Mono', slug: 'space-mono',
    designer: 'Colophon Foundry', foundry: 'Google Fonts',
    category: 'monospace', tags: ['monospace', 'tech', 'retro', 'terminal', 'geometric'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
    css_family: 'Space Mono', weights: ['400','700'],
    preview_en: '>>> Retro Terminal Aesthetic', language: 'english',
    supports_korean: false, supports_latin: true, is_featured: false, added_at: '2025-01-01',
  },
]

// ============================================================
// 🌏 한+영 혼용 폰트
// ============================================================
const BOTH_FONTS: FontEntry[] = [
  {
    id: 'noto-sans', name: 'Noto Sans', slug: 'noto-sans',
    designer: 'Google', foundry: 'Google',
    category: 'sans-serif', tags: ['sans-serif', '다국어', '유니코드', '글로벌'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100;300;400;500;700;900&display=swap',
    css_family: 'Noto Sans', weights: ['100','300','400','500','700','900'],
    preview_ko: 'Universal', preview_en: 'Universal Font for Every Language',
    language: 'both', supports_korean: true, supports_latin: true,
    is_featured: false, added_at: '2025-01-01',
  },
  {
    id: 'ibm-plex-sans', name: 'IBM Plex Sans', slug: 'ibm-plex-sans',
    designer: 'Mike Abbink', foundry: 'IBM',
    category: 'sans-serif', tags: ['sans-serif', 'IBM', 'tech', 'global', 'corporate'],
    license: 'ofl', is_commercial: true,
    cdn_url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100;300;400;500;600;700&display=swap',
    css_family: 'IBM Plex Sans', weights: ['100','300','400','500','600','700'],
    preview_ko: '테크 IBM', preview_en: 'IBM Plex Sans — Tech Corporate',
    language: 'both', supports_korean: false, supports_latin: true,
    is_featured: false, added_at: '2025-01-01',
  },
]

// ============================================================
// 전체 카탈로그 export
// ============================================================
export const FONT_CATALOG: FontEntry[] = [
  ...KOREAN_FONTS,
  ...ENGLISH_FONTS,
  ...BOTH_FONTS,
]

// 편의 함수들
export function getFontBySlug(slug: string): FontEntry | undefined {
  return FONT_CATALOG.find(f => f.slug === slug)
}

export function getFeaturedFonts(): FontEntry[] {
  return FONT_CATALOG.filter(f => f.is_featured)
}

export function filterFonts(params: {
  language?: string
  category?: string
  license?: string
  search?: string
  sort?: string
}): FontEntry[] {
  let result = [...FONT_CATALOG]

  if (params.language && params.language !== 'all') {
    if (params.language === 'korean')  result = result.filter(f => f.supports_korean)
    if (params.language === 'english') result = result.filter(f => f.supports_latin && f.language !== 'korean')
    if (params.language === 'both')    result = result.filter(f => f.language === 'both')
  }

  if (params.category && params.category !== 'all') {
    result = result.filter(f => f.category === params.category)
  }

  if (params.license && params.license !== 'all') {
    result = result.filter(f => f.license === params.license)
  }

  if (params.search?.trim()) {
    const q = params.search.toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.designer?.toLowerCase().includes(q) ||
      f.foundry?.toLowerCase().includes(q) ||
      f.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  switch (params.sort) {
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'newest':
      result.sort((a, b) => b.added_at.localeCompare(a.added_at))
      break
    default: // featured first
      result.sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
  }

  return result
}

export const CATALOG_STATS = {
  total: FONT_CATALOG.length,
  korean: FONT_CATALOG.filter(f => f.supports_korean).length,
  english: FONT_CATALOG.filter(f => f.language === 'english').length,
  both: FONT_CATALOG.filter(f => f.language === 'both').length,
  featured: FONT_CATALOG.filter(f => f.is_featured).length,
}
