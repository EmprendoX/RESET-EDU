import { FileWarning, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
  fallbackUrl?: string;
  className?: string;
}

export function FileErrorState({
  title = 'No pudimos cargar el archivo',
  description = 'El archivo puede no estar disponible temporalmente.',
  onRetry,
  fallbackUrl,
  className,
}: Props) {
  return (
    <div
      role="alert"
      className={cn(
        'flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <FileWarning className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="text-balance max-w-prose text-sm text-slate-500">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Reintentar
          </button>
        ) : null}
        {fallbackUrl ? (
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-600 shadow-sm transition hover:bg-brand-50"
          >
            Abrir en nueva pestaña
          </a>
        ) : null}
      </div>
    </div>
  );
}
