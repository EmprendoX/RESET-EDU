import { lazy, Suspense } from 'react';
import type { Lesson } from '@/types/lesson';
import { detectFileType } from '@/lib/files/fileType';
import { FileLoadingState } from '@/components/common/FileLoadingState';
import { FileErrorState } from '@/components/common/FileErrorState';
import { TextLessonViewer } from './TextLessonViewer';
import { VideoLessonPlayer } from './VideoLessonPlayer';
import { UnsupportedFileViewer } from './UnsupportedFileViewer';

const PdfViewer = lazy(() =>
  import('./PdfViewer').then((m) => ({ default: m.PdfViewer })),
);
const PowerPointViewer = lazy(() =>
  import('./PowerPointViewer').then((m) => ({ default: m.PowerPointViewer })),
);

interface Props {
  lesson: Lesson | null | undefined;
  loading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function FileViewer({ lesson, loading, isError, onRetry }: Props) {
  if (loading) {
    return <FileLoadingState label="Cargando lección…" />;
  }
  if (isError || !lesson) {
    return (
      <FileErrorState
        title="Lección no disponible"
        description="No pudimos cargar esta lección. Intenta de nuevo o vuelve al temario."
        onRetry={onRetry}
      />
    );
  }

  const fileType = detectFileType({
    fileType: lesson.file_type,
    videoUrl: lesson.video_url,
    pdfUrl: lesson.pdf_url,
    fileUrl: lesson.file_url,
    contentText: lesson.content_text,
  });

  const hasText = Boolean(lesson.content_text?.trim());
  const hasPdf = Boolean(lesson.pdf_url || lesson.file_url);
  const hasVideo = Boolean(lesson.video_url);

  if (lesson.file_type === 'mixed' || fileType === 'mixed') {
    return (
      <div className="scrollbar-thin flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 md:p-6">
        {hasText ? <TextLessonViewer lesson={lesson} embedded /> : null}
        {hasVideo ? <VideoLessonPlayer lesson={lesson} embedded /> : null}
        {hasPdf ? (
          <Suspense fallback={<FileLoadingState label="Cargando PDF…" />}>
            <PdfViewer lesson={lesson} embedded />
          </Suspense>
        ) : null}
        {!hasText && !hasPdf && !hasVideo ? (
          <UnsupportedFileViewer lesson={lesson} />
        ) : null}
      </div>
    );
  }

  switch (fileType) {
    case 'pdf':
      return (
        <Suspense fallback={<FileLoadingState label="Cargando PDF…" />}>
          <PdfViewer lesson={lesson} />
        </Suspense>
      );
    case 'video':
      return <VideoLessonPlayer lesson={lesson} />;
    case 'pptx':
      return (
        <Suspense fallback={<FileLoadingState label="Cargando presentación…" />}>
          <PowerPointViewer lesson={lesson} />
        </Suspense>
      );
    case 'text':
      return <TextLessonViewer lesson={lesson} />;
    default:
      return <UnsupportedFileViewer lesson={lesson} />;
  }
}
