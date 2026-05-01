import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = 'Algo salió mal',
  description = 'No pudimos cargar el contenido. Intenta de nuevo en un momento.',
  onRetry,
  retryLabel = 'Reintentar',
  className,
  compact,
}: Props) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        compact ? 'p-4' : 'p-8',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <AlertCircle className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="text-balance max-w-prose text-sm text-slate-500">
          {description}
        </p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
