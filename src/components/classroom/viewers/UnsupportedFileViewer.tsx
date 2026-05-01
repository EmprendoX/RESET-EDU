import { FileQuestion } from 'lucide-react';
import type { Lesson } from '@/types/lesson';
import { Button } from '@/components/ui/Button';

interface Props {
  lesson: Lesson;
}

export function UnsupportedFileViewer({ lesson }: Props) {
  const url = lesson.file_url ?? lesson.pdf_url ?? lesson.video_url;
  return (
    <div
      role="alert"
      className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <FileQuestion className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-800">
          No podemos mostrar este archivo en el Aula
        </h3>
        <p className="text-balance max-w-prose text-sm text-slate-500">
          El formato no es soportado en esta versión. Si eres el instructor,
          sube una versión en PDF o usa una URL de video.
        </p>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="pt-1"
        >
          <Button variant="outline">Abrir el archivo original</Button>
        </a>
      ) : null}
    </div>
  );
}
