import { cn } from '@/lib/utils/cn';

export type LoadingSkeletonVariant =
  | 'text'
  | 'card'
  | 'list'
  | 'viewer'
  | 'chat'
  | 'sidebar'
  | 'topbar';

interface Props {
  variant?: LoadingSkeletonVariant;
  className?: string;
  rows?: number;
  label?: string;
}

const baseShimmer =
  'animate-pulse-soft rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200';

export function LoadingSkeleton({
  variant = 'text',
  className,
  rows = 3,
  label,
}: Props) {
  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-label={label ?? 'Cargando'}
        className={cn('surface-card space-y-3 p-4', className)}
      >
        <div className={cn(baseShimmer, 'h-4 w-2/3')} />
        <div className={cn(baseShimmer, 'h-3 w-full')} />
        <div className={cn(baseShimmer, 'h-3 w-5/6')} />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <ul
        role="status"
        aria-label={label ?? 'Cargando lista'}
        className={cn('space-y-2', className)}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-3"
          >
            <div className={cn(baseShimmer, 'h-8 w-8 rounded-full')} />
            <div className="flex-1 space-y-2">
              <div className={cn(baseShimmer, 'h-3 w-1/2')} />
              <div className={cn(baseShimmer, 'h-3 w-4/5')} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (variant === 'viewer') {
    return (
      <div
        role="status"
        aria-label={label ?? 'Cargando contenido'}
        className={cn(
          'flex h-full min-h-[60vh] flex-col items-stretch justify-stretch gap-4 p-6',
          className,
        )}
      >
        <div className={cn(baseShimmer, 'h-6 w-1/3')} />
        <div className={cn(baseShimmer, 'flex-1 rounded-2xl')} />
      </div>
    );
  }

  if (variant === 'chat') {
    return (
      <div
        role="status"
        aria-label={label ?? 'Cargando chat'}
        className={cn('space-y-3 p-4', className)}
      >
        <div className={cn(baseShimmer, 'h-10 w-3/4')} />
        <div className={cn(baseShimmer, 'h-10 w-2/3 self-end')} />
        <div className={cn(baseShimmer, 'h-10 w-4/5')} />
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div
        role="status"
        aria-label={label ?? 'Cargando temario'}
        className={cn('space-y-4 p-4', className)}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={cn(baseShimmer, 'h-4 w-1/2')} />
            <div className={cn(baseShimmer, 'h-3 w-3/4')} />
            <div className={cn(baseShimmer, 'h-3 w-2/3')} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'topbar') {
    return (
      <div
        role="status"
        aria-label={label ?? 'Cargando'}
        className={cn('flex items-center gap-3 px-4 py-3', className)}
      >
        <div className={cn(baseShimmer, 'h-3 w-32')} />
        <div className={cn(baseShimmer, 'h-3 w-48')} />
        <div className={cn(baseShimmer, 'ml-auto h-3 w-24')} />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={label ?? 'Cargando'}
      className={cn('space-y-2', className)}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(baseShimmer, 'h-3', i === rows - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}
