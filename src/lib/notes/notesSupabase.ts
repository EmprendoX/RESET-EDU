import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateNoteInput,
  Note,
  NoteSource,
  SelectionMeta,
  UpdateNoteInput,
} from '@/types/notes';
import { getSessionUserId, requireSessionUserId } from '@/lib/supabase/sessionUser';

function asRecord(row: unknown): Record<string, unknown> {
  return row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
}

function parseSource(v: unknown): NoteSource {
  if (v === 'manual' || v === 'ai' || v === 'selection') return v;
  return 'manual';
}

function parseSelectionMeta(
  raw: unknown,
): SelectionMeta | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const sourceType = o.sourceType;
  if (
    sourceType !== 'pdf' &&
    sourceType !== 'text' &&
    sourceType !== 'video' &&
    sourceType !== 'ai'
  ) {
    return undefined;
  }
  return {
    sourceType,
    page: typeof o.page === 'number' ? o.page : undefined,
    slide: typeof o.slide === 'number' ? o.slide : undefined,
    videoTimestamp:
      typeof o.videoTimestamp === 'number' ? o.videoTimestamp : undefined,
    fileName: typeof o.fileName === 'string' ? o.fileName : undefined,
  };
}

function mapRow(row: Record<string, unknown>): Note {
  const tagsRaw = row.tags;
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.map((t) => String(t))
    : [];

  const lessonId = row.lesson_id;
  return {
    id: String(row.id ?? ''),
    user_id: String(row.user_id ?? ''),
    course_id: String(row.course_id ?? ''),
    lesson_id:
      lessonId != null && lessonId !== '' ? String(lessonId) : undefined,
    title: String(row.title ?? ''),
    content: String(row.content ?? ''),
    tags,
    is_pinned: Boolean(row.is_pinned),
    source: parseSource(row.source),
    selection_meta: parseSelectionMeta(row.selection_meta),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function sortNotesPinnedThenUpdated(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export async function sbNotesList(
  sb: SupabaseClient,
  args: { courseId: string; lessonId?: string },
): Promise<Note[]> {
  if (!(await getSessionUserId(sb))) return [];

  let q = sb.from('notes').select('*').eq('course_id', args.courseId);
  if (args.lessonId !== undefined) {
    q = q.eq('lesson_id', args.lessonId);
  }
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []).map((r) => mapRow(asRecord(r)));
  return sortNotesPinnedThenUpdated(rows);
}

export async function sbNotesListAllForCourse(
  sb: SupabaseClient,
  courseId: string,
): Promise<Note[]> {
  if (!(await getSessionUserId(sb))) return [];

  const { data, error } = await sb
    .from('notes')
    .select('*')
    .eq('course_id', courseId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => mapRow(asRecord(r)));
}

export async function sbNotesListRecent(
  sb: SupabaseClient,
  limit: number,
): Promise<Note[]> {
  if (!(await getSessionUserId(sb))) return [];

  const { data, error } = await sb
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(Math.max(0, limit));

  if (error) throw error;
  return (data ?? []).map((r) => mapRow(asRecord(r)));
}

export async function sbNotesCreate(
  sb: SupabaseClient,
  input: CreateNoteInput,
): Promise<Note> {
  const userId = requireSessionUserId(await getSessionUserId(sb));

  const row = {
    user_id: userId,
    course_id: input.course_id,
    lesson_id: input.lesson_id ?? null,
    title: input.title.trim() || 'Sin título',
    content: input.content,
    tags: input.tags ?? [],
    is_pinned: false,
    source: input.source,
    selection_meta: input.selection_meta ?? null,
  };

  const { data, error } = await sb
    .from('notes')
    .insert(row)
    .select('*')
    .single();

  if (error) throw error;
  return mapRow(asRecord(data));
}

export async function sbNotesUpdate(
  sb: SupabaseClient,
  input: UpdateNoteInput,
): Promise<Note> {
  requireSessionUserId(await getSessionUserId(sb));

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.content !== undefined) patch.content = input.content;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.is_pinned !== undefined) patch.is_pinned = input.is_pinned;

  if (Object.keys(patch).length === 0) {
    const { data: cur, error: fetchErr } = await sb
      .from('notes')
      .select('*')
      .eq('id', input.id)
      .single();
    if (fetchErr) throw fetchErr;
    return mapRow(asRecord(cur));
  }

  const { data, error } = await sb
    .from('notes')
    .update(patch)
    .eq('id', input.id)
    .select('*')
    .single();

  if (error) throw error;
  return mapRow(asRecord(data));
}

export async function sbNotesRemove(sb: SupabaseClient, id: string): Promise<void> {
  if (!(await getSessionUserId(sb))) {
    throw new Error('No hay sesión. Inicia sesión para continuar.');
  }

  const { error } = await sb.from('notes').delete().eq('id', id);
  if (error) throw error;
}
