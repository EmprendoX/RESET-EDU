import type { SupabaseClient } from '@supabase/supabase-js';
import type { FileType } from '@/types/lesson';
import { LESSON_FILES_BUCKET } from '@/lib/storage/lessonFileUpload';
import type { LessonAssetSlot } from '@/lib/storage/lessonUploadRows';

function fileTypesToReplace(slot: LessonAssetSlot): FileType[] {
  if (slot === 'pdf') return ['pdf'];
  if (slot === 'pptx') return ['pptx'];
  return ['unsupported'];
}

async function removeStoragePaths(
  sb: SupabaseClient,
  paths: string[],
): Promise<void> {
  const unique = [...new Set(paths.filter((p) => p && p.includes('/')))];
  if (unique.length === 0) return;
  const { error } = await sb.storage.from(LESSON_FILES_BUCKET).remove(unique);
  if (error) throw error;
}

/**
 * Tras subir a Storage: elimina filas `lesson_assets` del mismo slot, borra objetos
 * viejos del bucket cuando `storage_path` apunta a `lesson-files`, e inserta la nueva fila.
 */
export async function persistLessonAssetAfterUpload(
  sb: SupabaseClient,
  args: {
    lessonId: string;
    courseId: string;
    file: File;
    publicUrl: string;
    storagePath: string;
    fileType: FileType;
    assetSlot: LessonAssetSlot;
  },
): Promise<void> {
  const { lessonId, courseId, file, publicUrl, storagePath, fileType, assetSlot } =
    args;
  const replaceTypes = fileTypesToReplace(assetSlot);

  const { data: existing, error: selErr } = await sb
    .from('lesson_assets')
    .select('id, storage_path')
    .eq('lesson_id', lessonId)
    .eq('course_id', courseId)
    .in('file_type', replaceTypes);

  if (selErr) throw selErr;

  const oldPaths = (existing ?? [])
    .map((r) => r.storage_path)
    .filter((p): p is string => Boolean(p));

  if (oldPaths.length > 0) {
    await removeStoragePaths(sb, oldPaths);
  }

  if (existing?.length) {
    const { error: delErr } = await sb
      .from('lesson_assets')
      .delete()
      .eq('lesson_id', lessonId)
      .eq('course_id', courseId)
      .in('file_type', replaceTypes);
    if (delErr) throw delErr;
  }

  const safeName = (file.name || 'file').slice(0, 500);
  const { error: insErr } = await sb.from('lesson_assets').insert({
    lesson_id: lessonId,
    course_id: courseId,
    file_name: safeName,
    file_type: fileType,
    file_url: publicUrl,
    storage_path: storagePath,
    visibility: 'public',
  });
  if (insErr) throw insErr;
}
