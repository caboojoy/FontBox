# FontBox — 한글·영문 무료 웹폰트 플랫폼

> 포트폴리오용 · 운영비 0원 · Supabase 기반 · git push 없이 폰트 추가 가능

---

## 💰 비용 구조 (연간 ~$0)

| 서비스 | 용도 | 비용 |
|--------|------|------|
| Vercel Hobby | 호스팅 + 자동 배포 | $0 |
| Supabase Free | 폰트 DB + AI 캐시 + 즐겨찾기 | $0 |
| Google Fonts CDN | 폰트 파일 서빙 | $0 |
| Anthropic API | AI 추천 (캐싱으로 최소화) | ~$0.003/신규 요청 |

---

## ⚡ 셋업 순서

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수
cp .env.example .env.local
# → NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY 입력

# 3. Supabase 초기화 (순서 중요)
# Supabase 대시보드 > SQL Editor 에서:
# (1) supabase/schema.sql 실행
# (2) supabase/seed.sql 실행  ← 초기 폰트 57개 삽입 (한 번만)

# 4. 실행
npm run dev
```

---

## ➕ 폰트 추가 방법 (git push 불필요!)

### 방법 A — /admin 페이지 (가장 쉬움)
1. `/admin` 접속
2. "새 폰트 추가" 탭에서 폼 입력
3. "Supabase에 저장" 클릭
4. **즉시 반영** — 재배포 없음

### 방법 B — Supabase 대시보드
1. Supabase > Table Editor > fonts 테이블
2. "Insert row" 클릭 후 직접 입력
3. 저장 즉시 반영

### Google Fonts URL 패턴
```
https://fonts.googleapis.com/css2?family=폰트명+치환:wght@400;700&display=swap
예) Noto Sans KR → family=Noto+Sans+KR:wght@300;400;700&display=swap
```

---

## 📁 구조

```
fontbox/
├── supabase/
│   ├── schema.sql    DB 스키마 (최초 1회 실행)
│   └── seed.sql      초기 폰트 57개 (최초 1회 실행)
├── actions/
│   ├── fonts.ts      폰트 CRUD Server Actions
│   └── ai.ts         AI 추천 (캐싱 포함)
├── app/
│   ├── page.tsx      메인 목록
│   ├── fonts/[slug]/ 폰트 상세
│   ├── ai/           AI 추천
│   ├── pairing/      한글+영문 페어링
│   ├── favorites/    즐겨찾기
│   └── admin/        폰트 관리 (추가/삭제/추천 설정)
└── .env.example
```

---

## 🌟 포트폴리오 포인트

- **Supabase 실시간 DB**: git push 없이 폰트 즉시 추가
- **AI 추천 + 캐싱**: Claude API 비용 최소화
- **한글+영문 페어링**: 눈누에 없는 차별화 기능
- **운영비 0원**: Vercel + Supabase Free 조합
