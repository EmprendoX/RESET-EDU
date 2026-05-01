import type { FileType } from '@/types/lesson';
import { cn } from '@/lib/utils/cn';

const LABELS: Record<FileType, string> = {
  pdf: 'PDF',
  video: 'Vídeo',
  pptx: 'PPT',
  text: 'Texto',
  mixed: 'Mixto',
  unsupported: 'Archivo',
};

const STYLES: Record<FileType, string> = {
  pdf: 'border-rose-200 bg-rose-50 text-rose-800',
  video: 'border-violet-200 bg-violet-50 text-violet-800',
  pptx: 'border-amber-200 bg-amber-50 text-amber-900',
  text: 'border-slate-200 bg-slate-50 text-slate-800',
  mixed: 'border-sky-200 bg-sky-50 text-sky-900',
  unsupported: 'border-slate-200 bg-white text-slate-700',
};

interface Props {
  type: FileType;
  className?: string;
}

export function AdminFileTypeBadge({ type, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        STYLES[type],
        className,
      )}
    >
      {LABELS[type]}
    </span>
  );
}
