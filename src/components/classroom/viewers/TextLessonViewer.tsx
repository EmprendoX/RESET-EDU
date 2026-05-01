import type { Lesson } from '@/types/lesson';
import { cn } from '@/lib/utils/cn';

interface Props {
  lesson: Lesson;
  embedded?: boolean;
}

export function TextLessonViewer({ lesson, embedded }: Props) {
  return (
    <div
      className={cn(
        'h-full min-h-0 overflow-hidden bg-slate-50',
        embedded ? '' : 'flex flex-col',
      )}
    >
      <div
        className={cn(
          'mx-auto flex h-full w-full max-w-3xl flex-col gap-3 px-4 py-6 md:px-8 md:py-10',
          embedded ? '' : 'scrollbar-thin overflow-y-auto',
        )}
      >
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Lección · Texto
          </p>
          <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {lesson.title}
          </h2>
          {lesson.description ? (
            <p className="text-balance text-sm text-slate-600 md:text-base">
              {lesson.description}
            </p>
          ) : null}
        </div>

        <article
          data-selectable
          data-source-type="text"
          data-lesson-id={lesson.id}
          className="prose-classroom mt-4 leading-relaxed text-slate-800"
        >
          {(lesson.content_text ?? '').split('\n\n').map((block, idx) => (
            <BlockRenderer key={idx} block={block.trim()} />
          ))}
        </article>
      </div>
    </div>
  );
}

function BlockRenderer({ block }: { block: string }) {
  if (!block) return null;
  if (block.startsWith('## ')) {
    return (
      <h3 className="mt-8 text-xl font-semibold tracking-tight text-slate-900">
        {block.slice(3)}
      </h3>
    );
  }
  if (block.startsWith('### ')) {
    return (
      <h4 className="mt-6 text-base font-semibold text-slate-900">
        {block.slice(4)}
      </h4>
    );
  }
  if (block.startsWith('> ')) {
    return (
      <blockquote className="mt-4 border-l-4 border-brand-300 bg-brand-50/60 px-4 py-2 text-slate-700">
        {block.slice(2)}
      </blockquote>
    );
  }
  if (/^\d+\.\s/.test(block)) {
    const items = block.split('\n').map((l) => l.replace(/^\d+\.\s/, ''));
    return (
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-slate-800">
        {items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ol>
    );
  }
  if (block.startsWith('- ')) {
    const items = block.split('\n').map((l) => l.replace(/^-\s/, ''));
    return (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-800">
        {items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }
  return <p className="mt-3 text-base text-slate-800">{renderInline(block)}</p>;
}

function renderInline(text: string): React.ReactNode {
  // Very small subset: **bold** only.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-slate-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
