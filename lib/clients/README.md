# 앱별 클라이언트 파일

각 앱은 자신의 클라이언트 파일만 import합니다.

| 파일 | 앱 | 스키마 | 상태 |
|------|----|--------|------|
| fonts.ts | FontBox | fonts | ✅ 운영 중 |
| accounting.ts | 회계보조 | accounting | 🔒 개발 예정 |
| shopping.ts | 구매/배송 | shopping | 🔒 개발 예정 |
| stock.ts | 주식분석 | stock | 🔒 개발 예정 |

## 새 앱 추가 시

```typescript
// lib/clients/[앱명].ts
import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY || anon

export const [앱명]Db = createClient(url, anon, {
  db: { schema: '[스키마명]' },
})

export const create[앱명]ServerClient = () =>
  createClient(url, svc, { db: { schema: '[스키마명]' } })
```

## 격리 원칙

1. **DB 레벨**: `99_schema_isolation.sql` — REVOKE로 교차 접근 차단
2. **API 레벨**: `db: { schema: '...' }` — PostgREST가 해당 스키마만 서빙
3. **코드 레벨**: 이 폴더의 파일만 import — 다른 앱 클라이언트 참조 금지
