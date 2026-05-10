import { getSupabase } from '@/lib/supabase/client';

/** Debe coincidir con `supabase/migrations/004_storage_lesson_files.sql`. */
export const LESSON_FILES_BUCKET = 'lesson-files';

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
}

export async function uploadLessonFile(args: {
  courseId: string;
  lessonId: string;
  file: File;
}): Promise<{ publicUrl: string; path: string }> {
  const { courseId, lessonId, file } = args;
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase no está configurado.');

  const safeName = sanitizeFileName(file.name || 'file');
  const path = `courses/${courseId}/lessons/${lessonId}/${crypto.randomUUID()}-${safeName}`;

  const { error } = await sb.storage.from(LESSON_FILES_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = sb.storage.from(LESSON_FILES_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}
