import type { CourseStatus } from '@/types/course';
import { cn } from '@/lib/utils/cn';

const LABELS: Record<CourseStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
};

interface Props {
  status: CourseStatus;
  className?: string;
}

export function CourseStatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        status === 'published' &&
          'border-emerald-200 bg-emerald-50 text-emerald-900',
        status === 'draft' &&
          'border-amber-200 bg-amber-50 text-amber-900',
        status === 'archived' &&
          'border-slate-200 bg-slate-100 text-slate-700',
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
