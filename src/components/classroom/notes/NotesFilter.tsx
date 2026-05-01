import { Pin, Sparkles, TextSelect, NotebookPen } from 'lucide-react';
import type { NoteSource } from '@/types/notes';
import { cn } from '@/lib/utils/cn';

export type NotesFilterValue =
  | 'all'
  | 'pinned'
  | NoteSource;

interface Props {
  value: NotesFilterValue;
  onChange: (value: NotesFilterValue) => void;
  className?: string;
}

const FILTERS: Array<{
  id: NotesFilterValue;
  label: string;
  Icon?: typeof Pin;
}> = [
  { id: 'all', label: 'Todas' },
  { id: 'pinned', label: 'Fijadas', Icon: Pin },
  { id: 'manual', label: 'Manuales', Icon: NotebookPen },
  { id: 'selection', label: 'Selección', Icon: TextSelect },
  { id: 'ai', label: 'IA', Icon: Sparkles },
];

export function NotesFilter({ value, onChange, className }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filtros de notas"
      className={cn(
        'scrollbar-thin flex gap-1.5 overflow-x-auto pb-1',
        className,
      )}
    >
      {FILTERS.map(({ id, label, Icon }) => {
        const isActive = id === value;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={cn(
              'focus-ring inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition',
              isActive
                ? 'border-brand-300 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {Icon ? <Icon className="h-3 w-3" aria-hidden /> : null}
            {label}
          </button>
        );
      })}
    </div>
  );
}
