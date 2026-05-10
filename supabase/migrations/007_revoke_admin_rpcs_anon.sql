-- 007 — Hardening de RPCs admin: revocar EXECUTE de `PUBLIC` (que es de
-- donde `anon` y `authenticated` heredan por defecto en Supabase) y
-- re-otorgar solo a `authenticated`.
--
-- Las funciones `admin_list_enrollments` y `admin_search_profiles_by_email`
-- son `security definer` y validan internamente con `is_course_staff()`,
-- pero PostgREST las exponía a `anon` por herencia de PUBLIC. El advisor
-- de Supabase (lint 0028) lo reportaba como warning.
--
-- Aplicado al remoto vía mcp__supabase__apply_migration el 2026-05-09.

revoke execute on function public.admin_list_enrollments() from PUBLIC;
revoke execute on function public.admin_search_profiles_by_email(text) from PUBLIC;

-- Asegurar que `authenticated` sigue teniéndolo (matriculas page lo necesita).
grant execute on function public.admin_list_enrollments() to authenticated;
grant execute on function public.admin_search_profiles_by_email(text) to authenticated;

-- También revocar a anon explícitamente por defensa en profundidad.
revoke execute on function public.admin_list_enrollments() from anon;
revoke execute on function public.admin_search_profiles_by_email(text) from anon;

-- Recordatorio: en Supabase → Authentication → Settings, activar
-- "Leaked Password Protection" para silenciar el advisor
-- `auth_leaked_password_protection`.
