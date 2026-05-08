import { useState } from 'react';
import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import type { LessonFormValues } from '@/types/admin';
import type { FileType } from '@/types/lesson';
import { Button } from '@/components/ui/Button';
import { AdminMockFileDropzone } from '@/components/admin/AdminMockFileDropzone';
import { cn } from '@/lib/utils/cn';
import { getSupabase } from '@/lib/supabase/client';
import {
  isStoragePath,
  removeLessonAssetByStoragePath,
  uploadLessonAsset,
} from '@/lib/storage/lessonAssetsRepo';

type UploadState = 'idle' | 'uploading' | 'uploaded' | 'error';

interface RowConfig {
  id: string;
  label: string;
  hint: string;
  accept: string;
  field: 'pdf_url' | 'file_url';
  fileType: FileType;
  validate: (file: File) => string | null;
}

const ROWS: RowConfig[] = [
  {
    id: 'pdf',
    label: 'PDF',
    hint: 'Recomendado para el visor del aula.',
    accept: 'application/pdf,.pdf',
    field: 'pdf_url',
    fileType: 'pdf',
    validate: (f) =>
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        ? null
        : 'Selecciona un archivo PDF.',
  },
  {
    id: 'ppt',
    label: 'Presentación (PPT/PPTX)',
    hint: 'Se guarda en Archivo. El MVP recomienda PDF para vista previa.',
    accept:
      '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    field: 'file_url',
    fileType: 'pptx',
    validate: (f) => {
      const n = f.name.toLowerCase();
      if (n.endsWith('.ppt') || n.endsWith('.pptx')) return null;
      if (f.type.includes('presentation') || f.type.includes('powerpoint'))
        return null;
      return 'Selecciona un PowerPoint (.ppt o .pptx).';
    },
  },
  {
    id: 'generic',
    label: 'Archivo genérico',
    hint: 'Cualquier archivo como recurso adicional.',
    accept: '*/*',
    field: 'file_url',
    fileType: 'unsupported',
    validate: () => null,
  },
];

const MAX_BYTES = 50 * 1024 * 1024;

interface RowProps {
  row: RowConfig;
  courseId: string;
  lessonId: string;
  setValue: UseFormSetValue<LessonFormValues>;
  getValues: UseFormGetValues<LessonFormValues>;
}

function UploadRow({ row, courseId, lessonId, setValue, getValues }: RowProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [lastPath, setLastPath] = useState<string | null>(null);

  async function onFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    const sb = getSupabase();
    if (!sb) {
      setError('Supabase no está configurado.');
      setState('error');
      return;
    }
    const v = row.validate(file);
    if (v) {
      setError(v);
      setState('error');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `El archivo supera los ${Math.round(MAX_BYTES / 1024 / 1024)} MB.`,
      );
      setState('error');
      return;
    }
    setError(null);
    setPendingName(file.name);
    setState('uploading');
    try {
      const prev = getValues(row.field);
      const result = await uploadLessonAsset(sb, {
        courseId,
        lessonId,
        file,
        fileTypeHint: row.fileType,
      });
      setLastPath(result.storagePath);
      setValue(row.field, result.storagePath, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('file_type', row.fileType, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setState('uploaded');
      if (prev && isStoragePath(prev) && prev !== result.storagePath) {
        await removeLessonAssetByStoragePath(sb, prev).catch(() => undefined);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'No se pudo subir el archivo.';
      setError(msg);
      setState('error');
    }
  }

  async function onRemove() {
    const sb = getSupabase();
    const current = getValues(row.field);
    if (sb && current && isStoragePath(current)) {
      await removeLessonAssetByStoragePath(sb, current).catch(() => undefined);
    }
    setValue(row.field, '', { shouldDirty: true, shouldValidate: true });
    setLastPath(null);
    setPendingName(null);
    setState('idle');
    setError(null);
  }

  const busy = state === 'uploading';
  const currentValue = getValues(row.field);
  const hasStoredPath = isStoragePath(currentValue);

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{row.label}</p>
          <p className="text-xs text-slate-500">{row.hint}</p>
          {pendingName && state !== 'idle' ? (
            <p className="mt-1 truncate text-xs text-slate-700">{pendingName}</p>
          ) : null}
          {lastPath ? (
            <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
              {lastPath}
            </p>
          ) : null}
          {state === 'error' && error ? (
            <p className="mt-1 text-xs text-rose-600">{error}</p>
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
            {state === 'idle' && (hasStoredPath ? 'Asignado' : 'Listo')}
            {state === 'uploading' && 'Subiendo…'}
            {state === 'uploaded' && 'Asignado'}
            {state === 'error' && 'Revisa el archivo'}
          </span>
          {hasStoredPath ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void onRemove()}
            >
              Quitar
            </Button>
          ) : null}
        </div>
      </div>
      <AdminMockFileDropzone
        variant="compact"
        accept={row.accept}
        disabled={busy}
        description={
          hasStoredPath
            ? 'Sube otro archivo para reemplazar.'
            : 'Suelta el archivo o haz clic para elegirlo.'
        }
        onFilesSelected={(f) => void onFiles(f)}
      />
    </li>
  );
}

interface Props {
  courseId: string;
  lessonId: string;
  setValue: UseFormSetValue<LessonFormValues>;
  getValues: UseFormGetValues<LessonFormValues>;
  className?: string;
}

export function LessonAssetUploader({
  courseId,
  lessonId,
  setValue,
  getValues,
  className,
}: Props) {
  return (
    <div className={cn('md:col-span-2', className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Subir archivos de lección
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Los archivos se guardan privados en Supabase Storage; el aula los abre
        con URL firmada cuando el alumno tenga acceso.
      </p>
      <ul className="mt-3 space-y-3">
        {ROWS.map((row) => (
          <UploadRow
            key={row.id}
            row={row}
            courseId={courseId}
            lessonId={lessonId}
            setValue={setValue}
            getValues={getValues}
          />
        ))}
      </ul>
    </div>
  );
}
