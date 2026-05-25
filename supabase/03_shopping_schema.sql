-- =============================================
-- 03_shopping_schema.sql
-- shopping 스키마 — 구매/배송 앱 전용 (템플릿)
-- 실행 순서: 해당 앱 개발 시작 시점에 실행
-- =============================================

create schema if not exists shopping;

grant usage on schema shopping to anon, authenticated, service_role;
grant all   on all tables    in schema shopping to anon, authenticated, service_role;
grant all   on all sequences in schema shopping to anon, authenticated, service_role;
alter default privileges in schema shopping
  grant all on tables    to anon, authenticated, service_role;

-- 쇼핑 앱 사용자 프로필
create table if not exists shopping.profiles (
  user_id          uuid primary key references public.users(id) on delete cascade,
  default_address  text,
  phone            text,
  created_at       timestamptz default now()
);

-- 상품
create table if not exists shopping.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  price       bigint not null,
  stock       integer default 0,
  image_url   text,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 주문
create table if not exists shopping.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id),
  status          text check (status in ('pending','paid','shipped','delivered','cancelled')) default 'pending',
  total_amount    bigint not null,
  shipping_address text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 주문 상세
create table if not exists shopping.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references shopping.orders(id) on delete cascade,
  product_id uuid not null references shopping.products(id),
  quantity   integer not null,
  unit_price bigint  not null
);

create index if not exists idx_shop_orders_user
  on shopping.orders(user_id, created_at desc);

drop trigger if exists shop_orders_updated_at on shopping.orders;
create trigger shop_orders_updated_at
  before update on shopping.orders
  for each row execute function public.update_updated_at();

alter table shopping.profiles    enable row level security;
alter table shopping.orders      enable row level security;
alter table shopping.order_items enable row level security;
alter table shopping.products    enable row level security;

drop policy if exists "shop_profiles_own" on shopping.profiles;
drop policy if exists "shop_orders_own"   on shopping.orders;
drop policy if exists "shop_items_own"    on shopping.order_items;
drop policy if exists "shop_products_all" on shopping.products;

create policy "shop_profiles_own" on shopping.profiles
  for all using (auth.uid() = user_id);
create policy "shop_orders_own"   on shopping.orders
  for all using (auth.uid() = user_id);
create policy "shop_items_own"    on shopping.order_items
  for all using (
    order_id in (
      select id from shopping.orders where user_id = auth.uid()
    )
  );
create policy "shop_products_all" on shopping.products
  for select using (true);
