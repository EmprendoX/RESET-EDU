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
| `VITE_USE_MENTOR_API` | `true` para llamar a `/.netlify/functions/mentor-chat` con sesión Supabase (requiere `VITE_USE_SUPABASE_DATA=true` y variables de servidor en Netlify). |
| `VITE_PUBLIC_APP_URL` | Opcional. URL pública **https** de la app (p. ej. `https://tu-app.netlify.app`). Si está definida y es válida, el **registro** (`signUp` en [`LoginPage.tsx`](../src/pages/auth/LoginPage.tsx)) usa esta base para `emailRedirectTo` (enlace del correo de confirmación). Si no, se usa `window.location.origin` (registro desde local → link a local). Debe estar permitida en Redirect URLs de Supabase. |
| `VITE_MOCK_USER_ROLE` | Solo sin Supabase: `student` o por defecto admin demo. |

Copia `.env.example` a **`.env.local`** (no commitear). En Supabase: **Authentication → URL configuration** configura **Site URL** (normalmente producción) y **Redirect URLs**: incluye `https://tu-dominio/...` y rutas de callback (p. ej. `.../login`), más `http://localhost:5173/**` si desarrollas en local. Patrones y comodines: guía oficial [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## Confirmación de email: enlace va a localhost (`ERR_CONNECTION_REFUSED`)

El `emailRedirectTo` del registro sale de `VITE_PUBLIC_APP_URL` (https válida) o de `window.location.origin` + `/login` (ver [`LoginPage.tsx`](../src/pages/auth/LoginPage.tsx)). Si al hacer clic en el correo el navegador intenta abrir **localhost** y falla, revisa en este orden (los enlaces **viejos** del correo no cambian; pide confirmación de nuevo tras corregir):

### 1. Supabase (obligatorio)

En el **mismo proyecto** que tus `VITE_SUPABASE_*`:

1. **Authentication → URL Configuration → Site URL**: debe ser la URL pública de la app en producción, p. ej. `https://tu-app.netlify.app`. Si sigue en `http://localhost:5173`, muchos flujos de Auth redirigen ahí tras verificar el token.
2. **Redirect URLs**: añade explícitamente (ajusta el dominio):
   - `https://tu-app.netlify.app/login`
   - y/o un patrón permitido por la guía, p. ej. `https://tu-app.netlify.app/**`
   - Si desarrollas en local contra este proyecto: `http://localhost:5173/login` y `http://localhost:5173/**`
3. Guarda. Vuelve a **registrarte** o usa **reenviar confirmación** para generar un enlace nuevo.

Si `redirect_to` del enlace no está permitido, Supabase puede sustituir por **Site URL**; por eso Site URL en localhost rompe el flujo en producción.

### 2. Netlify (build)

1. En el sitio: **Site configuration → Environment variables** (o **Build & deploy → Environment**), añade `VITE_PUBLIC_APP_URL=https://tu-app.netlify.app` (misma base que en Redirect URLs, sin path salvo la que uses en la env; el código añade `/login`).
2. **Redeploy** el sitio: Vite inyecta las `VITE_*` en **build time**; un cambio de variable sin nuevo deploy no actualiza el bundle.

### 3. Prueba manual

1. Abre la app en **producción**: `https://tu-dominio/login` (no `localhost`).
2. Crea cuenta o pide nuevo correo de confirmación.
3. Abre el enlace desde el mail; debe volver a `https://tu-dominio/login` (o la ruta que Supabase añada con tokens en hash/query).

### 4. Desarrollo local

Si ejecutas `npm run dev` y te registras en `http://localhost:5173`, el correo llevará **localhost** salvo que en `.env.local` definas `VITE_PUBLIC_APP_URL=https://tu-dominio` (y esa URL esté en Redirect URLs). Es el comportamiento esperado del código.

## Primer usuario administrador

1. Con `VITE_SUPABASE_*` configurados, regístrate en `/login` (modo registro; ver `src/pages/auth/LoginPage.tsx`).
2. El trigger `on_auth_user_created` crea `profiles` con rol `student`.
3. En el **SQL Editor** del dashboard (o Table Editor), actualiza tu fila: `update public.profiles set role = 'course_admin' where id = '<tu_user_uuid>';` (o `superadmin`).

## Inventario esquema / migraciones

- Las migraciones locales viven en [`supabase/migrations/`](../supabase/migrations/): [`001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql), [`002_course_lesson_count.sql`](../supabase/migrations/002_course_lesson_count.sql), [`003_rls_preview_lesson_assets_and_hardening.sql`](../supabase/migrations/003_rls_preview_lesson_assets_and_hardening.sql), [`004_storage_lesson_files.sql`](../supabase/migrations/004_storage_lesson_files.sql), [`005_grant_has_course_access_rpc.sql`](../supabase/migrations/005_grant_has_course_access_rpc.sql), [`006_admin_superadmin_split.sql`](../supabase/migrations/006_admin_superadmin_split.sql).
- **Inventario vía MCP** (`list_tables` en esquemas `public` y `storage`): en `public` suelen listarse `profiles`, `courses`, `course_modules`, `course_sections`, `lessons`, `enrollments`, `notes`, `lesson_progress`, `student_business_profiles`, `ai_threads`, `ai_messages`, `media_library_items`, `lesson_assets`; en `storage`, `buckets`, `objects` y tablas internas (p. ej. migraciones storage, multipart, analytics). Tras **006** debe existir también `public.activity_logs` y las funciones/RPC asociadas a roles; si **`activity_logs` no aparece**, el remoto no tiene aplicada **006** (o el DDL se aplicó de forma incompleta). Si `list_migrations` del proyecto está vacío, el DDL pudo aplicarse fuera del tracking CLI: conviene aplicar las migraciones desde este repo (`supabase db push` con [CLI](https://supabase.com/docs/guides/cli) o pegando el SQL en el **SQL Editor**) para alinear historial.

### Aplicar `003` en el proyecto Supabase

1. Abre [`supabase/migrations/003_rls_preview_lesson_assets_and_hardening.sql`](../supabase/migrations/003_rls_preview_lesson_assets_and_hardening.sql).
2. Ejecuta el archivo completo en el SQL Editor (o `supabase db push` si el proyecto está enlazado).

Contenido principal de **003**: `lesson_assets` + RLS; políticas de lectura para **lecciones preview** públicas y **temario** (`course_modules` / `course_sections`) en cursos `published`; `set_updated_at` con `search_path` fijo; `REVOKE EXECUTE` en `handle_new_user`, `refresh_course_lesson_count`, `lessons_touch_course_lesson_count` para roles `anon` y `authenticated` (sigue el uso vía triggers / interno).

### Aplicar `004` (Storage materiales de lección)

1. Abre [`supabase/migrations/004_storage_lesson_files.sql`](../supabase/migrations/004_storage_lesson_files.sql).
2. Ejecuta el archivo completo en el SQL Editor (o `supabase db push` si el proyecto está enlazado).

Contenido de **004**: bucket público `lesson-files` (límite 50 MB) y políticas en `storage.objects`: lectura para `authenticated` y `anon`; en el SQL del archivo, escritura con `public.is_course_admin()` (INSERT/UPDATE/DELETE). La migración **006** sustituye esas condiciones de escritura por **`public.is_course_staff()`** (`course_admin` o `superadmin`), alineado con cursos y `lesson_assets`. El editor admin sube archivos vía [`lessonFileUpload.ts`](../src/lib/storage/lessonFileUpload.ts); cada subida con `VITE_USE_SUPABASE_DATA=true` también escribe metadata en `lesson_assets` ([`lessonAssetsSupabase.ts`](../src/lib/storage/lessonAssetsSupabase.ts)) y actualiza el formulario (`pdf_url` / `file_url`, `file_type`). **Guardar lección** sincroniza columnas en `lessons` para el visor del alumno.

### Variables Netlify (mentor IA)

En el sitio Netlify (no en `.env.local` del frontend): `SUPABASE_URL` (misma base que `VITE_SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, opcional `OPENAI_MODEL`. La función [`netlify/functions/mentor-chat.ts`](../netlify/functions/mentor-chat.ts) valida el JWT del alumno, comprueba acceso al curso y persiste en `ai_messages` / `ai_threads`.

## Checklist E2E (MVP)

1. Aplicar migraciones **003**, **004**, **005** y **006** en el proyecto remoto (SQL Editor, CLI enlazado, o `SUPABASE_DB_URL` en `.env.local` + `npm run db:apply-004-006` para aplicar **004** y **006** desde [`supabase/migrations/`](../supabase/migrations/) en orden).
2. `.env.local`: `VITE_USE_SUPABASE_DATA=true` (y opcional `VITE_USE_MENTOR_API=true` si la función está desplegada con las env de servidor).
3. **Admin** (`course_admin`): crear curso **publicado** y **gratis** (o matricular al alumno en `/admin/matriculas`), lección **publicada**, subir PDF y **Guardar lección**.
4. **Alumno**: abrir `/cursos`, entrar al aula, abrir la lección: PDF visible; progreso y notas si aplica.
5. **Mentor** (con API): enviar un mensaje; comprobar filas en `ai_messages` y ausencia de errores en logs de la función.

### Aplicar `005` (RPC `has_course_access`)

1. Abre [`supabase/migrations/005_grant_has_course_access_rpc.sql`](../supabase/migrations/005_grant_has_course_access_rpc.sql).
2. Ejecútalo en el SQL Editor si la función Netlify `mentor-chat` no puede invocar `has_course_access` vía RPC.

### Aplicar `006` (staff vs superadmin, `profiles`, `activity_logs`, matrículas)

1. Abre [`supabase/migrations/006_admin_superadmin_split.sql`](../supabase/migrations/006_admin_superadmin_split.sql).
2. Ejecútalo en el SQL Editor (o `supabase db push` si el proyecto está enlazado).

Resumen: helpers `is_superadmin()`, `is_course_admin()` (solo rol homónimo) e `is_course_staff()` (`course_admin` | `superadmin`); RLS de cursos, módulos, secciones, lecciones, matrículas, `lesson_assets`, `media_library_items` y políticas de escritura del bucket `lesson-files` usan `is_course_staff()`. **`profiles`**: lectura de terceros solo superadmin; columna `role` solo mutable por superadmin (trigger + política). **`activity_logs`**: tabla nueva; SELECT solo superadmin; escritura pensada con `service_role` / backend. Matrículas y búsqueda por email en admin vía RPC `admin_list_enrollments` y `admin_search_profiles_by_email` (implementación en [`src/lib/enrollments/enrollmentsAdminRepo.ts`](../src/lib/enrollments/enrollmentsAdminRepo.ts)), sin depender de un join PostgREST directo a `profiles` ajenos para staff.

Tras aplicar **003**, **004** y **006**, vuelve a ejecutar el **Security Advisor** del dashboard (o MCP `get_advisors`). Puede avisar por funciones `SECURITY DEFINER` referenciadas en RLS (`is_course_admin`, `is_course_staff`, `is_superadmin`): son helpers usados por las políticas; **no** revoques `EXECUTE` a `authenticated` en ellas mientras sigan en expresiones RLS (PostgREST evalúa con el rol del JWT y la política fallaría). Las RPC `admin_list_enrollments` y `admin_search_profiles_by_email` tienen `GRANT EXECUTE` a `authenticated` y `REVOKE EXECUTE FROM PUBLIC` en **006** (patrón distinto al de los helpers de políticas).

## Comprobaciones manuales sugeridas (PostgREST / SQL)

Con la **anon key** y sin `Authorization` (visitante): `select` sobre `courses` con `status = published`; `lessons` solo filas con `is_preview = true` y curso publicado; `course_modules` / `course_sections` del mismo curso.

Con JWT de **alumno** sin enrollment en curso de pago: no debe ver lecciones no preview de ese curso; en curso **gratis** publicado sí (vía `has_course_access`).

Con rol **`course_admin`** o **`superadmin`** en `profiles` (staff): CRUD de borradores, `lesson_assets` y escritura en Storage del bucket `lesson-files` según políticas (condición `is_course_staff()` tras **006**). Listado de matrículas y búsqueda de alumnos por email usan las RPC `admin_*`, no un `select` con join directo a `profiles` ajenos desde el cliente.

## Divergencias respecto al PRD §11 (documentadas)

| PRD | Implementación actual |
|-----|------------------------|
| `enrollments` con `id`, `status`, `enrolled_at`, `completed_at` | PK compuesta `(user_id, course_id)` y `created_at` únicamente; suficiente para MVP de acceso si no necesitáis estados de inscripción detallados. |
| `ai_messages` con `user_id`, `course_id`, `lesson_id` | Modelo mínimo por `thread_id`; el backend con `service_role` puede ampliar después. |
| `lesson_assets` | Tabla añadida en **003**; `file_type` usa el enum `public.file_type`; `visibility` `text` con check `public` / `private`. Validación `course_id` ↔ `lessons.course_id` vía trigger `lesson_assets_enforce_course_match`. |

## Tablas PRD → uso en el frontend mock

| Tabla PRD | Uso actual en mock | Repo lectura (alumno) | Repo escritura (admin) |
|-----------|-------------------|----------------------|-------------------------|
| `profiles` | No | — | RLS **006**: cada usuario lee solo su fila; superadmin lee todas; `role` solo editable por superadmin; staff usa RPCs para datos de alumnos en matrículas |
| `courses` | `Course` dentro de `CourseStructure` | `coursesRepo.getCourseStructureBySlug` | `adminCoursesRepo.updateCourseMetadata`, `publishCourse`, `setCourseStatus`, `createDraftCourse` |
| `course_modules` | `CourseModule[]` | Igual vía estructura | `addModule`, `updateModule`, `deleteModule`, `reorderModules` |
| `course_sections` | `CourseSection[]` | Igual | `addSection`, `updateSection`, `deleteSection`, `reorderSections` |
| `lessons` | `Lesson[]` | `getLessonById`, `getFirstLessonId` | `addLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`, `assignLessonPlacement` |
| `lesson_progress` | `localStorage` (demo) si no hay Supabase datos | `progressRepo` → [`progressSupabase.ts`](../src/lib/progress/progressSupabase.ts) con sesión | — |
| `notes` | `localStorage` (demo) si no hay Supabase datos | `notesRepo` → [`notesSupabase.ts`](../src/lib/notes/notesSupabase.ts) con sesión | — |
| `student_business_profiles` | `localStorage` (demo) si no hay Supabase datos | `businessProfileRepo` → [`businessProfileSupabase.ts`](../src/lib/business/businessProfileSupabase.ts) con sesión | — |
| `lesson_assets` | Filas al subir desde el editor (Storage + metadata) además de URLs en `lessons` | RLS: misma lógica que lección (preview o acceso) | Staff (`course_admin` o `superadmin`) — políticas `is_course_staff()` tras **006** |
| `activity_logs` | — | — | Lectura solo superadmin (**006**); escritura vía `service_role` / jobs |
| Storage (PDF/PPT) | Mock sin Supabase; bucket `lesson-files` + URLs en `lessons` con Supabase | GET público al objeto | Staff: upload desde editor (`is_course_staff()` en escritura tras **006**) con `VITE_USE_SUPABASE_DATA=true` |

Con `VITE_USE_SUPABASE_DATA=true`, URL/anon key válidos y usuario autenticado (`auth.getUser()`), esos tres repos persisten en Postgres con RLS; sin sesión las lecturas devuelven vacío o defaults y las escrituras fallan con error claro.

## Contratos a preservar

- **`coursesRepo`** (solo lectura): `getCourseStructureBySlug`, `getLessonById`, `getFirstLessonId`.
- **`adminCoursesRepo`**: métodos ya definidos en [`src/lib/courses/adminCoursesRepo.ts`](../src/lib/courses/adminCoursesRepo.ts).
- **`progressRepo`**, **`notesRepo`**, **`businessProfileRepo`**: mismas firmas públicas; rama Supabase en [`sessionUser.ts`](../src/lib/supabase/sessionUser.ts) + `*Supabase.ts` asociados.
- **Shape del Aula**: `CourseStructure` (`course`, `modules`, `sections`, `lessons`) debe seguir siendo lo que consume [`CourseSidebar`](../src/components/classroom/CourseSidebar.tsx) y los viewers.

## Auth y RLS

- Sustituir `RequireAdminRoute` + `useAuth` mock por sesión Supabase y `profiles.role IN ('course_admin','superadmin')`.
- Políticas alineadas al [PRD §12](PRD.md): alumnos leen publicados; admin escribe borradores y estructura.
- **003**: visitantes leen lecciones `published` + `is_preview` en cursos `published`; módulos y secciones legibles para cualquiera si el curso está `published` (temario de marketing); `lesson_assets` legible si staff o misma condición que la lección (preview o `has_course_access`).
- **006** ([PRD §6.3](PRD.md) / [§6.4](PRD.md)): `is_course_staff()` para operaciones de contenido y storage; `is_superadmin()` para `profiles` ajenos, `activity_logs` y cambios de `role`; matrículas vía RPCs staff.

## Invalidación de caché

Con TanStack Query, tras mutaciones Supabase mantener `invalidateQueries` sobre:

- Prefijo `queryKeys.admin.courses()` y `queryKeys.admin.course(id)`.
- `queryKeys.course.structureBySlug(slug)` y claves de lección cuando cambien slug o contenido visible en el Aula.
