import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import type { LessonFormValues } from '@/types/admin';
import type { FileType } from '@/types/lesson';
import { Button } from '@/components/ui/Button';
import { AdminMockFileDropzone } from '@/components/admin/AdminMockFileDropzone';
import { cn } from '@/lib/utils/cn';

type UploadState = 'idle' | 'uploading' | 'uploaded' | 'error';

interface RowConfig {
  id: string;
  label: string;
  hint: string;
  accept: string;
  applyPdf?: boolean;
  applyFile?: boolean;
  fileType: FileType;
  validate: (file: File) => string | null;
}

const ROWS: RowConfig[] = [
  {
    id: 'pdf',
    label: 'PDF',
    hint: 'PDF para el visor del aula.',
    accept: 'application/pdf,.pdf',
    applyPdf: true,
    fileType: 'pdf',
    validate: (f) =>
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        ? null
        : 'Selecciona un archivo PDF.',
  },
  {
    id: 'ppt',
    label: 'Presentación (PPT/PPTX)',
    hint: 'Se guarda como Archivo / PPT URL (el MVP recomienda PDF para vista previa).',
    accept:
      '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    applyFile: true,
    fileType: 'pptx',
    validate: (f) => {
      const n = f.name.toLowerCase();
      if (n.endsWith('.ppt') || n.endsWith('.pptx')) return null;
      if (
        f.type.includes('presentation') ||
        f.type.includes('powerpoint')
      ) {
        return null;
      }
      return 'Selecciona un PowerPoint (.ppt o .pptx).';
    },
  },
  {
    id: 'doc',
    label: 'Documento (Word)',
    hint: 'Archivo adjunto; el visor principal espera PDF/PPT.',
    accept:
      '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    applyFile: true,
    fileType: 'unsupported',
    validate: (f) => {
      const n = f.name.toLowerCase();
      if (n.endsWith('.doc') || n.endsWith('.docx')) return null;
      if (
        f.type.includes('word') ||
        f.type === 'application/msword'
      ) {
        return null;
      }
      return 'Selecciona un documento Word (.doc o .docx).';
    },
  },
  {
    id: 'image',
    label: 'Imagen',
    hint: 'Enlace blob en Archivo; tipo `unsupported` para no simular PDF/vídeo.',
    accept: 'image/jpeg,image/png,image/webp,image/gif,image/*',
    applyFile: true,
    fileType: 'unsupported',
    validate: (f) =>
      f.type.startsWith('image/') ? null : 'Selecciona una imagen.',
  },
  {
    id: 'generic',
    label: 'Archivo genérico',
    hint: 'Cualquier archivo como recurso descargable / auxiliar.',
    accept: '*/*',
    applyFile: true,
    fileType: 'unsupported',
    validate: () => null,
  },
];

interface MockRowProps {
  row: RowConfig;
  setValue: UseFormSetValue<LessonFormValues>;
}

function MockUploadRow({ row, setValue }: MockRowProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const blobRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearTimer();
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    },
    [clearTimer],
  );

  function onFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    const validationError = row.validate(file);
    if (validationError) {
      setErrorHint(validationError);
      setState('error');
      return;
    }
    setErrorHint(null);
    clearTimer();
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
    const url = URL.createObjectURL(file);
    blobRef.current = url;
    setPendingName(file.name);
    setLastUrl(url);
    setState('uploading');
    timerRef.current = setTimeout(() => {
      setState('uploaded');
      timerRef.current = null;
    }, 450);
  }

  function apply() {
    if (!lastUrl || state !== 'uploaded') return;

    if (row.applyPdf) {
      setValue('pdf_url', lastUrl, { shouldDirty: true, shouldValidate: true });
    }
    if (row.applyFile) {
      setValue('file_url', lastUrl, { shouldDirty: true, shouldValidate: true });
    }
    setValue('file_type', row.fileType, {
      shouldDirty: true,
      shouldValidate: true,
    });
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
          {lastUrl && state !== 'idle' && state !== 'error' ? (
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
            {state === 'uploaded' && 'Listo para aplicar'}
            {state === 'error' && 'Revisa el archivo'}
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
              if (blobRef.current) {
                URL.revokeObjectURL(blobRef.current);
                blobRef.current = null;
              }
            }}
          >
            Reiniciar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={state !== 'uploaded' || !lastUrl}
            onClick={apply}
          >
            {row.applyPdf ? 'Aplicar a PDF' : 'Aplicar a archivo'}
          </Button>
        </div>
      </div>
      <AdminMockFileDropzone
        variant="compact"
        accept={row.accept}
        disabled={busy}
        description="Suelta el archivo o haz clic para elegirlo."
        onFilesSelected={onFiles}
      />
    </li>
  );
}

interface Props {
  setValue: UseFormSetValue<LessonFormValues>;
  className?: string;
}

export function LessonAssetUploaderMock({ setValue, className }: Props) {
  return (
    <div className={cn('md:col-span-2', className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Subir archivos (mock · sin red)
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Genera URLs <code className="rounded bg-slate-100 px-1">blob:</code> en el
        navegador. Guarda la lección para persistir en el catálogo mock; tras
        recargar, esas URLs pueden invalidarse hasta tener Storage.
      </p>
      <ul className="mt-3 space-y-3">
        {ROWS.map((row) => (
          <MockUploadRow key={row.id} row={row} setValue={setValue} />
        ))}
      </ul>
    </div>
  );
}
