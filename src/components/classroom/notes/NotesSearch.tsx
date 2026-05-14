import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function NotesSearch({
  value,
  onChange,
  placeholder = 'Buscar en mis notas',
  className,
}: Props) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-reset-text-dim"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar notas"
        className="focus-ring w-full rounded-lg border border-reset-border bg-reset-bg-3 py-2 pl-8 pr-8 text-sm text-white placeholder:text-reset-text-dim"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="focus-ring absolute right-1 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-reset-text-dim hover:bg-reset-bg-2"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
