import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Pin, Save, Tag, Trash2, X } from 'lucide-react';
import type { Note, NoteSource } from '@/types/notes';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAutosave } from '@/hooks/useAutosave';
import { cn } from '@/lib/utils/cn';

interface Props {
  note: Note;
  onUpdate: (input: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    is_pinned?: boolean;
  }) => Promise<void> | void;
  onTogglePin: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export function NoteEditor({
  note,
  onUpdate,
  onTogglePin,
  onRemove,
  onClose,
}: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
  }, [note.id, note.title, note.content, note.tags]);

  const draft = useMemo(
    () => ({ title, content, tags }),
    [title, content, tags],
  );

  const { status } = useAutosave({
    value: draft,
    onSave: async (value) => {
      await onUpdate({
        id: note.id,
        title: value.title,
        content: value.content,
        tags: value.tags,
      });
    },
    delay: 700,
  });

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    if (tags.includes(t)) return setTagInput('');
    setTags((prev) => [...prev, t]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-reset-border bg-reset-bg-1 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-reset-text-muted">
          <SourceBadge source={note.source} />
          <span aria-live="polite">
            <SaveStatus status={status} />
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onTogglePin}
            aria-label={note.is_pinned ? 'Quitar pin' : 'Fijar nota'}
          >
            <Pin
              className={cn(
                'h-4 w-4',
                note.is_pinned ? 'fill-current text-note-300' : 'text-reset-text-dim',
              )}
              aria-hidden
            />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            aria-label="Eliminar nota"
          >
            <Trash2 className="h-4 w-4 text-rose-400" aria-hidden />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Cerrar editor"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la nota"
          aria-label="Título"
          className="focus-ring rounded-lg border border-transparent bg-transparent px-2 py-1.5 font-display text-base font-semibold text-white placeholder:text-reset-text-dim hover:bg-reset-bg-2 focus:border-reset-border focus:bg-reset-bg-2"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu nota… Puedes pegar texto seleccionado del PDF, lección o IA."
          aria-label="Contenido"
          className="focus-ring scrollbar-thin min-h-[180px] flex-1 resize-none rounded-lg border border-reset-border bg-reset-bg-2 p-3 text-sm leading-relaxed text-white placeholder:text-reset-text-dim"
        />

        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Quitar tag ${tag}`}
                className="focus-ring -mr-0.5 ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-reset-bg-3"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </Badge>
          ))}
          <div className="inline-flex items-center gap-1 rounded-full border border-dashed border-reset-border-strong px-2 py-0.5">
            <Tag className="h-3 w-3 text-reset-text-dim" aria-hidden />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Agregar tag"
              aria-label="Agregar tag"
              className="w-24 bg-transparent text-xs text-white placeholder:text-reset-text-dim focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveStatus({ status }: { status: ReturnType<typeof useAutosave>['status'] }) {
  switch (status) {
    case 'saving':
      return (
        <span className="inline-flex items-center gap-1 text-reset-text-muted">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          Guardando…
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 text-reset-text-muted">
          <Save className="h-3 w-3" aria-hidden />
          Cambios sin guardar
        </span>
      );
    case 'saved':
      return (
        <span className="inline-flex items-center gap-1 text-emerald-300">
          <Check className="h-3 w-3" aria-hidden />
          Guardado
        </span>
      );
    case 'error':
      return <span className="text-rose-400">Error al guardar</span>;
    default:
      return <span className="text-reset-text-dim">Listo</span>;
  }
}

function SourceBadge({ source }: { source: NoteSource }) {
  const tone =
    source === 'ai' ? 'ai' : source === 'selection' ? 'brand' : 'note';
  const label =
    source === 'ai' ? 'IA' : source === 'selection' ? 'Selección' : 'Manual';
  return <Badge tone={tone}>{label}</Badge>;
}
