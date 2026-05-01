import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import type { AIMessage } from '@/types/ai';
import type { CreateNoteInput } from '@/types/notes';
import { AIMessageBubble } from './AIMessageBubble';
import { AITypingIndicator } from './AITypingIndicator';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

interface Props {
  messages: AIMessage[];
  isStreaming: boolean;
  isLoading: boolean;
  courseId: string | undefined;
  lessonId?: string;
  onSaveAsNote: (input: CreateNoteInput) => Promise<unknown>;
  onRegenerate?: (message: AIMessage) => void;
}

export function AIChatWindow({
  messages,
  isStreaming,
  isLoading,
  courseId,
  lessonId,
  onSaveAsNote,
  onRegenerate,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto bg-slate-50"
    >
      {isLoading ? (
        <LoadingSkeleton variant="chat" />
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center p-4">
          <EmptyState
            icon={Sparkles}
            title="Empieza a conversar con tu mentor"
            description="Usa los botones rápidos arriba o escribe tu pregunta."
            compact
          />
        </div>
      ) : (
        messages.map((m) => (
          <AIMessageBubble
            key={m.id}
            message={m}
            courseId={courseId}
            lessonId={lessonId}
            onSaveAsNote={onSaveAsNote}
            onRegenerate={onRegenerate ? () => onRegenerate(m) : undefined}
          />
        ))
      )}
      {isStreaming ? (
        <div className="px-3 pb-2">
          <AITypingIndicator />
        </div>
      ) : null}
    </div>
  );
}
