-- Datos de demostración opcionales (ejecutar en Supabase SQL Editor o `psql` con permisos).
-- Ajusta UUIDs: usa `select id, email, role from public.profiles;` y elige un admin.
--
-- 1) Promocionar a course_admin (una sola vez):
-- update public.profiles set role = 'course_admin' where email = 'tu@email.com';
--
-- 2) Insertar cursos y lecciones mínimas (sustituye :admin_id por un profiles.id con rol admin):
--    (comentado — descomenta y rellena)
/*
insert into public.courses (
  id, title, slug, short_description, description, cover_image_url,
  category, level, structure_type, status, is_featured, is_free, price, ai_context, created_by, published_at
) values (
  gen_random_uuid(),
  'Curso de pago demo',
  'curso-pago-demo',
  'Descripción corta',
  'Descripción larga',
  '',
  'General', 'beginner', 'linear', 'published', false, false, 99.00, '', 'ADMIN_UUID', now()
) returning id;
*/

-- 3) Matrícula de prueba: insert into public.enrollments (user_id, course_id) values ('STUDENT_UUID', 'COURSE_UUID');
--
-- Con el frontend: VITE_USE_SUPABASE_DATA=true en .env.local para leer la BD.
