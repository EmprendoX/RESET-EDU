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
  /** Solo superadmin vía RPC; null para course_admin. */
  role: string | null;
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
 * Listado de matrículas para staff (course_admin / superadmin) vía RPC security definer.
 */
export async function listEnrollmentsAdmin(): Promise<EnrollmentAdminRow[]> {
  assertConfigured();
  const sb = getSupabase()!;

  const { data, error } = await sb.rpc('admin_list_enrollments');

  if (error) throw error;

  type RpcRow = {
    user_id: string;
    course_id: string;
    created_at: string;
    user_email: string | null;
    user_full_name: string | null;
    course_title: string;
    course_slug: string;
    course_is_free: boolean;
  };

  const rows: EnrollmentAdminRow[] = ((data ?? []) as RpcRow[]).map((r) => ({
    user_id: r.user_id,
    course_id: r.course_id,
    created_at: r.created_at,
    user_email: r.user_email ?? null,
    user_full_name: r.user_full_name ?? null,
    course_title: r.course_title ?? '—',
    course_slug: r.course_slug ?? '',
    course_is_free: Boolean(r.course_is_free),
  }));

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

  const { data, error } = await sb.rpc('admin_search_profiles_by_email', {
    p_term: term,
  });

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
