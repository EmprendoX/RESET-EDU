import type { Lesson } from '@/types/lesson';
import type { LessonFormValues } from '@/types/admin';

export function lessonToFormValues(lesson: Lesson): LessonFormValues {
  return {
    title: lesson.title,
    description: lesson.description,
    content_text: lesson.content_text ?? '',
    ai_context: lesson.ai_context ?? '',
    video_url: lesson.video_url ?? '',
    pdf_url: lesson.pdf_url ?? '',
    file_url: lesson.file_url ?? '',
    file_type: lesson.file_type,
    duration_minutes: lesson.duration_minutes,
    order_index: lesson.order_index,
    is_preview: lesson.is_preview,
    status: lesson.status,
  };
}
