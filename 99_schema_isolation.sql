-- =============================================
-- 99_schema_isolation.sql — 스키마 간 침범 방지
-- 실행: 모든 스키마 생성 완료 후 1회 실행
-- 목적: 각 앱이 자신의 스키마에만 접근 가능하도록 강제
-- =============================================

-- ─────────────────────────────────────────────
-- 1. fonts 스키마 격리
--    accounting, shopping, stock 에서 접근 불가
-- ─────────────────────────────────────────────
REVOKE ALL ON SCHEMA fonts FROM anon, authenticated;

-- fonts 스키마는 fonts 전용 권한만 부여
GRANT USAGE ON SCHEMA fonts TO anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA fonts TO anon, authenticated, service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA fonts TO anon, authenticated, service_role;

-- ─────────────────────────────────────────────
-- 2. accounting 스키마 격리 (앱 개발 시 활성화)
-- ─────────────────────────────────────────────
-- DO $$ BEGIN
--   IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'accounting') THEN
--     REVOKE ALL ON SCHEMA accounting FROM anon;
--     GRANT USAGE ON SCHEMA accounting TO authenticated, service_role;
--     GRANT ALL ON ALL TABLES IN SCHEMA accounting TO authenticated, service_role;
--   END IF;
-- END $$;

-- ─────────────────────────────────────────────
-- 3. shopping 스키마 격리 (앱 개발 시 활성화)
-- ─────────────────────────────────────────────
-- DO $$ BEGIN
--   IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'shopping') THEN
--     REVOKE ALL ON SCHEMA shopping FROM anon;
--     GRANT USAGE ON SCHEMA shopping TO authenticated, service_role;
--     GRANT ALL ON ALL TABLES IN SCHEMA shopping TO authenticated, service_role;
--   END IF;
-- END $$;

-- ─────────────────────────────────────────────
-- 4. 스키마별 접근 권한 현황 확인 쿼리 (실행 후 검증용)
-- ─────────────────────────────────────────────
-- SELECT
--   n.nspname AS schema_name,
--   r.rolname AS role_name,
--   has_schema_privilege(r.rolname, n.nspname, 'USAGE') AS can_use
-- FROM pg_namespace n, pg_roles r
-- WHERE n.nspname IN ('fonts','accounting','shopping','stock','public')
--   AND r.rolname IN ('anon','authenticated','service_role')
-- ORDER BY schema_name, role_name;
