-- ============================================================
-- 05_lock_fonts_writes.sql
-- 공개(anon) 키로 폰트·AI 캐시를 추가·수정·삭제하지 못하게 막는다.
--
-- 사이트의 쓰기는 모두 서버에서 service_role 키로 한다
-- (관리 페이지 서버 액션, 다운로드 수, AI 추천 캐시, scripts/*.ts, GitHub 동기화).
-- service_role 은 RLS 를 거치지 않으므로 아래 정책을 지워도 그 기능들은 그대로 동작한다.
--
-- 실행: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run. 여러 번 실행해도 된다.
-- ============================================================

drop policy if exists "fonts_insert_all"  on fonts.fonts;
drop policy if exists "fonts_update_all"  on fonts.fonts;
drop policy if exists "fonts_delete_all"  on fonts.fonts;

drop policy if exists "ai_cache_insert"   on fonts.ai_cache;
drop policy if exists "ai_cache_update"   on fonts.ai_cache;

-- 확인: 아래 결과에 select 정책만 남아 있어야 한다
select tablename, policyname, cmd
from pg_policies
where schemaname = 'fonts' and tablename in ('fonts', 'ai_cache')
order by tablename, policyname;
