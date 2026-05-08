-- 004 — Storage hardening: bucket `lesson-files` privado + SELECT por enrollment/preview/admin.
-- Cierra Security Advisor lint `public_bucket_allows_listing` sin tocar funciones SECURITY DEFINER.

-- 1) Bucket privado. Desactiva URLs públicas; el acceso pasa por signed URLs.
update storage.buckets
   set public = false
 where id = 'lesson-files';

-- 2) Quitar las dos policies SELECT amplias.
drop policy if exists lesson_files_select_anon on storage.objects;
drop policy if exists lesson_files_select_authenticated on storage.objects;

-- 3) SELECT autorizado para `authenticated`:
--    - admin / staff de cursos siempre, o
--    - la lección referenciada por el path es preview en curso publicado, o
--    - el usuario tiene `has_course_access` al curso (free + publicado o enrollment).
--    Convención de path: {course_id}/{lesson_id}/{filename}
create policy lesson_files_select_authorized
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'lesson-files'
    and (
      public.is_course_staff()
      or exists (
        select 1
        from public.lessons l
        join public.courses c on c.id = l.course_id
        where c.id::text = split_part(name, '/', 1)
          and l.id::text = split_part(name, '/', 2)
          and c.status = 'published'::public.course_status
          and l.status = 'published'::public.lesson_status
          and (
            l.is_preview = true
            or public.has_course_access(auth.uid(), l.course_id)
          )
      )
    )
  );

-- Nota: no se crea SELECT para `anon`. Bucket privado + sin signed URL = sin acceso.
-- Si alguna feature futura necesita preview público (anon) sobre archivo, será otro bucket o
-- una policy explícita acotada a previews.
