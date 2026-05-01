import {
  Pin,
  PinOff,
  Sparkles,
  Trash2,
  TextSelect,
  NotebookPen,
} from 'lucide-react';
import type { Note, NoteSource } from '@/types/notes';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { truncate } from '@/lib/utils/format';
import { timeAgo } from '@/lib/utils/time';

interface Props {
  note: Note;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onRemove: () => void;
}

const SOURCE_META: Record<
  NoteSource,
  { label: string; tone: 'note' | 'ai' | 'brand'; Icon: typeof NotebookPen }
> = {
  manual: { label: 'Manual', tone: 'note', Icon: NotebookPen },
  ai: { label: 'IA', tone: 'ai', Icon: Sparkles },
  selection: { label: 'Selección', tone: 'brand', Icon: TextSelect },
};

export function NoteCard({
  note,
  isActive,
  onSelect,
  onTogglePin,
  onRemove,
}: Props) {
  const meta = SOURCE_META[note.source];
  return (
    <article
      className={cn(
        'group relative flex flex-col gap-1.5 rounded-xl border p-3 text-left transition',
        isActive
          ? 'border-brand-300 bg-brand-50/50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="focus-ring absolute inset-0 rounded-xl"
        aria-label={`Abrir nota: ${note.title}`}
      />
      <header className="relative flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {note.title || 'Sin título'}
        </h4>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onTogglePin}
            aria-label={note.is_pinned ? 'Quitar pin' : 'Fijar nota'}
            className={cn(
              'focus-ring relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-md transition',
              note.is_pinned
                ? 'text-note-600 hover:bg-note-100'
                : 'text-slate-400 opacity-0 hover:bg-slate-100 group-hover:opacity-100',
            )}
          >
            {note.is_pinned ? (
              <Pin className="h-4 w-4 fill-current" aria-hidden />
            ) : (
              <PinOff className="h-4 w-4" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Eliminar nota"
            className="focus-ring relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 opacity-0 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>
      <p className="relative line-clamp-2 text-xs text-slate-600">
        {truncate(note.content.replace(/\n/g, ' ').trim(), 160)}
      </p>
      <footer className="relative mt-1 flex flex-wrap items-center gap-1.5">
        <Badge tone={meta.tone}>
          <meta.Icon className="h-3 w-3" aria-hidden />
          {meta.label}
        </Badge>
        {note.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} tone="neutral">
            #{tag}
          </Badge>
        ))}
        <span className="ml-auto text-[11px] text-slate-400">
          {timeAgo(note.updated_at)}
        </span>
      </footer>
    </article>
  );
}
