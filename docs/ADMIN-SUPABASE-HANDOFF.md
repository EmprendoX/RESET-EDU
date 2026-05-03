# Admin / Course Builder → Supabase (handoff)

Este documento enlaza el modelo del [PRD §11](PRD.md) con la implementación mock actual para migrar `adminCoursesRepo` y `coursesRepo` a Supabase sin cambiar las firmas públicas de los repos.

Los **datos semilla** del catálogo admin y del curso demo del aula conviven en [`src/data/mockAdminCourses.ts`](../src/data/mockAdminCourses.ts); la persistencia mock del catálogo sigue en [`courseCatalogMockStore`](../src/data/courseCatalogMockStore.ts).

## Variables de entorno (frontend)

Definidas en [`.env.example`](../.env.example) y leídas en [`src/config/env.ts`](../src/config/env.ts):

| Variable | Uso |
|----------|-----|
| `VITE_SUPABASE_URL` | URL del proyecto (`https://<ref>.supabase.co`, sin `/rest/v1/`). |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (Settings → API). |
| `VITE_USE_SUPABASE_DATA` | `true` cuando los repos lean de Supabase (requiere esquema aplicado y datos). |
| `VITE_PUBLIC_APP_URL` | Opcional. URL pública **https** de la app (p. ej. `https://tu-app.netlify.app`). Si está definida y es válida, el **registro** (`signUp` en [`LoginPage.tsx`](../src/pages/auth/LoginPage.tsx)) usa esta base para `emailRedirectTo` (enlace del correo de confirmación). Si no, se usa `window.location.origin` (registro desde local → link a local). Debe estar permitida en Redirect URLs de Supabase. |
| `VITE_MOCK_USER_ROLE` | Solo sin Supabase: `student` o por defecto admin demo. |

Copia `.env.example` a **`.env.local`** (no commitear). En Supabase: **Authentication → URL configuration** configura **Site URL** (normalmente producción) y **Redirect URLs**: incluye `https://tu-dominio/...` y rutas de callback (p. ej. `.../login`), más `http://localhost:5173/**` si desarrollas en local. Patrones y comodines: guía oficial [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## Primer usuario administrador

1. Con `VITE_SUPABASE_*` configurados, regístrate en `/login` (modo registro; ver `src/pages/auth/LoginPage.tsx`).
2. El trigger `on_auth_user_created` crea `profiles` con rol `student`.
3. En el **SQL Editor** del dashboard (o Table Editor), actualiza tu fila: `update public.profiles set role = 'course_admin' where id = '<tu_user_uuid>';` (o `superadmin`).

## Inventario esquema / migraciones

- Las migraciones locales viven en [`supabase/migrations/`](../supabase/migrations/): `001_initial_schema.sql`, `002_course_lesson_count.sql`, `003_rls_preview_lesson_assets_and_hardening.sql`.
- El esquema remoto revisado vía MCP coincide con **001+002** (tablas `public.*`, RLS, `courses.lesson_count`). Si `list_migrations` del proyecto está vacío, el DDL pudo aplicarse fuera del tracking CLI: conviene aplicar las migraciones desde este repo (`supabase db push` con [CLI](https://supabase.com/docs/guides/cli) o pegando el SQL en el **SQL Editor**) para alinear historial.

### Aplicar `003` en el proyecto Supabase

1. Abre [`supabase/migrations/003_rls_preview_lesson_assets_and_hardening.sql`](../supabase/migrations/003_rls_preview_lesson_assets_and_hardening.sql).
2. Ejecuta el archivo completo en el SQL Editor (o `supabase db push` si el proyecto está enlazado).

Contenido principal de **003**: `lesson_assets` + RLS; políticas de lectura para **lecciones preview** públicas y **temario** (`course_modules` / `course_sections`) en cursos `published`; `set_updated_at` con `search_path` fijo; `REVOKE EXECUTE` en `handle_new_user`, `refresh_course_lesson_count`, `lessons_touch_course_lesson_count` para roles `anon` y `authenticated` (sigue el uso vía triggers / interno).

Tras aplicar, vuelve a ejecutar el **Security Advisor** del dashboard (o MCP `get_advisors`). Puede seguir avisando por `public.is_course_admin()` expuesto como RPC: corregirlo implica refactor (p. ej. esquema no expuesto o políticas sin esa función); no se revoca aquí para no romper las políticas RLS que lo invocan.

## Comprobaciones manuales sugeridas (PostgREST / SQL)

Con la **anon key** y sin `Authorization` (visitante): `select` sobre `courses` con `status = published`; `lessons` solo filas con `is_preview = true` y curso publicado; `course_modules` / `course_sections` del mismo curso.

Con JWT de **alumno** sin enrollment en curso de pago: no debe ver lecciones no preview de ese curso; en curso **gratis** publicado sí (vía `has_course_access`).

Con rol **course_admin** en `profiles`: CRUD de borradores y `lesson_assets` según políticas `*_write_admin`.

## Divergencias respecto al PRD §11 (documentadas)

| PRD | Implementación actual |
|-----|------------------------|
| `enrollments` con `id`, `status`, `enrolled_at`, `completed_at` | PK compuesta `(user_id, course_id)` y `created_at` únicamente; suficiente para MVP de acceso si no necesitáis estados de inscripción detallados. |
| `ai_messages` con `user_id`, `course_id`, `lesson_id` | Modelo mínimo por `thread_id`; el backend con `service_role` puede ampliar después. |
| `lesson_assets` | Tabla añadida en **003**; `file_type` usa el enum `public.file_type`; `visibility` `text` con check `public` / `private`. Validación `course_id` ↔ `lessons.course_id` vía trigger `lesson_assets_enforce_course_match`. |

## Tablas PRD → uso en el frontend mock

| Tabla PRD | Uso actual en mock | Repo lectura (alumno) | Repo escritura (admin) |
|-----------|-------------------|----------------------|-------------------------|
| `profiles` | No | — | Futuro: rol `course_admin` / RLS |
| `courses` | `Course` dentro de `CourseStructure` | `coursesRepo.getCourseStructureBySlug` | `adminCoursesRepo.updateCourseMetadata`, `publishCourse`, `setCourseStatus`, `createDraftCourse` |
| `course_modules` | `CourseModule[]` | Igual vía estructura | `addModule`, `updateModule`, `deleteModule`, `reorderModules` |
| `course_sections` | `CourseSection[]` | Igual | `addSection`, `updateSection`, `deleteSection`, `reorderSections` |
| `lessons` | `Lesson[]` | `getLessonById`, `getFirstLessonId` | `addLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`, `assignLessonPlacement` |
| `lesson_progress` | `localStorage` (demo) si no hay Supabase datos | `progressRepo` → [`progressSupabase.ts`](../src/lib/progress/progressSupabase.ts) con sesión | — |
| `notes` | `localStorage` (demo) si no hay Supabase datos | `notesRepo` → [`notesSupabase.ts`](../src/lib/notes/notesSupabase.ts) con sesión | — |
| `student_business_profiles` | `localStorage` (demo) si no hay Supabase datos | `businessProfileRepo` → [`businessProfileSupabase.ts`](../src/lib/business/businessProfileSupabase.ts) con sesión | — |
| `lesson_assets` | Opcional; hoy URLs en `Lesson` (`pdf_url`, `file_url`) | RLS: misma lógica que lección (preview o acceso) | Admin; Storage en épica siguiente |
| Storage (PDF/PPT) | `adminMediaMockStore` + URLs blob | — | Reemplazar por upload Supabase + `storage_path` en `lesson_assets` |

Con `VITE_USE_SUPABASE_DATA=true`, URL/anon key válidos y usuario autenticado (`auth.getUser()`), esos tres repos persisten en Postgres con RLS; sin sesión las lecturas devuelven vacío o defaults y las escrituras fallan con error claro.

## Contratos a preservar

- **`coursesRepo`** (solo lectura): `getCourseStructureBySlug`, `getLessonById`, `getFirstLessonId`.
- **`adminCoursesRepo`**: métodos ya definidos en [`src/lib/courses/adminCoursesRepo.ts`](../src/lib/courses/adminCoursesRepo.ts).
- **`progressRepo`**, **`notesRepo`**, **`businessProfileRepo`**: mismas firmas públicas; rama Supabase en [`sessionUser.ts`](../src/lib/supabase/sessionUser.ts) + `*Supabase.ts` asociados.
- **Shape del Aula**: `CourseStructure` (`course`, `modules`, `sections`, `lessons`) debe seguir siendo lo que consume [`CourseSidebar`](../src/components/classroom/CourseSidebar.tsx) y los viewers.

## Auth y RLS

- Sustituir `RequireAdminRoute` + `useAuth` mock por sesión Supabase y `profiles.role IN ('course_admin','superadmin')`.
- Políticas alineadas al [PRD §12](PRD.md): alumnos leen publicados; admin escribe borradores y estructura.
- **003**: visitantes leen lecciones `published` + `is_preview` en cursos `published`; módulos y secciones legibles para cualquiera si el curso está `published` (temario de marketing); `lesson_assets` legible si admin o misma condición que la lección (preview o `has_course_access`).

## Invalidación de caché

Con TanStack Query, tras mutaciones Supabase mantener `invalidateQueries` sobre:

- Prefijo `queryKeys.admin.courses()` y `queryKeys.admin.course(id)`.
- `queryKeys.course.structureBySlug(slug)` y claves de lección cuando cambien slug o contenido visible en el Aula.
