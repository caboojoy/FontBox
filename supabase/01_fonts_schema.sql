-- =============================================
-- 01_fonts_schema.sql — FontBox 전용 스키마
-- 실행 순서: 2번째 (00_public_schema.sql 이후)
--
-- ★ 실행 후 Supabase 설정 필수:
--   Settings → API → Extra Search Path
--   → "public, fonts" 로 변경 후 저장
--
-- ★ 격리 원칙:
--   - fonts 스키마는 FontBox 앱만 접근
--   - 다른 앱(accounting, shopping)은 이 스키마에 접근 불가
--   - 99_schema_isolation.sql 에서 강제 적용
--
-- 분리 시: 이 파일 + seed.sql → 새 Supabase 프로젝트
--          lib/supabase.ts URL/키만 교체하면 완료
-- =============================================

create schema if not exists fonts;

-- fonts 스키마 API 접근 권한
grant usage  on schema fonts to anon, authenticated, service_role;
grant all    on all tables    in schema fonts to anon, authenticated, service_role;
grant all    on all sequences in schema fonts to anon, authenticated, service_role;
alter default privileges in schema fonts
  grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema fonts
  grant all on sequences to anon, authenticated, service_role;

-- 폰트 목록
create table if not exists fonts.fonts (
  id              uuid    primary key default gen_random_uuid(),
  name            text    not null,
  slug            text    unique not null,
  designer        text,
  foundry         text,
  category        text    not null,
  tags            text[]  default '{}',
  license         text    check (license in ('ofl','free','commercial-free','apache-2')) default 'ofl',
  is_commercial   boolean default true,
  cdn_url         text    not null,
  css_family      text    not null,
  weights         text[]  default '{"400"}',
  preview_ko      text    default '다람쥐 헌 쳇바퀴에 타고파',
  preview_en      text    default 'The quick brown fox jumps over the lazy dog',
  language        text    check (language in ('korean','english','both')) default 'korean',
  supports_korean boolean default false,
  supports_latin  boolean default true,
  is_featured     boolean default false,
  download_count  integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- AI 추천 캐시
create table if not exists fonts.ai_cache (
  id          uuid primary key default gen_random_uuid(),
  cache_key   text unique not null,
  prompt      text not null,
  font_slugs  text[]  default '{}',
  reasoning   text,
  pairing_tip text,
  hit_count   integer default 0,
  created_at  timestamptz default now()
);

-- 즐겨찾기
create table if not exists fonts.favorites (
  id         uuid primary key default gen_random_uuid(),
  device_id  text not null,
  font_slug  text not null references fonts.fonts(slug) on delete cascade,
  created_at timestamptz default now(),
  unique(device_id, font_slug)
);

-- 인덱스
create index if not exists idx_fonts_language   on fonts.fonts(language);
create index if not exists idx_fonts_category   on fonts.fonts(category);
create index if not exists idx_fonts_featured   on fonts.fonts(is_featured) where is_featured = true;
create index if not exists idx_fonts_created_at on fonts.fonts(created_at desc);
create index if not exists idx_fonts_downloads  on fonts.fonts(download_count desc);
create index if not exists idx_ai_cache_key     on fonts.ai_cache(cache_key);
create index if not exists idx_favorites_device on fonts.favorites(device_id);

-- updated_at 트리거
drop trigger if exists fonts_updated_at on fonts.fonts;
create trigger fonts_updated_at
  before update on fonts.fonts
  for each row execute function public.update_updated_at();

-- RLS
alter table fonts.fonts     enable row level security;
alter table fonts.ai_cache  enable row level security;
alter table fonts.favorites enable row level security;

drop policy if exists "fonts_select_all"  on fonts.fonts;
drop policy if exists "fonts_insert_all"  on fonts.fonts;
drop policy if exists "fonts_update_all"  on fonts.fonts;
drop policy if exists "fonts_delete_all"  on fonts.fonts;
drop policy if exists "ai_cache_select"   on fonts.ai_cache;
drop policy if exists "ai_cache_insert"   on fonts.ai_cache;
drop policy if exists "ai_cache_update"   on fonts.ai_cache;
drop policy if exists "favorites_own"     on fonts.favorites;

create policy "fonts_select_all" on fonts.fonts for select using (true);
create policy "fonts_insert_all" on fonts.fonts for insert with check (true);
create policy "fonts_update_all" on fonts.fonts for update using (true);
create policy "fonts_delete_all" on fonts.fonts for delete using (true);

create policy "ai_cache_select"  on fonts.ai_cache for select using (true);
create policy "ai_cache_insert"  on fonts.ai_cache for insert with check (true);
create policy "ai_cache_update"  on fonts.ai_cache for update using (true);

create policy "favorites_own"    on fonts.favorites for all using (true);
