import { cn } from '@/lib/utils/cn';
import { formatPercent } from '@/lib/utils/format';

interface Props {
  percentage: number;
  totalLessons?: number;
  completedLessons?: number;
  className?: string;
  compact?: boolean;
}

export function LessonProgressBar({
  percentage,
  totalLessons,
  completedLessons,
  className,
  compact,
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(percentage)));
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className="flex items-center justify-between text-[11px] font-medium text-slate-500"
        aria-hidden={compact}
      >
        <span className="uppercase tracking-wide">Progreso</span>
        <span>
          {formatPercent(pct)}
          {typeof completedLessons === 'number' &&
          typeof totalLessons === 'number'
            ? ` · ${completedLessons}/${totalLessons}`
            : ''}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Progreso del curso"
        className={cn(
          'relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200',
          compact && 'h-1',
        )}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-ai-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
