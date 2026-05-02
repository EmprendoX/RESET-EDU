-- 001_initial_schema.sql — RESET-EDU MVP (derivado del código TypeScript actual)
-- Requiere proyecto Supabase con Auth habilitado.
-- Orden: tipos → tablas → funciones que referencian tablas → triggers auth → RLS → grants.

-- ---------- Enums (alineados a src/types) ----------
create type public.app_role as enum ('student', 'course_admin', 'superadmin');
create type public.course_status as enum ('draft', 'published', 'archived');
create type public.course_level as enum ('beginner', 'intermediate', 'advanced');
create type public.structure_type as enum ('linear', 'modular');
create type public.lesson_status as enum ('draft', 'published');
create type public.file_type as enum (
  'pdf', 'video', 'pptx', 'text', 'mixed', 'unsupported'
);
create type public.lesson_progress_status as enum ('not_started', 'started', 'completed');
create type public.note_source as enum ('manual', 'ai', 'selection');
create type public.mentor_mode as enum (
  'class', 'qna', 'business_application', 'summary',
  'action_plan', 'exercise', 'evaluation'
);
create type public.ai_message_role as enum ('user', 'assistant', 'system');

-- ---------- updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------- courses ----------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  slug text not null,
  description text not null default '',
  short_description text not null default '',
  cover_image_url text not null default '',
  category text not null default 'General',
  level public.course_level not null default 'beginner',
  structure_type public.structure_type not null default 'linear',
  status public.course_status not null default 'draft',
  is_featured boolean not null default false,
  is_free boolean not null default true,
  price numeric(12, 2),
  ai_context text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint courses_slug_unique unique (slug)
);

create index courses_status_idx on public.courses (status);

create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

-- ---------- modules / sections / lessons ----------
create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null default '',
  description text not null default '',
  order_index integer not null default 0
);

create index course_modules_course_id_idx on public.course_modules (course_id);

create table public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid not null references public.course_modules (id) on delete cascade,
  title text not null default '',
  description text not null default '',
  order_index integer not null default 0
);

create index course_sections_course_id_idx on public.course_sections (course_id);
create index course_sections_module_id_idx on public.course_sections (module_id);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid references public.course_modules (id) on delete set null,
  section_id uuid references public.course_sections (id) on delete set null,
  title text not null default '',
  description text not null default '',
  content_text text,
  ai_context text,
  video_url text,
  pdf_url text,
  file_url text,
  file_type public.file_type not null default 'text',
  duration_minutes integer not null default 0,
  order_index integer not null default 0,
  is_preview boolean not null default false,
  status public.lesson_status not null default 'draft'
);

create index lessons_course_id_idx on public.lessons (course_id);

-- ---------- enrollments ----------
create table public.enrollments (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create index enrollments_course_id_idx on public.enrollments (course_id);

-- ---------- notes ----------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  title text not null,
  content text not null default '',
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  source public.note_source not null,
  selection_meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_course_idx on public.notes (user_id, course_id);

create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

-- ---------- lesson progress ----------
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status public.lesson_progress_status not null default 'not_started',
  progress_percentage smallint not null default 0,
  last_opened_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id, lesson_id)
);

create index lesson_progress_user_course_idx on public.lesson_progress (user_id, course_id);

-- ---------- business profile ----------
create table public.student_business_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null default '',
  industry text not null default '',
  business_model text not null default '',
  target_customer text not null default '',
  main_goal text not null default '',
  main_challenge text not null default '',
  current_stage text not null default '',
  country text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger student_business_profiles_set_updated_at
before update on public.student_business_profiles
for each row execute function public.set_updated_at();

-- ---------- AI threads / messages ----------
create table public.ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  title text not null default '',
  mode public.mentor_mode not null default 'class',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_threads_user_course_idx on public.ai_threads (user_id, course_id);

create trigger ai_threads_set_updated_at
before update on public.ai_threads
for each row execute function public.set_updated_at();

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_threads (id) on delete cascade,
  role public.ai_message_role not null,
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index ai_messages_thread_created_idx on public.ai_messages (thread_id, created_at);

-- ---------- Admin media library (MockMediaEntry) ----------
create table public.media_library_items (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  file_name text not null,
  file_type text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

create index media_library_items_uploaded_by_idx on public.media_library_items (uploaded_by);

-- ---------- Helpers (después de tablas; coursesRepo + enrollments) ----------
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
          and pr.role in ('course_admin', 'superadmin')
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
      and p.role in ('course_admin', 'superadmin')
  );
$$;

-- ---------- Auth: crear perfil al registrarse ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    null,
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_sections enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.notes enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.student_business_profiles enable row level security;
alter table public.ai_threads enable row level security;
alter table public.ai_messages enable row level security;
alter table public.media_library_items enable row level security;

create policy profiles_select_own_or_admin
  on public.profiles for select
  using (id = auth.uid() or public.is_course_admin());

create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy courses_select_published
  on public.courses for select
  using (status = 'published'::public.course_status);

create policy courses_all_admin
  on public.courses for all
  using (public.is_course_admin())
  with check (public.is_course_admin());

create policy course_modules_select_access
  on public.course_modules for select
  using (
    public.is_course_admin()
    or (
      exists (
        select 1 from public.courses c
        where c.id = course_modules.course_id
          and c.status = 'published'::public.course_status
      )
      and public.has_course_access(auth.uid(), course_id)
    )
  );

create policy course_modules_write_admin
  on public.course_modules for all
  using (public.is_course_admin())
  with check (public.is_course_admin());

create policy course_sections_select_access
  on public.course_sections for select
  using (
    public.is_course_admin()
    or (
      exists (
        select 1 from public.courses c
        where c.id = course_sections.course_id
          and c.status = 'published'::public.course_status
      )
      and public.has_course_access(auth.uid(), course_id)
    )
  );

create policy course_sections_write_admin
  on public.course_sections for all
  using (public.is_course_admin())
  with check (public.is_course_admin());

create policy lessons_select_access
  on public.lessons for select
  using (
    public.is_course_admin()
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

create policy lessons_write_admin
  on public.lessons for all
  using (public.is_course_admin())
  with check (public.is_course_admin());

create policy enrollments_select_own_or_admin
  on public.enrollments for select
  using (user_id = auth.uid() or public.is_course_admin());

create policy enrollments_write_admin
  on public.enrollments for insert
  with check (public.is_course_admin());

create policy enrollments_update_admin
  on public.enrollments for update
  using (public.is_course_admin());

create policy enrollments_delete_admin
  on public.enrollments for delete
  using (public.is_course_admin());

create policy notes_all_own
  on public.notes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy lesson_progress_all_own
  on public.lesson_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy business_profiles_select_own
  on public.student_business_profiles for select
  using (user_id = auth.uid());

create policy business_profiles_insert_own
  on public.student_business_profiles for insert
  with check (user_id = auth.uid());

create policy business_profiles_update_own
  on public.student_business_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy business_profiles_delete_own
  on public.student_business_profiles for delete
  using (user_id = auth.uid());

create policy ai_threads_all_own
  on public.ai_threads for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy ai_messages_all_via_thread
  on public.ai_messages for all
  using (
    exists (
      select 1 from public.ai_threads t
      where t.id = ai_messages.thread_id
        and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.ai_threads t
      where t.id = ai_messages.thread_id
        and t.user_id = auth.uid()
    )
  );

create policy media_library_admin_all
  on public.media_library_items for all
  using (public.is_course_admin())
  with check (public.is_course_admin());

-- ---------- Grants (roles API Supabase) ----------
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
