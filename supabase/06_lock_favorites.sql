-- ============================================================
-- 06_lock_favorites.sql
-- fonts.favorites 를 공개(anon) 키로 읽고 쓰지 못하게 막는다.
--
-- 사이트의 즐겨찾기는 브라우저(localStorage)에만 저장하고 이 테이블은 쓰지 않는다.
-- 정책을 지우면 anon 은 아무것도 못 하고, service_role 은 그대로 쓸 수 있다.
--
-- 실행: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run. 여러 번 실행해도 된다.
-- ============================================================

drop policy if exists "favorites_own" on fonts.favorites;

-- 확인: 아래 결과가 비어 있어야 한다 (favorites 에 정책 없음 = anon 접근 불가)
select tablename, policyname, cmd
from pg_policies
where schemaname = 'fonts' and tablename = 'favorites';
