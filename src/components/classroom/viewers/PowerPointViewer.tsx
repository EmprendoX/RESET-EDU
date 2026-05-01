import type { Lesson } from '@/types/lesson';
import { PdfViewer } from './PdfViewer';
import { UnsupportedFileViewer } from './UnsupportedFileViewer';

interface Props {
  lesson: Lesson;
  embedded?: boolean;
}

/**
 * MVP policy: PPT/PPTX is accepted but expected to be uploaded as PDF.
 * If the lesson has a `pdf_url` we delegate to PdfViewer. Otherwise we fall
 * back to UnsupportedFileViewer with guidance for the admin.
 */
export function PowerPointViewer({ lesson, embedded }: Props) {
  if (lesson.pdf_url || isPdfUrl(lesson.file_url)) {
    return <PdfViewer lesson={lesson} embedded={embedded} />;
  }
  return <UnsupportedFileViewer lesson={lesson} />;
}

function isPdfUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.pathname.toLowerCase().endsWith('.pdf');
  } catch {
    return false;
  }
}
