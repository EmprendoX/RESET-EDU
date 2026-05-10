# Migraciones — Estado y deriva

> Última revisión: 2026-05-09. Auditado vía `mcp__supabase__list_migrations`
> + `pg_proc` y comparado contra `supabase/migrations/`.

## Migraciones registradas en Supabase remoto

| Versión | Nombre |
|---|---|
| `20260508114256` | `storage_lesson_files_private` |
| `20260508185557` | `storage_course_covers_public` |
| `20260508190038` | `storage_course_covers_no_listing` |

## Migraciones en disco (`supabase/migrations/`)

| Archivo | Estado |
|---|---|
| `001_initial_schema.sql` | ✅ aplicada (schema y tablas existen) |
| `002_course_lesson_count.sql` | ✅ aplicada (columna `courses.lesson_count` y trigger `lessons_touch_course_lesson_count` existen) |
| `003_rls_preview_lesson_assets_and_hardening.sql` | ✅ aplicada (políticas activas) |
| `004_storage_lesson_files.sql` | ✅ registrada como `20260508114256` |
| `005_grant_has_course_access_rpc.sql` | ✅ aplicada (función `has_course_access` existe) |
| `006_admin_superadmin_split.sql` | ✅ aplicada (`is_superadmin`, `is_course_staff`, `admin_list_enrollments`, `admin_search_profiles_by_email`, trigger `profiles_enforce_role_change` y `activity_logs` existen) |

## Deriva detectada

Los archivos `001`, `002`, `003`, `005` y `006` se aplicaron al proyecto remoto
(funciones, columnas y políticas existen) pero **no figuran en
`supabase_migrations.schema_migrations`**. Esto sucede cuando se ejecuta el
SQL desde el editor del dashboard de Supabase en lugar de `supabase db push`.

**Riesgo**: el siguiente `supabase db push` intentará reaplicar todas las
migraciones desde cero y fallará por colisión.

## Plan de reconciliación

Cuando se vuelva a usar `supabase db push` localmente, registrar las
migraciones ya aplicadas con `supabase migration repair --status applied`
para cada versión, o insertar manualmente en
`supabase_migrations.schema_migrations` las filas equivalentes:

```sql
-- Ejecutar en SQL editor o vía MCP execute_sql.
insert into supabase_migrations.schema_migrations (version, name, statements)
values
  ('001', '001_initial_schema', array[]::text[]),
  ('002', '002_course_lesson_count', array[]::text[]),
  ('003', '003_rls_preview_lesson_assets_and_hardening', array[]::text[]),
  ('005', '005_grant_has_course_access_rpc', array[]::text[]),
  ('006', '006_admin_superadmin_split', array[]::text[])
on conflict (version) do nothing;
```

**No ejecutar** este script sin antes verificar el esquema de
`supabase_migrations.schema_migrations` en tu proyecto: la columna
`statements` puede ser obligatoria o no según versión del CLI.

## Workflow recomendado a partir de hoy

1. Crear migración con `supabase migration new <nombre>`.
2. Editar el archivo SQL.
3. `supabase db push` para aplicar al remoto registrando la versión.
4. Verificar con `mcp__supabase__list_migrations` que aparezca.

Esto evita la deriva de aplicar SQL manualmente desde el dashboard.
