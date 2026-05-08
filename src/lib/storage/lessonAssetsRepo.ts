import type { SupabaseClient } from '@supabase/supabase-js';
import type { FileType } from '@/types/lesson';

const BUCKET = 'lesson-files';

export interface UploadedAsset {
  assetId: string;
  storagePath: string;
  fileName: string;
  fileType: FileType;
}

function sanitizeFileName(name: string): string {
  const stripped = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stripped.slice(0, 80) || 'file';
}

function inferFileType(file: File, hint?: FileType): FileType {
  if (hint) return hint;
  const n = file.name.toLowerCase();
  if (n.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf';
  if (
    n.endsWith('.ppt') ||
    n.endsWith('.pptx') ||
    file.type.includes('presentation') ||
    file.type.includes('powerpoint')
  ) {
    return 'pptx';
  }
  return 'unsupported';
}

export async function uploadLessonAsset(
  sb: SupabaseClient,
  args: {
    courseId: string;
    lessonId: string;
    file: File;
    fileTypeHint?: FileType;
  },
): Promise<UploadedAsset> {
  const fileName = sanitizeFileName(args.file.name);
  const id = crypto.randomUUID();
  const storagePath = `${args.courseId}/${args.lessonId}/${id}-${fileName}`;
  const fileType = inferFileType(args.file, args.fileTypeHint);

  const { error: upErr } = await sb.storage
    .from(BUCKET)
    .upload(storagePath, args.file, {
      cacheControl: '3600',
      upsert: false,
      contentType: args.file.type || undefined,
    });
  if (upErr) throw upErr;

  const { data, error: dbErr } = await sb
    .from('lesson_assets')
    .insert({
      lesson_id: args.lessonId,
      course_id: args.courseId,
      file_name: fileName,
      file_type: fileType,
      file_url: '',
      storage_path: storagePath,
      visibility: 'private',
    })
    .select('id')
    .single();
  if (dbErr) {
    await sb.storage
      .from(BUCKET)
      .remove([storagePath])
      .catch(() => undefined);
    throw dbErr;
  }

  return {
    assetId: (data as { id: string }).id,
    storagePath,
    fileName,
    fileType,
  };
}

export async function getLessonAssetSignedUrl(
  sb: SupabaseClient,
  storagePath: string,
  expiresIn = 3600,
): Promise<string> {
  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error('Signed URL vacío');
  return data.signedUrl;
}

export async function removeLessonAssetByStoragePath(
  sb: SupabaseClient,
  storagePath: string,
): Promise<void> {
  await sb.from('lesson_assets').delete().eq('storage_path', storagePath);
  await sb.storage.from(BUCKET).remove([storagePath]);
}

export function isStoragePath(value: string | undefined | null): boolean {
  if (!value) return false;
  const t = value.trim();
  if (!t) return false;
  if (t.startsWith('http://') || t.startsWith('https://')) return false;
  if (t.startsWith('blob:') || t.startsWith('data:')) return false;
  if (t.includes('://')) return false;
  return t.includes('/');
}
