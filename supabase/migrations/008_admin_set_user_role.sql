-- 008 — RPC `admin_set_user_role` para que un superadmin pueda
-- promover/degradar usuarios sin tocar SQL.
--
-- La función:
--   • Es SECURITY DEFINER.
--   • Solo se ejecuta si `is_superadmin()` retorna true (defensa en
--     profundidad: el trigger `profiles_enforce_role_change` (006)
--     ya bloquea cualquier UPDATE de role sin superadmin).
--   • Valida que el rol pedido esté en el enum public.app_role.
--   • Devuelve la fila actualizada de profiles.
--
-- Aplicada al remoto vía mcp__supabase__apply_migration el 2026-05-09.

create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role public.app_role
)
returns table (
  id uuid,
  email text,
  full_name text,
  role public.app_role,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Solo un superadmin puede cambiar roles.'
      using errcode = '42501';
  end if;

  if p_user_id is null then
    raise exception 'p_user_id es requerido.';
  end if;

  update public.profiles p
  set role = p_role,
      updated_at = now()
  where p.id = p_user_id;

  if not found then
    raise exception 'Usuario no encontrado: %', p_user_id
      using errcode = 'P0002';
  end if;

  return query
    select p.id, p.email, p.full_name, p.role, p.updated_at
    from public.profiles p
    where p.id = p_user_id;
end;
$$;

-- Permisos: revocar de PUBLIC, dar solo a authenticated. La función
-- internamente valida is_superadmin() así que un course_admin que la
-- llame recibirá 42501.
revoke execute on function public.admin_set_user_role(uuid, public.app_role) from PUBLIC;
revoke execute on function public.admin_set_user_role(uuid, public.app_role) from anon;
grant execute on function public.admin_set_user_role(uuid, public.app_role) to authenticated;
