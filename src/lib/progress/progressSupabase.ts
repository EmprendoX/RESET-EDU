import type { SupabaseClient } from '@supabase/supabase-js';
import type { LessonProgress, LessonProgressStatus } from '@/types/lesson';
import { nowIso } from '@/lib/utils/time';
import { getSessionUserId, requireSessionUserId } from '@/lib/supabase/sessionUser';

function asRecord(row: unknown): Record<string, unknown> {
  return row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
}

function parseStatus(v: unknown): LessonProgressStatus {
  if (v === 'not_started' || v === 'started' || v === 'completed') return v;
  return 'not_started';
}

function mapRow(row: Record<string, unknown>): LessonProgress {
  const completedAt = row.completed_at;
  return {
    id: String(row.id ?? ''),
    user_id: String(row.user_id ?? ''),
    course_id: String(row.course_id ?? ''),
    lesson_id: String(row.lesson_id ?? ''),
    status: parseStatus(row.status),
    progress_percentage: Number(row.progress_percentage ?? 0),
    last_opened_at: String(row.last_opened_at ?? ''),
    completed_at:
      completedAt != null && completedAt !== ''
        ? String(completedAt)
        : undefined,
  };
}

export async function sbProgressListForCourse(
  sb: SupabaseClient,
  courseId: string,
): Promise<LessonProgress[]> {
  if (!(await getSessionUserId(sb))) return [];

  const { data, error } = await sb
    .from('lesson_progress')
    .select('*')
    .eq('course_id', courseId)
    .order('last_opened_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => mapRow(asRecord(r)));
}

export async function sbProgressGetLastOpenedLessonId(
  sb: SupabaseClient,
  courseId: string,
): Promise<string | null> {
  if (!(await getSessionUserId(sb))) return null;

  const { data, error } = await sb
    .from('lesson_progress')
    .select('lesson_id, last_opened_at')
    .eq('course_id', courseId)
    .order('last_opened_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data || typeof data !== 'object') return null;
  const r = asRecord(data);
  return r.lesson_id != null ? String(r.lesson_id) : null;
}

export async function sbProgressGetForLesson(
  sb: SupabaseClient,
  courseId: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  if (!(await getSessionUserId(sb))) return null;

  const { data, error } = await sb
    .from('lesson_progress')
    .select('*')
    .eq('course_id', courseId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRow(asRecord(data));
}

export async function sbProgressMarkStarted(
  sb: SupabaseClient,
  courseId: string,
  lessonId: string,
): Promise<LessonProgress> {
  const userId = requireSessionUserId(await getSessionUserId(sb));
  const opened = nowIso();

  const existing = await sbProgressGetForLesson(sb, courseId, lessonId);

  if (existing?.status === 'completed') {
    const { data, error } = await sb
      .from('lesson_progress')
      .update({ last_opened_at: opened })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(asRecord(data));
  }

  const pct = Math.max(existing?.progress_percentage ?? 0, 25);

  const payload = {
    user_id: userId,
    course_id: courseId,
    lesson_id: lessonId,
    status: 'started' as const,
    progress_percentage: pct,
    last_opened_at: opened,
    completed_at: null as string | null,
  };

  const { data, error } = await sb
    .from('lesson_progress')
    .upsert(payload, {
      onConflict: 'user_id,course_id,lesson_id',
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapRow(asRecord(data));
}

export async function sbProgressMarkCompleted(
  sb: SupabaseClient,
  courseId: string,
  lessonId: string,
): Promise<LessonProgress> {
  const userId = requireSessionUserId(await getSessionUserId(sb));
  const opened = nowIso();

  const payload = {
    user_id: userId,
    course_id: courseId,
    lesson_id: lessonId,
    status: 'completed' as const,
    progress_percentage: 100,
    last_opened_at: opened,
    completed_at: opened,
  };

  const { data, error } = await sb
    .from('lesson_progress')
    .upsert(payload, { onConflict: 'user_id,course_id,lesson_id' })
    .select('*')
    .single();

  if (error) throw error;
  return mapRow(asRecord(data));
}

export async function sbProgressResetLesson(
  sb: SupabaseClient,
  courseId: string,
  lessonId: string,
): Promise<void> {
  const userId = await getSessionUserId(sb);
  if (!userId) return;

  const { error } = await sb
    .from('lesson_progress')
    .delete()
    .eq('course_id', courseId)
    .eq('lesson_id', lessonId);

  if (error) throw error;
}
