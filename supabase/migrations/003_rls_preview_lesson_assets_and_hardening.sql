-- 003 — PRD §12: previews públicas + temario publicado (Opción A); PRD §11: lesson_assets;
--    Security Advisor: search_path en set_updated_at; REVOKE EXECUTE en funciones solo-trigger/RPC internas.

-- ---------- set_updated_at: search_path fijo (linter 0011) ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- lesson_assets (PRD §11; alineado a src/types LessonAsset) ----------
create table public.lesson_assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  file_name text not null,
  file_type public.file_type not null default 'pdf'::public.file_type,
  file_url text not null default '',
  storage_path text not null default '',
  visibility text not null default 'private',
  created_at timestamptz not null default now(),
  constraint lesson_assets_visibility_check check (visibility = any (array['public'::text, 'private'::text]))
);

create index lesson_assets_lesson_id_idx on public.lesson_assets (lesson_id);
create index lesson_assets_course_id_idx on public.lesson_assets (course_id);

create or replace function public.lesson_assets_enforce_course_match()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.lessons l
    where l.id = new.lesson_id
      and l.course_id = new.course_id
  ) then
    raise exception 'lesson_assets.course_id must match lessons.course_id for lesson_id';
  end if;
  return new;
end;
$$;

create trigger lesson_assets_enforce_course_match
before insert or update of lesson_id, course_id on public.lesson_assets
for each row execute function public.lesson_assets_enforce_course_match();

alter table public.lesson_assets enable row level security;

-- Lectura: admin; o lección publicada en curso publicado y (preview o acceso al curso).
create policy lesson_assets_select_access
  on public.lesson_assets for select
  using (
    public.is_course_admin()
    or exists (
      select 1
      from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = lesson_assets.lesson_id
        and l.course_id = lesson_assets.course_id
        and l.status = 'published'::public.lesson_status
        and c.status = 'published'::public.course_status
        and (
          l.is_preview = true
          or public.has_course_access(auth.uid(), l.course_id)
        )
    )
  );

create policy lesson_assets_write_admin
  on public.lesson_assets for all
  using (public.is_course_admin())
  with check (public.is_course_admin());

-- ---------- RLS: visitantes / catálogo — lecciones preview publicadas ----------
create policy lessons_select_preview_public
  on public.lessons for select
  using (
    status = 'published'::public.lesson_status
    and is_preview = true
    and exists (
      select 1
      from public.courses c
      where c.id = lessons.course_id
        and c.status = 'published'::public.course_status
    )
  );

-- ---------- RLS: Opción A — módulos y secciones visibles si el curso está publicado ----------
create policy course_modules_select_published_catalog
  on public.course_modules for select
  using (
    exists (
      select 1
      from public.courses c
      where c.id = course_modules.course_id
        and c.status = 'published'::public.course_status
    )
  );

create policy course_sections_select_published_catalog
  on public.course_sections for select
  using (
    exists (
      select 1
      from public.courses c
      where c.id = course_sections.course_id
        and c.status = 'published'::public.course_status
    )
  );

-- ---------- Grants (misma convención que 001; la tabla es nueva tras 001) ----------
grant all on public.lesson_assets to postgres, service_role;
grant select, insert, update, delete on public.lesson_assets to authenticated;
grant select on public.lesson_assets to anon;

-- ---------- Security Advisor: no exponer RPC a anon/authenticated (uso interno / triggers) ----------
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.refresh_course_lesson_count(uuid) from anon, authenticated;
revoke execute on function public.lessons_touch_course_lesson_count() from anon, authenticated;
