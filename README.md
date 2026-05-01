# RESET EDU — Aula Inteligente

Frontend del Aula Inteligente para una plataforma SaaS de cursos con mentor IA.
Stack: **React 18 + TypeScript + Tailwind + Vite**.

> Esta versión del proyecto contiene **solo el frontend del Aula** funcionando con
> **mock data**. Supabase, OpenAI y Netlify Functions **no están conectados**.
> Toda la capa de datos pasa por `repos` y un `mentorClient` con firmas
> estables, listos para conectar al backend en una fase posterior.

---

## Cómo correr en local

Requiere Node.js 18+ y npm.

```bash
npm install
npm run dev
```

La app abre en `http://localhost:5173`.

- Landing demo: `/`
- Aula del curso de demo: `/aprender/marketing-con-ia`
  (redirige a la última lección abierta o, si no hay, a la primera)
- Panel admin (mock): `/admin` — gestión de cursos y constructor (`/admin/cursos`, `/admin/cursos/:id`, `/admin/cursos/:id/builder`). Requiere rol admin en el mock (por defecto `course_admin`; usa `VITE_MOCK_USER_ROLE=student` para probar solo como alumno).

### Otros scripts

```bash
npm run build        # build de producción (TS strict + vite build)
npm run preview      # sirve el build de producción local
npm run typecheck    # solo type-check
npm run lint         # ESLint sobre src
npm run format       # Prettier sobre src
```

---

## Estructura

```
src/
  pages/            Páginas de ruta (ClassroomPage es la entrada del Aula).
  components/
    classroom/      Layout, viewers, notas, mentor IA, progreso.
    common/         Loading / Empty / Error / Unauthorized.
    ui/             Primitivos (Button, Badge).
  hooks/            useLessonData, useNotes, useAIMentor, useSelectedText, …
  stores/           useClassroomStore (Zustand) — estado UI del Aula.
  lib/
    ai/             mentorClient (mock), prompts canned por modo.
    courses/        coursesRepo (mock).
    notes/          notesRepo (mock + localStorage).
    progress/       progressRepo (mock + localStorage).
    files/          fileType detection y PDF.js worker config.
    supabase/       client placeholder — NO conectado todavía.
    utils/          cn, format, time, storage.
  data/             Mock data; **seeds de cursos admin** en `mockAdminCourses.ts` (catálogo vía `courseCatalogMockStore`).
  types/            Tipos TS por dominio (course, lesson, notes, ai, …).
  config/           env (lectura de import.meta.env).
  styles/           index.css (Tailwind directives).
```

---

## Atajos de teclado

| Tecla | Acción                       |
| ----- | ---------------------------- |
| `j`   | Lección anterior             |
| `k`   | Lección siguiente            |
| `n`   | Abrir panel de Notas         |
| `i`   | Abrir panel del Mentor IA    |

Los atajos se ignoran cuando el foco está sobre un input/textarea/contentEditable.

---

## Cómo está organizada la capa de datos

Todos los componentes consumen hooks (`useLessonData`, `useNotes`,
`useAIMentor`, …) que envuelven repos en `src/lib/`. Hoy los repos leen mock
data y persisten en `localStorage` (namespace `reset-edu:demo:*`). Cuando se
conecte Supabase, **solo los repos cambian**.

Reglas:

- Ningún componente importa `mockClassroomData` directamente. Pasa por
  `coursesRepo` → `useLessonData`/`useCourseStructure`.
- Toda IA pasa por `lib/ai/mentorClient.ts`. Reemplazar el body por
  `fetch('/.netlify/functions/mentor-chat', ...)` cuando se haga el backend.
- `lib/supabase/client.ts` está creado pero ningún hook lo importa todavía.

---

## Qué hacer cuando se conecte Supabase / OpenAI

1. **Supabase**: implementar `lib/supabase/client.ts` con
   `createClient(env.supabase.url, env.supabase.anonKey)`. Reemplazar los repos
   en `lib/courses`, `lib/notes`, `lib/progress` y `lib/ai/threadsRepo` por
   queries reales. Las firmas públicas no deben cambiar.
2. **OpenAI**: crear `netlify/functions/mentor-chat.ts`. Sustituir el body de
   `lib/ai/mentorClient.ts` por:

   ```ts
   const res = await fetch(env.mentor.endpoint, {
     method: 'POST',
     body: JSON.stringify(request),
     headers: { 'content-type': 'application/json' },
   });
   if (!res.ok) throw new Error(`Mentor API ${res.status}`);
   return (await res.json()) as MentorResponse;
   ```

3. **Auth**: reemplazar `useAuth()` para usar `supabase.auth.getUser()` y la
   sesión, en vez del `MOCK_USER`.

Hasta entonces, la demo es completamente navegable sin backend.

---

## Limitaciones conscientes del MVP

- **Solo frontend.** No hay backend, ni RLS, ni roles reales.
- **Sin auth real.** `useAuth()` devuelve siempre el mismo usuario demo.
- **Sin pagos.** Todos los cursos se consideran inscritos.
- **Sin homepage/catálogo.** La landing es un punto de entrada; el catálogo
  llegará en otra fase.
- **Admin y catálogo mock.** Los cursos viven en memoria / `localStorage`
  (`reset-edu:admin:catalog`). Ver [docs/ADMIN-SUPABASE-HANDOFF.md](docs/ADMIN-SUPABASE-HANDOFF.md) para el mapeo a Supabase.
- **PowerPoint:** se acepta pero se renderiza como PDF (política MVP
  documentada en el spec). Si la lección trae un PPTX directo, se muestra
  `UnsupportedFileViewer` con orientación.
- **Selección sobre PDF en mobile:** limitada; el menú flotante solo se
  muestra en desktop. En mobile, copiar/pegar manualmente.
