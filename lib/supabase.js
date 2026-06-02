// ──────────────────────────────────────────────────────────
// lib/supabase.js
//
// AI 뉴스봇 연동 시 이 파일에서 Supabase 클라이언트를 설정합니다.
//
// 사용 방법:
// 1. npm install @supabase/supabase-js
// 2. .env.local 파일에 아래 항목 추가
//    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
// 3. 아래 주석 해제 후 사용
// ──────────────────────────────────────────────────────────

// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── 뉴스 데이터 fetch 함수 예시 ──────────────────────────
// export async function getLatestNews(limit = 5) {
//   const { data, error } = await supabase
//     .from('ai_news')
//     .select('id, title, category, source, published_at, url')
//     .order('published_at', { ascending: false })
//     .limit(limit)
//
//   if (error) {
//     console.error('뉴스 fetch 오류:', error)
//     return []
//   }
//   return data
// }

// ── Supabase 테이블 구조 참고 (ai_news) ────────────────
// id           uuid       primary key
// title        text       한국어 요약 제목
// original     text       원문 제목
// category     text       LLM / 이미지AI / 자율주행 등
// source       text       출처 미디어명
// url          text       원문 URL
// published_at timestamp  발행 시각
// created_at   timestamp  수집 시각

export {}
