-- =============================================
-- 04_stock_schema.sql
-- stock 스키마 — 주식분석 앱 전용 (템플릿)
-- 실행 순서: 해당 앱 개발 시작 시점에 실행
-- =============================================

create schema if not exists stock;

grant usage on schema stock to anon, authenticated, service_role;
grant all   on all tables    in schema stock to anon, authenticated, service_role;
grant all   on all sequences in schema stock to anon, authenticated, service_role;
alter default privileges in schema stock
  grant all on tables    to anon, authenticated, service_role;

-- 관심 종목
create table if not exists stock.watchlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  ticker     text not null,           -- 종목코드 ex) 005930
  name       text,                    -- 종목명
  market     text default 'KRX',      -- KRX | NASDAQ | NYSE
  created_at timestamptz default now(),
  unique(user_id, ticker)
);

-- 분석 메모
create table if not exists stock.memos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  ticker     text not null,
  content    text,
  created_at timestamptz default now()
);

create index if not exists idx_stock_watchlist_user
  on stock.watchlist(user_id);

alter table stock.watchlist  enable row level security;
alter table stock.memos      enable row level security;

drop policy if exists "stock_watchlist_own" on stock.watchlist;
drop policy if exists "stock_memos_own"     on stock.memos;

create policy "stock_watchlist_own" on stock.watchlist
  for all using (auth.uid() = user_id);
create policy "stock_memos_own"     on stock.memos
  for all using (auth.uid() = user_id);
