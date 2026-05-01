import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function UnauthorizedState({
  title = 'No tienes acceso',
  description = 'Inicia sesión o solicita acceso para continuar.',
  action,
  className,
}: Props) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-8 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Lock className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="text-balance max-w-prose text-sm text-slate-500">
          {description}
        </p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
