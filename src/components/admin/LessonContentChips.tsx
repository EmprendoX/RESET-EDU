import {
  AlignLeft,
  Bot,
  File,
  FileText,
  Link2,
  Video,
} from 'lucide-react';
import type { Lesson } from '@/types/lesson';
import { cn } from '@/lib/utils/cn';
import { AdminFileTypeBadge } from '@/components/admin/AdminFileTypeBadge';

function chipClass() {
  return cn(
    'inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600',
  );
}

function MiniChip({
  icon: Icon,
  label,
}: {
  icon: typeof Video;
  label: string;
}) {
  return (
    <span className={chipClass()} title={label}>
      <Icon className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
      {label}
    </span>
  );
}

function hasText(value?: string) {
  return Boolean(value?.trim());
}

interface Props {
  lesson: Lesson;
  className?: string;
}

export function LessonContentChips({ lesson, className }: Props) {
  const showVideo = hasText(lesson.video_url);
  const showPdf = hasText(lesson.pdf_url);
  const showFile = hasText(lesson.file_url);
  const showText = hasText(lesson.content_text);
  const showAi = hasText(lesson.ai_context);

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      <AdminFileTypeBadge type={lesson.file_type} />
      {showVideo ? <MiniChip icon={Video} label="Vídeo" /> : null}
      {showPdf ? <MiniChip icon={FileText} label="PDF" /> : null}
      {showFile ? <MiniChip icon={File} label="Archivo" /> : null}
      {showText ? <MiniChip icon={AlignLeft} label="Texto" /> : null}
      {showAi ? <MiniChip icon={Bot} label="IA" /> : null}
      {!showVideo && !showPdf && !showFile && !showText ? (
        <span className={chipClass()}>
          <Link2 className="h-3 w-3 text-slate-300" aria-hidden />
          Sin URLs
        </span>
      ) : null}
    </div>
  );
}
