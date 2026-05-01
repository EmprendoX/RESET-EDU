import { useEffect, useMemo, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import type { Note } from '@/types/notes';
import { useNotes } from '@/hooks/useNotes';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { NotesSearch } from './NotesSearch';
import { NotesFilter, type NotesFilterValue } from './NotesFilter';
import { QuickNoteButton } from './QuickNoteButton';
import { useAuth } from '@/hooks/useAuth';
import { nowIso, uid } from '@/lib/utils/time';

interface Props {
  courseId: string | undefined;
  lessonId: string | undefined;
}

export function NotesPanel({ courseId, lessonId }: Props) {
  const {
    notes,
    isLoading,
    isError,
    refetch,
    createNote,
    updateNote,
    removeNote,
    togglePin,
  } = useNotes({ courseId, lessonId });

  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<NotesFilterValue>('all');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Auto-select the most recent note when notes load.
  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
    if (activeNoteId && !notes.some((n) => n.id === activeNoteId)) {
      setActiveNoteId(notes[0]?.id ?? null);
    }
  }, [notes, activeNoteId]);

  const visibleNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notes.filter((note) => {
      if (filter === 'pinned' && !note.is_pinned) return false;
      if (
        (filter === 'manual' || filter === 'ai' || filter === 'selection') &&
        note.source !== filter
      ) {
        return false;
      }
      if (!term) return true;
      return (
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term) ||
        note.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [notes, search, filter]);

  const activeNote = activeNoteId
    ? (notes.find((n) => n.id === activeNoteId) ?? null)
    : null;

  async function handleCreate() {
    if (!courseId) return;
    const draft: Note = {
      id: uid('note'),
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      title: 'Nueva nota',
      content: '',
      tags: [],
      is_pinned: false,
      source: 'manual',
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    const created = await createNote({
      course_id: draft.course_id,
      lesson_id: draft.lesson_id,
      title: draft.title,
      content: draft.content,
      source: 'manual',
      tags: [],
    });
    setActiveNoteId(created.id);
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-3 p-3">
        <LoadingSkeleton variant="list" rows={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="No pudimos cargar tus notas"
        description="Hubo un problema leyendo tus notas. Intenta de nuevo."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <p className="text-sm font-semibold text-slate-800">
          Mis notas
          <span className="ml-1 text-xs font-normal text-slate-400">
            · {notes.length}
          </span>
        </p>
        <QuickNoteButton onClick={handleCreate} disabled={!courseId} />
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-b border-slate-100 bg-white px-3 py-2">
        <NotesSearch value={search} onChange={setSearch} />
        <NotesFilter value={filter} onChange={setFilter} />
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,40%)_1fr] divide-y divide-slate-100">
        <div className="scrollbar-thin flex flex-col gap-2 overflow-y-auto bg-slate-50 p-2">
          {visibleNotes.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="Sin notas todavía"
              description={
                notes.length === 0
                  ? 'Selecciona texto en la lección para guardarlo como nota, o crea una nueva.'
                  : 'No hay notas que coincidan con tu búsqueda.'
              }
              compact
            />
          ) : (
            visibleNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                onSelect={() => setActiveNoteId(note.id)}
                onTogglePin={() => void togglePin(note.id)}
                onRemove={() => void removeNote(note.id)}
              />
            ))
          )}
        </div>

        <div className="bg-white">
          {activeNote ? (
            <NoteEditor
              key={activeNote.id}
              note={activeNote}
              onUpdate={async (input) => {
                await updateNote({
                  id: input.id,
                  title: input.title,
                  content: input.content,
                  tags: input.tags,
                });
              }}
              onTogglePin={() => void togglePin(activeNote.id)}
              onRemove={() => {
                void removeNote(activeNote.id);
                setActiveNoteId(null);
              }}
              onClose={() => setActiveNoteId(null)}
            />
          ) : (
            <EmptyState
              icon={NotebookPen}
              title="Selecciona una nota para editar"
              description="O crea una nueva con el botón de arriba."
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
}
