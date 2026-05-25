-- =============================================
-- 00_public_schema.sql
-- 공통(public) 스키마 — 모든 앱이 공유
-- 실행 순서: 1번째
--
-- 설계 원칙:
--   - public 스키마에는 인증과 공통 사용자 정보만 둔다
--   - 앱별 데이터는 각자의 스키마(fonts, accounting 등)에서 관리
--   - 각 앱의 users 테이블은 public.users.id 를 외래키로 참조
--   - 앱 분리 시 해당 스키마만 export/drop 하면 된다
-- =============================================

-- Supabase Auth(auth.users)와 연동하는 공통 프로필 테이블
-- auth.users 는 Supabase가 자동 생성, 여기서는 앱에 필요한 추가 정보만 저장
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique,
  name         text,
  avatar_url   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 새 Auth 유저 가입 시 public.users 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at 공통 트리거 함수 (모든 스키마에서 재사용)
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- RLS
alter table public.users enable row level security;

-- 재실행 안전: 기존 정책 삭제 후 재생성
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_update_own" on public.users;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);
