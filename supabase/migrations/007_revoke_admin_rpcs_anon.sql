-- 007 — Hardening de RPCs admin: revocar EXECUTE a `anon`.
-- Las funciones `admin_list_enrollments` y `admin_search_profiles_by_email`
-- son `security definer` y solo deben ejecutarlas usuarios autenticados con
-- rol de staff (la función verifica con `is_course_staff()` internamente).
-- Sin embargo, PostgREST las exponía a `anon` por defecto, lo que el
-- linter de Supabase reporta como warning (advisor 0028).
--
-- Nota: aunque la función ya filtra por staff, retirar el grant a `anon`
-- evita ruido en logs y deja la API más explícita. Mantenemos `authenticated`
-- porque las páginas admin lo necesitan.

revoke execute on function public.admin_list_enrollments() from anon;
revoke execute on function public.admin_search_profiles_by_email(text) from anon;

-- Helpers públicos que se llaman dentro de RLS pueden seguir disponibles.
-- (`is_superadmin`, `is_course_staff`, `is_course_admin`, `has_course_access`).

-- Recordatorio: en Supabase → Authentication → Settings, activar
-- "Leaked Password Protection" para silenciar el advisor
-- `auth_leaked_password_protection`.
