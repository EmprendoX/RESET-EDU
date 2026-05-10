-- 006 — Separación course_admin vs superadmin (PRD §6.3 / §6.4).
-- is_course_admin() = solo rol course_admin; is_course_staff() = course_admin | superadmin;
-- RLS contenido (cursos, enrollments, storage, lesson_assets) usa is_course_staff().
-- profiles: lectura de terceros solo superadmin; role solo mutable por superadmin.
-- activity_logs: lectura solo superadmin; escritura vía service_role (sin políticas para authenticated).

-- ---------- Funciones helper ----------
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'::public.app_role
  );
$$;

create or replace function public.is_course_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'course_admin'::public.app_role
  );
$$;

create or replace function public.is_course_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_course_admin() or public.is_superadmin();
$$;

create or replace function public.has_course_access(p_user_id uuid, p_course_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select
    p_user_id is not null
    and p_course_id is not null
    and (
      exists (
        select 1
        from public.profiles pr
        where pr.id = p_user_id
          and pr.role in ('course_admin'::public.app_role, 'superadmin'::public.app_role)
      )
      or exists (
        select 1
        from public.courses c
        where c.id = p_course_id
          and c.status = 'published'::public.course_status
          and c.is_free = true
      )
      or exists (
        select 1
        from public.enrollments e
        where e.user_id = p_user_id
          and e.course_id = p_course_id
      )
    );
$$;

-- ---------- Trigger: solo superadmin puede cambiar profiles.role ----------
create or replace function public.profiles_enforce_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role then
    if not public.is_superadmin() then
      raise exception 'Solo un superadmin puede cambiar profiles.role';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_role_change on public.profiles;
create trigger profiles_enforce_role_change
before update of role on public.profiles
for each row execute function public.profiles_enforce_role_change();

-- ---------- RLS profiles ----------
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_superadmin
  on public.profiles for select
  using (id = auth.uid() or public.is_superadmin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_update_superadmin
  on public.profiles for update
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- ---------- Sustituir is_course_admin → is_course_staff en políticas existentes ----------
drop policy if exists courses_all_admin on public.courses;
create policy courses_all_admin
  on public.courses for all
  using (public.is_course_staff())
  with check (public.is_course_staff());

drop policy if exists course_modules_select_access on public.course_modules;
create policy course_modules_select_access
  on public.course_modules for select
  using (
    public.is_course_staff()
    or (
      exists (
        select 1 from public.courses c
        where c.id = course_modules.course_id
          and c.status = 'published'::public.course_status
      )
      and public.has_course_access(auth.uid(), course_id)
    )
  );

drop policy if exists course_modules_write_admin on public.course_modules;
create policy course_modules_write_admin
  on public.course_modules for all
  using (public.is_course_staff())
  with check (public.is_course_staff());

drop policy if exists course_sections_select_access on public.course_sections;
create policy course_sections_select_access
  on public.course_sections for select
  using (
    public.is_course_staff()
    or (
      exists (
        select 1 from public.courses c
        where c.id = course_sections.course_id
          and c.status = 'published'::public.course_status
      )
      and public.has_course_access(auth.uid(), course_id)
    )
  );

drop policy if exists course_sections_write_admin on public.course_sections;
create policy course_sections_write_admin
  on public.course_sections for all
  using (public.is_course_staff())
  with check (public.is_course_staff());

drop policy if exists lessons_select_access on public.lessons;
create policy lessons_select_access
  on public.lessons for select
  using (
    public.is_course_staff()
    or (
      status = 'published'::public.lesson_status
      and exists (
        select 1 from public.courses c
        where c.id = lessons.course_id
          and c.status = 'published'::public.course_status
      )
      and public.has_course_access(auth.uid(), course_id)
    )
  );

drop policy if exists lessons_write_admin on public.lessons;
create policy lessons_write_admin
  on public.lessons for all
  using (public.is_course_staff())
  with check (public.is_course_staff());

drop policy if exists enrollments_select_own_or_admin on public.enrollments;
create policy enrollments_select_own_or_admin
  on public.enrollments for select
  using (user_id = auth.uid() or public.is_course_staff());

drop policy if exists enrollments_write_admin on public.enrollments;
create policy enrollments_write_admin
  on public.enrollments for insert
  with check (public.is_course_staff());

drop policy if exists enrollments_update_admin on public.enrollments;
create policy enrollments_update_admin
  on public.enrollments for update
  using (public.is_course_staff());

drop policy if exists enrollments_delete_admin on public.enrollments;
create policy enrollments_delete_admin
  on public.enrollments for delete
  using (public.is_course_staff());

drop policy if exists media_library_admin_all on public.media_library_items;
create policy media_library_admin_all
  on public.media_library_items for all
  using (public.is_course_staff())
  with check (public.is_course_staff());

drop policy if exists lesson_assets_select_access on public.lesson_assets;
create policy lesson_assets_select_access
  on public.lesson_assets for select
  using (
    public.is_course_staff()
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

drop policy if exists lesson_assets_write_admin on public.lesson_assets;
create policy lesson_assets_write_admin
  on public.lesson_assets for all
  using (public.is_course_staff())
  with check (public.is_course_staff());

-- ---------- Storage lesson-files ----------
drop policy if exists "lesson_files_insert_course_admin" on storage.objects;
drop policy if exists "lesson_files_update_course_admin" on storage.objects;
drop policy if exists "lesson_files_delete_course_admin" on storage.objects;

create policy "lesson_files_insert_course_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'lesson-files'
    and public.is_course_staff()
  );

create policy "lesson_files_update_course_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'lesson-files' and public.is_course_staff())
  with check (bucket_id = 'lesson-files' and public.is_course_staff());

create policy "lesson_files_delete_course_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'lesson-files' and public.is_course_staff());

-- ---------- activity_logs ----------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  course_id uuid references public.courses (id) on delete set null,
  lesson_id uuid references public.lessons (id) on delete set null,
  action text not null default '',
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_user_id_idx on public.activity_logs (user_id);

alter table public.activity_logs enable row level security;

create policy activity_logs_select_superadmin
  on public.activity_logs for select
  using (public.is_superadmin());

grant all on table public.activity_logs to postgres, service_role;
grant select on table public.activity_logs to authenticated;

-- ---------- RPCs staff: listados que requieren join con profiles ----------
create or replace function public.admin_list_enrollments()
returns table (
  user_id uuid,
  course_id uuid,
  created_at timestamptz,
  user_email text,
  user_full_name text,
  course_title text,
  course_slug text,
  course_is_free boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.user_id,
    e.course_id,
    e.created_at,
    p.email,
    p.full_name,
    c.title,
    c.slug,
    c.is_free
  from public.enrollments e
  join public.profiles p on p.id = e.user_id
  join public.courses c on c.id = e.course_id
  where public.is_course_staff();
$$;

create or replace function public.admin_search_profiles_by_email(p_term text)
returns table (
  id uuid,
  email text,
  full_name text,
  role public.app_role
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.email,
    p.full_name,
    case
      when public.is_superadmin() then p.role
      else null::public.app_role
    end as role
  from public.profiles p
  where public.is_course_staff()
    and length(trim(p_term)) >= 2
    and p.email is not null
    and p.email ilike '%' || trim(p_term) || '%'
  order by p.email asc
  limit 25;
$$;

revoke execute on function public.admin_list_enrollments() from PUBLIC;
grant execute on function public.admin_list_enrollments() to authenticated;

revoke execute on function public.admin_search_profiles_by_email(text) from PUBLIC;
grant execute on function public.admin_search_profiles_by_email(text) to authenticated;
