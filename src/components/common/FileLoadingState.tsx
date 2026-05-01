import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  label?: string;
  className?: string;
}

export function FileLoadingState({
  label = 'Cargando contenido…',
  className,
}: Props) {
  return (
    <div
      role="status"
      className={cn(
        'flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500',
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}
