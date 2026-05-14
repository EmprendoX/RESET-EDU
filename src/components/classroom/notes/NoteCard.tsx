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
          ? 'border-brand-500/40 bg-brand-500/10 shadow-lg'
          : 'border-reset-border bg-reset-bg-2 hover:border-reset-border-strong',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="focus-ring absolute inset-0 rounded-xl"
        aria-label={`Abrir nota: ${note.title}`}
      />
      <header className="relative flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
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
                ? 'text-note-300 hover:bg-note-500/20'
                : 'text-reset-text-dim opacity-0 hover:bg-reset-bg-3 group-hover:opacity-100',
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
            className="focus-ring relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-md text-reset-text-dim opacity-0 hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>
      <p className="relative line-clamp-2 text-xs text-reset-text-muted">
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
        <span className="ml-auto text-[11px] text-reset-text-dim">
          {timeAgo(note.updated_at)}
        </span>
      </footer>
    </article>
  );
}
