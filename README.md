# caboo.net — 메인 도메인 웹사이트

회계사가 만드는 AI 도구들 · 1인 소프트웨어 스튜디오

## 빠른 시작

```bash
# 1. 패키지 설치
npm install

# 2. 개발 서버 실행
npm run dev
# → http://localhost:3000 접속
```

## Vercel 배포

```bash
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 배포
vercel
```

또는 GitHub 리포에 push → Vercel 대시보드에서 자동 배포

## 환경 변수 (.env.local)

```env
# AI 뉴스봇 연동 시 추가 (현재 미사용)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 프로젝트 구조

```
caboo-main/
├── app/
│   ├── layout.jsx      ← 루트 레이아웃 + 메타데이터
│   ├── page.jsx        ← 메인 페이지 조립
│   └── globals.css     ← 파스텔 스카이 기본 스타일
├── components/
│   ├── Navbar.jsx      ← 스티키 네비게이션
│   ├── Hero.jsx        ← 히어로 섹션
│   ├── ProjectSection.jsx ← 프로젝트 카드 그리드 + 필터
│   ├── NewsSection.jsx ← AI 뉴스 카드 섹션
│   ├── AboutSection.jsx← 소개 + 기술 스택
│   └── Footer.jsx      ← 푸터
├── data/
│   └── projects.js     ← 전체 프로젝트 데이터 (17개)
├── lib/
│   └── supabase.js     ← Supabase 연동 준비 (주석 처리)
└── tailwind.config.js  ← 파스텔 스카이 커스텀 컬러
```

## 자주 수정하는 항목

### 프로젝트 URL 연결
`data/projects.js` 에서 각 프로젝트의 `url` 필드 교체

```js
{
  name: '계산기 웹앱',
  url: 'https://your-calculators-domain.com',  // ← 여기 교체
  subDomain: 'calculators.caboo.net',
}
```

### 서브도메인 연결 (Vercel)
Vercel 프로젝트 설정 → Domains → `calculators.caboo.net` 추가
도메인 레지스트라에서 CNAME → `cname.vercel-dns.com` 설정

### AI 뉴스 데이터 연동
1. `lib/supabase.js` 주석 해제
2. `.env.local` 에 Supabase 키 입력
3. `components/NewsSection.jsx` 상단 TODO 주석 참고

## 색상 시스템 (파스텔 스카이)

| 변수 | 색상 | 용도 |
|------|------|------|
| brand-50  | #F0F9FF | 페이지 배경 |
| brand-100 | #E0F2FE | 섹션 배경 · 카드 |
| brand-200 | #BAE6FD | 테두리 |
| brand-400 | #38BDF8 | CTA 버튼 |
| brand-600 | #0284C7 | 네비 · 로고 |
