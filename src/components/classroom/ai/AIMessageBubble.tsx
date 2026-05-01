import { Bookmark, BookmarkCheck, Copy, RefreshCw, Sparkles, User2 } from 'lucide-react';
import { useState } from 'react';
import type { AIMessage } from '@/types/ai';
import type { CreateNoteInput } from '@/types/notes';
import { cn } from '@/lib/utils/cn';
import { truncate } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';

interface Props {
  message: AIMessage;
  courseId: string | undefined;
  lessonId?: string;
  onSaveAsNote: (input: CreateNoteInput) => Promise<unknown>;
  onRegenerate?: () => void;
}

export function AIMessageBubble({
  message,
  courseId,
  lessonId,
  onSaveAsNote,
  onRegenerate,
}: Props) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [savedAsNote, setSavedAsNote] = useState(false);
  const [savePending, setSavePending] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function handleSaveAsNote() {
    if (!courseId) return;
    try {
      setSavePending(true);
      const suggestedTitle =
        (message.metadata?.suggestedNoteTitle as string | undefined) ??
        truncate(message.content, 60);
      const input: CreateNoteInput = {
        course_id: courseId,
        lesson_id: lessonId,
        title: suggestedTitle,
        content: message.content,
        source: 'ai',
        tags: ['ia'],
      };
      await onSaveAsNote(input);
      setSavedAsNote(true);
    } finally {
      setSavePending(false);
    }
  }

  return (
    <div
      className={cn(
        'flex gap-2 px-3 py-2',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      {isAssistant ? (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ai-100 text-ai-600">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
        </div>
      ) : null}

      <div
        className={cn(
          'group flex max-w-[88%] flex-col gap-1.5',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-brand-600 text-white'
              : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800',
          )}
        >
          <RichTextRenderer content={message.content} />
        </div>
        {isAssistant ? (
          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              leftIcon={
                <Copy
                  className={cn(
                    'h-3.5 w-3.5',
                    copied ? 'text-emerald-600' : 'text-slate-400',
                  )}
                />
              }
            >
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSaveAsNote}
              loading={savePending}
              disabled={savedAsNote}
              leftIcon={
                savedAsNote ? (
                  <BookmarkCheck
                    className="h-3.5 w-3.5 text-emerald-600"
                    aria-hidden
                  />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" aria-hidden />
                )
              }
            >
              {savedAsNote ? 'Guardada' : 'Guardar'}
            </Button>
            {onRegenerate ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRegenerate}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" aria-hidden />}
              >
                Regenerar
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isUser ? (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <User2 className="h-3.5 w-3.5" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}

function RichTextRenderer({ content }: { content: string }) {
  const blocks = content.split('\n\n');
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block.trim()} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: string }) {
  if (!block) return null;
  if (/^\d+\.\s/.test(block)) {
    const items = block.split('\n').map((l) => l.replace(/^\d+\.\s/, ''));
    return (
      <ol className="list-decimal space-y-1 pl-5">
        {items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ol>
    );
  }
  if (block.startsWith('- ')) {
    const items = block.split('\n').map((l) => l.replace(/^-\s/, ''));
    return (
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }
  return <p>{renderInline(block)}</p>;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
