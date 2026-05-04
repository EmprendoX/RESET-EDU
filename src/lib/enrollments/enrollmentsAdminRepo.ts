import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface EnrollmentAdminRow {
  user_id: string;
  course_id: string;
  created_at: string;
  user_email: string | null;
  user_full_name: string | null;
  course_title: string;
  course_slug: string;
  course_is_free: boolean;
}

export interface ProfileSearchHit {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
}

export interface CourseOption {
  id: string;
  title: string;
  slug: string;
  is_free: boolean;
}

function assertConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado.');
  }
  const sb = getSupabase();
  if (!sb) throw new Error('Cliente Supabase no disponible.');
}

/**
 * Listado de matrículas para admins (RLS: course_admin).
 */
export async function listEnrollmentsAdmin(): Promise<EnrollmentAdminRow[]> {
  assertConfigured();
  const sb = getSupabase()!;

  const { data, error } = await sb
    .from('enrollments')
    .select(
      'user_id, course_id, created_at, profiles(email, full_name), courses(title, slug, is_free)',
    );

  if (error) throw error;

  const rows: EnrollmentAdminRow[] = (data ?? []).map((raw) => {
    const r = raw as {
      user_id: string;
      course_id: string;
      created_at: string;
      profiles:
        | { email: string | null; full_name: string | null }
        | { email: string | null; full_name: string | null }[]
        | null;
      courses:
        | { title: string; slug: string; is_free: boolean }
        | { title: string; slug: string; is_free: boolean }[]
        | null;
    };
    const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    const crs = Array.isArray(r.courses) ? r.courses[0] : r.courses;
    return {
      user_id: r.user_id,
      course_id: r.course_id,
      created_at: r.created_at,
      user_email: prof?.email ?? null,
      user_full_name: prof?.full_name ?? null,
      course_title: crs?.title ?? '—',
      course_slug: crs?.slug ?? '',
      course_is_free: Boolean(crs?.is_free),
    };
  });

  rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return rows;
}

export async function searchProfilesByEmail(
  q: string,
): Promise<ProfileSearchHit[]> {
  assertConfigured();
  const sb = getSupabase()!;
  const term = q.trim();
  if (term.length < 2) return [];

  const { data, error } = await sb
    .from('profiles')
    .select('id, email, full_name, role')
    .ilike('email', `%${term}%`)
    .limit(25);

  if (error) throw error;
  return (data ?? []) as ProfileSearchHit[];
}

export async function listCoursesForEnrollmentPicker(): Promise<
  CourseOption[]
> {
  assertConfigured();
  const sb = getSupabase()!;
  const { data, error } = await sb
    .from('courses')
    .select('id, title, slug, is_free, status')
    .eq('status', 'published')
    .order('title');

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String((row as { id: string }).id),
    title: String((row as { title: string }).title ?? ''),
    slug: String((row as { slug: string }).slug ?? ''),
    is_free: Boolean((row as { is_free: boolean }).is_free),
  }));
}

export async function grantEnrollment(
  userId: string,
  courseId: string,
): Promise<void> {
  assertConfigured();
  const sb = getSupabase()!;
  const { error } = await sb.from('enrollments').insert({
    user_id: userId,
    course_id: courseId,
  });
  if (error) throw error;
}

export async function revokeEnrollment(
  userId: string,
  courseId: string,
): Promise<void> {
  assertConfigured();
  const sb = getSupabase()!;
  const { error } = await sb
    .from('enrollments')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) throw error;
}
