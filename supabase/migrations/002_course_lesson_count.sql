-- Desnormaliza el conteo de lecciones publicadas por curso para el catálogo (evita leer filas de
-- `lessons` con RLS cuando el alumno no tiene acceso al curso de pago).
alter table public.courses
  add column if not exists lesson_count integer not null default 0;

create or replace function public.refresh_course_lesson_count(p_course_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.courses c
  set lesson_count = coalesce(
    (
      select count(*)::integer
      from public.lessons l
      where l.course_id = p_course_id
        and l.status = 'published'::public.lesson_status
    ),
    0
  )
  where c.id = p_course_id;
$$;

create or replace function public.lessons_touch_course_lesson_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  if tg_op = 'DELETE' then
    cid := old.course_id;
  else
    cid := new.course_id;
  end if;
  perform public.refresh_course_lesson_count(cid);
  if tg_op = 'UPDATE' and new.course_id is distinct from old.course_id then
    perform public.refresh_course_lesson_count(old.course_id);
  end if;
  if tg_op = 'DELETE' then
    return old;
  elsif tg_op = 'UPDATE' then
    return new;
  else
    return new;
  end if;
end;
$$;

drop trigger if exists lessons_refresh_course_lesson_count on public.lessons;
create trigger lessons_refresh_course_lesson_count
after insert or update or delete on public.lessons
for each row execute function public.lessons_touch_course_lesson_count();

-- Backfill (idempotente si ya hay datos)
update public.courses c
set lesson_count = coalesce(
  (
    select count(*)::integer
    from public.lessons l
    where l.course_id = c.id
      and l.status = 'published'::public.lesson_status
  ),
  0
);
