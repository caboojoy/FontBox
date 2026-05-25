-- =============================================
-- 02_accounting_schema.sql
-- accounting 스키마 — 회계보조 앱 전용 (템플릿)
-- 실행 순서: 해당 앱 개발 시작 시점에 실행
--
-- 분리 시: 이 파일 하나만 export 하면 회계 앱 전체 이관 가능
-- public.users 참조로 로그인은 공통 Auth를 그대로 사용
-- =============================================

create schema if not exists accounting;

grant usage on schema accounting to anon, authenticated, service_role;
grant all   on all tables    in schema accounting to anon, authenticated, service_role;
grant all   on all sequences in schema accounting to anon, authenticated, service_role;
alter default privileges in schema accounting
  grant all on tables    to anon, authenticated, service_role;

-- 회계 앱 사용자 프로필 (공통 users 확장)
create table if not exists accounting.profiles (
  user_id      uuid primary key references public.users(id) on delete cascade,
  company_name text,
  business_no  text,                  -- 사업자등록번호
  plan         text default 'free',   -- free | pro
  created_at   timestamptz default now()
);

-- 거래내역
create table if not exists accounting.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  date        date not null,
  type        text check (type in ('income','expense')),
  amount      bigint not null,         -- 원 단위
  category    text,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists idx_acct_tx_user_date
  on accounting.transactions(user_id, date desc);

drop trigger if exists acct_tx_updated_at on accounting.transactions;
create trigger acct_tx_updated_at
  before update on accounting.transactions
  for each row execute function public.update_updated_at();

alter table accounting.profiles      enable row level security;
alter table accounting.transactions  enable row level security;

drop policy if exists "acct_profiles_own" on accounting.profiles;
drop policy if exists "acct_tx_own"       on accounting.transactions;

create policy "acct_profiles_own" on accounting.profiles
  for all using (auth.uid() = user_id);
create policy "acct_tx_own"       on accounting.transactions
  for all using (auth.uid() = user_id);
