import { useEffect, useState } from 'react';
import { Copy, NotebookPen, Sparkles, FileText, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useClassroomStore } from '@/stores/useClassroomStore';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { CreateNoteInput } from '@/types/notes';
import type { MentorMode } from '@/types/ai';
import { truncate } from '@/lib/utils/format';

interface Props {
  courseId: string | undefined;
  lessonId: string | undefined;
  onSaveAsNote: (input: CreateNoteInput) => Promise<void> | void;
  onAskAI: (params: {
    selectedText: string;
    mode: MentorMode;
    initialPrompt: string;
  }) => void;
}

const MENU_WIDTH = 280;
const MENU_HEIGHT = 240;

export function SelectedTextActionMenu({
  courseId,
  lessonId,
  onSaveAsNote,
  onAskAI,
}: Props) {
  const selected = useClassroomStore((s) => s.selectedText);
  const clearSelectedText = useClassroomStore((s) => s.clearSelectedText);
  const { isMobile } = useResponsiveLayout();
  const [busy, setBusy] = useState<null | string>(null);

  useEffect(() => {
    setBusy(null);
  }, [selected?.text]);

  if (!selected || isMobile) return null;

  const top = Math.max(
    8,
    Math.min(
      window.innerHeight - MENU_HEIGHT - 8,
      selected.rect.top + selected.rect.height + 8,
    ),
  );
  const left = Math.max(
    8,
    Math.min(
      window.innerWidth - MENU_WIDTH - 8,
      selected.rect.left + selected.rect.width / 2 - MENU_WIDTH / 2,
    ),
  );

  async function handleCopy() {
    if (!selected) return;
    try {
      setBusy('copy');
      await navigator.clipboard.writeText(selected.text);
    } catch {
      // ignore in demo
    } finally {
      setBusy(null);
      clearSelectedText();
    }
  }

  async function handleSave() {
    if (!selected || !courseId) return;
    try {
      setBusy('save');
      await onSaveAsNote({
        course_id: courseId,
        lesson_id: lessonId,
        title: truncate(`Selección · ${selected.text}`, 80),
        content: selected.text,
        source: 'selection',
        tags: ['selección'],
        selection_meta: selected.sourceMeta,
      });
    } finally {
      setBusy(null);
      clearSelectedText();
    }
  }

  function handleAskAI(mode: MentorMode, label: string) {
    if (!selected) return;
    onAskAI({
      selectedText: selected.text,
      mode,
      initialPrompt: `${label}:\n"${truncate(selected.text, 600)}"`,
    });
    clearSelectedText();
  }

  return (
    <div
      role="menu"
      aria-label="Acciones de selección"
      style={{ top, left, width: MENU_WIDTH }}
      className="fixed z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
    >
      <div className="border-b border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px] uppercase tracking-wide text-slate-500">
        Selección · {selected.sourceType === 'pdf' ? 'PDF' : 'Texto'}
      </div>
      <div className="flex flex-col p-1.5">
        <ActionItem
          onClick={handleCopy}
          loading={busy === 'copy'}
          icon={<Copy className="h-4 w-4" />}
          label="Copiar"
        />
        <ActionItem
          onClick={handleSave}
          loading={busy === 'save'}
          icon={<NotebookPen className="h-4 w-4 text-note-600" />}
          label="Guardar como nota"
        />
        <div className="my-1 h-px bg-slate-100" />
        <ActionItem
          onClick={() => handleAskAI('qna', 'Pregunta sobre este texto')}
          icon={<Sparkles className="h-4 w-4 text-ai-600" />}
          label="Preguntar a la IA"
        />
        <ActionItem
          onClick={() => handleAskAI('summary', 'Resume este texto')}
          icon={<FileText className="h-4 w-4 text-ai-600" />}
          label="Resumir"
        />
        <ActionItem
          onClick={() =>
            handleAskAI(
              'business_application',
              'Aplica este texto a mi negocio',
            )
          }
          icon={<Briefcase className="h-4 w-4 text-ai-600" />}
          label="Aplicar a mi negocio"
        />
      </div>
    </div>
  );
}

function ActionItem({
  icon,
  label,
  onClick,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onMouseDown={(e) => {
        // Prevent the selection from collapsing before our handler reads it.
        e.preventDefault();
      }}
      onClick={onClick}
      disabled={loading}
      className={cn(
        'focus-ring flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-60',
      )}
    >
      <span className="text-slate-500">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
