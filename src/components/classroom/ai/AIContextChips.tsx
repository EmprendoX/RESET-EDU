import {
  BookOpen,
  Briefcase,
  FileText,
  Hash,
  Sparkles,
} from 'lucide-react';
import type { Course } from '@/types/course';
import type { Lesson } from '@/types/lesson';
import type { StudentBusinessProfile } from '@/types/business';
import type { MentorMode } from '@/types/ai';
import { Badge } from '@/components/ui/Badge';
import { detectFileType } from '@/lib/files/fileType';

interface Props {
  course?: Course | null;
  lesson?: Lesson | null;
  business?: StudentBusinessProfile | null;
  mode: MentorMode;
}

const MODE_LABEL: Record<MentorMode, string> = {
  class: 'Clase',
  qna: 'Preguntas',
  business_application: 'Aplicación al negocio',
  summary: 'Resumen',
  action_plan: 'Plan de acción',
  exercise: 'Ejercicio',
  evaluation: 'Evaluación',
};

export function AIContextChips({ course, lesson, business, mode }: Props) {
  const fileType = lesson
    ? detectFileType({
        fileType: lesson.file_type,
        videoUrl: lesson.video_url,
        pdfUrl: lesson.pdf_url,
        fileUrl: lesson.file_url,
        contentText: lesson.content_text,
      })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {course ? (
        <Badge tone="brand">
          <BookOpen className="h-3 w-3" aria-hidden />
          {course.title}
        </Badge>
      ) : null}
      {lesson ? (
        <Badge tone="neutral">
          <Hash className="h-3 w-3" aria-hidden />
          {lesson.title}
        </Badge>
      ) : null}
      {fileType && fileType !== 'text' ? (
        <Badge tone="neutral">
          <FileText className="h-3 w-3" aria-hidden />
          {fileType.toUpperCase()}
        </Badge>
      ) : null}
      {business ? (
        <Badge tone="success">
          <Briefcase className="h-3 w-3" aria-hidden />
          {business.business_name}
        </Badge>
      ) : null}
      <Badge tone="ai">
        <Sparkles className="h-3 w-3" aria-hidden />
        Modo: {MODE_LABEL[mode]}
      </Badge>
    </div>
  );
}
