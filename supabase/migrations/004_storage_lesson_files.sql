-- Buckets y políticas Storage para materiales de lección (PDF/PPTX).
-- Bucket público: URLs estables vía getPublicUrl; rutas largas con UUID reducen enumeración.
-- Solo course_admin / superadmin pueden escribir (is_course_admin).

insert into storage.buckets (id, name, public, file_size_limit)
values ('lesson-files', 'lesson-files', true, 52428800)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- Lectura de objetos del bucket (PDF.js / navegador debe poder hacer GET).
drop policy if exists "lesson_files_select_authenticated" on storage.objects;
drop policy if exists "lesson_files_select_anon" on storage.objects;
drop policy if exists "lesson_files_insert_course_admin" on storage.objects;
drop policy if exists "lesson_files_update_course_admin" on storage.objects;
drop policy if exists "lesson_files_delete_course_admin" on storage.objects;

create policy "lesson_files_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'lesson-files');

create policy "lesson_files_select_anon"
  on storage.objects for select
  to anon
  using (bucket_id = 'lesson-files');

create policy "lesson_files_insert_course_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'lesson-files'
    and public.is_course_admin()
  );

create policy "lesson_files_update_course_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'lesson-files' and public.is_course_admin())
  with check (bucket_id = 'lesson-files' and public.is_course_admin());

create policy "lesson_files_delete_course_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'lesson-files' and public.is_course_admin());
