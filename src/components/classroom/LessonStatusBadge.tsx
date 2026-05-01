import { Check, Circle, Lock, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type LessonStatusVisual =
  | 'completed'
  | 'current'
  | 'pending'
  | 'locked';

interface Props {
  status: LessonStatusVisual;
  className?: string;
  ariaLabel?: string;
}

const STATUS_CFG: Record<LessonStatusVisual, { label: string; classes: string }> = {
  completed: {
    label: 'Lección completada',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
  current: {
    label: 'Lección actual',
    classes: 'border-brand-200 bg-brand-50 text-brand-600',
  },
  pending: {
    label: 'Lección pendiente',
    classes: 'border-slate-200 bg-white text-slate-400',
  },
  locked: {
    label: 'Lección bloqueada',
    classes: 'border-slate-200 bg-slate-50 text-slate-400',
  },
};

export function LessonStatusBadge({ status, className, ariaLabel }: Props) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      role="img"
      aria-label={ariaLabel ?? cfg.label}
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
        cfg.classes,
        className,
      )}
    >
      {status === 'completed' ? (
        <Check className="h-3 w-3" aria-hidden />
      ) : status === 'current' ? (
        <Play className="h-2.5 w-2.5 fill-current" aria-hidden />
      ) : status === 'locked' ? (
        <Lock className="h-3 w-3" aria-hidden />
      ) : (
        <Circle className="h-2.5 w-2.5" aria-hidden />
      )}
    </span>
  );
}
