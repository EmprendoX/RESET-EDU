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
    classes: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  },
  current: {
    label: 'Lección actual',
    classes: 'border-brand-500/40 bg-brand-500/15 text-brand-300',
  },
  pending: {
    label: 'Lección pendiente',
    classes: 'border-reset-border bg-reset-bg-2 text-reset-text-dim',
  },
  locked: {
    label: 'Lección bloqueada',
    classes: 'border-reset-border bg-reset-bg-3 text-reset-text-dim',
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
