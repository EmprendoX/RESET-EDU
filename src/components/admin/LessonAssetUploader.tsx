import { useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import type { LessonFormValues } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { AdminMockFileDropzone } from '@/components/admin/AdminMockFileDropzone';
import { cn } from '@/lib/utils/cn';
import { uploadLessonFile } from '@/lib/storage/lessonFileUpload';
import { persistLessonAssetAfterUpload } from '@/lib/storage/lessonAssetsSupabase';
import { getSupabase } from '@/lib/supabase/client';
import { LESSON_UPLOAD_ROWS } from '@/lib/storage/lessonUploadRows';
import type { LessonUploadRowConfig } from '@/lib/storage/lessonUploadRows';

type UploadState = 'idle' | 'uploading' | 'uploaded' | 'error';

interface StorageRowProps {
  row: LessonUploadRowConfig;
  courseId: string;
  lessonId: string;
  setValue: UseFormSetValue<LessonFormValues>;
}

function StorageUploadRow({
  row,
  courseId,
  lessonId,
  setValue,
}: StorageRowProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);

  async function onFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    const validationError = row.validate(file);
    if (validationError) {
      setErrorHint(validationError);
      setState('error');
      return;
    }
    setErrorHint(null);
    setPendingName(file.name);
    setState('uploading');
    try {
      const sb = getSupabase();
      if (!sb) throw new Error('Supabase no está configurado.');

      const { publicUrl, path } = await uploadLessonFile({
        courseId,
        lessonId,
        file,
      });

      await persistLessonAssetAfterUpload(sb, {
        lessonId,
        courseId,
        file,
        publicUrl,
        storagePath: path,
        fileType: row.fileType,
        assetSlot: row.assetSlot,
      });

      setLastUrl(publicUrl);
      setState('uploaded');
      if (row.applyPdf) {
        setValue('pdf_url', publicUrl, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      if (row.applyFile) {
        setValue('file_url', publicUrl, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      setValue('file_type', row.fileType, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (e) {
      setErrorHint(
        e instanceof Error ? e.message : 'Error al subir el archivo.',
      );
      setState('error');
      setLastUrl(null);
      setPendingName(null);
    }
  }

  const busy = state === 'uploading';

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{row.label}</p>
          <p className="text-xs text-slate-500">{row.hint}</p>
          {pendingName && state !== 'idle' ? (
            <p className="mt-1 truncate text-xs text-slate-700">{pendingName}</p>
          ) : null}
          {lastUrl && state === 'uploaded' ? (
            <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
              {lastUrl}
            </p>
          ) : null}
          {state === 'error' && errorHint ? (
            <p className="mt-1 text-xs text-rose-600">{errorHint}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase',
              state === 'idle' && 'bg-slate-100 text-slate-600',
              state === 'uploading' && 'bg-amber-50 text-amber-800',
              state === 'uploaded' && 'bg-emerald-50 text-emerald-800',
              state === 'error' && 'bg-rose-50 text-rose-700',
            )}
          >
            {state === 'idle' && 'Listo'}
            {state === 'uploading' && 'Subiendo…'}
            {state === 'uploaded' && 'Subido'}
            {state === 'error' && 'Error'}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setState('idle');
              setErrorHint(null);
              setPendingName(null);
              setLastUrl(null);
            }}
          >
            Reiniciar
          </Button>
        </div>
      </div>
      <AdminMockFileDropzone
        variant="compact"
        accept={row.accept}
        disabled={busy}
        description="Suelta el archivo o haz clic para elegirlo (Supabase Storage)."
        onFilesSelected={(files) => void onFiles(files)}
      />
    </li>
  );
}

interface Props {
  courseId: string;
  lessonId: string;
  setValue: UseFormSetValue<LessonFormValues>;
  className?: string;
}

export function LessonAssetUploader({ courseId, lessonId, setValue, className }: Props) {
  return (
    <div className={cn('md:col-span-2', className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Subir archivos (Supabase Storage)
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Bucket público <code className="rounded bg-slate-100 px-1">lesson-files</code>.
        Cada subida registra metadata en <code className="rounded bg-slate-100 px-1">lesson_assets</code>.
        Guarda la lección para sincronizar URL en el registro de la lección (visor del alumno).
      </p>
      <ul className="mt-3 space-y-3">
        {LESSON_UPLOAD_ROWS.map((row) => (
          <StorageUploadRow
            key={row.id}
            row={row}
            courseId={courseId}
            lessonId={lessonId}
            setValue={setValue}
          />
        ))}
      </ul>
    </div>
  );
}
