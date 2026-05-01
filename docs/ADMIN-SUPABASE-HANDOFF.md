# Admin / Course Builder → Supabase (handoff)

Este documento enlaza el modelo del [PRD §11](PRD.md) con la implementación mock actual para migrar `adminCoursesRepo` y `coursesRepo` a Supabase sin cambiar las firmas públicas de los repos.

Los **datos semilla** del catálogo admin y del curso demo del aula conviven en [`src/data/mockAdminCourses.ts`](../src/data/mockAdminCourses.ts); la persistencia mock del catálogo sigue en [`courseCatalogMockStore`](../src/data/courseCatalogMockStore.ts).

## Tablas PRD → uso en el frontend mock

| Tabla PRD | Uso actual en mock | Repo lectura (alumno) | Repo escritura (admin) |
|-----------|-------------------|----------------------|-------------------------|
| `profiles` | No | — | Futuro: rol `course_admin` / RLS |
| `courses` | `Course` dentro de `CourseStructure` | `coursesRepo.getCourseStructureBySlug` | `adminCoursesRepo.updateCourseMetadata`, `publishCourse`, `setCourseStatus`, `createDraftCourse` |
| `course_modules` | `CourseModule[]` | Igual vía estructura | `addModule`, `updateModule`, `deleteModule`, `reorderModules` |
| `course_sections` | `CourseSection[]` | Igual | `addSection`, `updateSection`, `deleteSection`, `reorderSections` |
| `lessons` | `Lesson[]` | `getLessonById`, `getFirstLessonId` | `addLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`, `assignLessonPlacement` |
| `lesson_assets` | Opcional; hoy URLs en `Lesson` (`pdf_url`, `file_url`) | Lectura indirecta | Futuro: filas por archivo tras Storage |
| Storage (PDF/PPT) | `adminMediaMockStore` + URLs blob | — | Reemplazar por upload Supabase + `storage_path` en `lesson_assets` |

## Contratos a preservar

- **`coursesRepo`** (solo lectura): `getCourseStructureBySlug`, `getLessonById`, `getFirstLessonId`.
- **`adminCoursesRepo`**: métodos ya definidos en [`src/lib/courses/adminCoursesRepo.ts`](../src/lib/courses/adminCoursesRepo.ts).
- **Shape del Aula**: `CourseStructure` (`course`, `modules`, `sections`, `lessons`) debe seguir siendo lo que consume [`CourseSidebar`](../src/components/classroom/CourseSidebar.tsx) y los viewers.

## Auth y RLS

- Sustituir `RequireAdminRoute` + `useAuth` mock por sesión Supabase y `profiles.role IN ('course_admin','superadmin')`.
- Políticas alineadas al [PRD §12](PRD.md): alumnos leen publicados; admin escribe borradores y estructura.

## Invalidación de caché

Con TanStack Query, tras mutaciones Supabase mantener `invalidateQueries` sobre:

- Prefijo `queryKeys.admin.courses()` y `queryKeys.admin.course(id)`.
- `queryKeys.course.structureBySlug(slug)` y claves de lección cuando cambien slug o contenido visible en el Aula.
