import { Film } from 'lucide-react';
import type { Lesson } from '@/types/lesson';
import { FileErrorState } from '@/components/common/FileErrorState';
import { cn } from '@/lib/utils/cn';

interface Props {
  lesson: Lesson;
  embedded?: boolean;
}

export function VideoLessonPlayer({ lesson, embedded }: Props) {
  const url = lesson.video_url;
  if (!url) {
    return (
      <FileErrorState
        title="Video no disponible"
        description="Esta lección no tiene un video configurado."
      />
    );
  }

  const embedUrl = toEmbedUrl(url);
  if (!embedUrl) {
    return (
      <FileErrorState
        title="Video no soportado"
        description="No reconocemos el proveedor del video. Ábrelo en la fuente original."
        fallbackUrl={url}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col bg-slate-900',
        embedded ? 'rounded-2xl border border-slate-200 bg-slate-900' : '',
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-200">
        <Film className="h-3.5 w-3.5 text-slate-300" aria-hidden />
        <span className="font-medium">{lesson.title}</span>
      </div>
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        <iframe
          title={`Video de la lección: ${lesson.title}`}
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      {lesson.description ? (
        <div className="bg-slate-900 px-4 py-3 text-sm text-slate-200">
          {lesson.description}
        </div>
      ) : null}
    </div>
  );
}

function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const path = u.pathname;
      if (path.startsWith('/embed/')) {
        const cleanHost = host.endsWith('youtube-nocookie.com')
          ? host
          : 'www.youtube-nocookie.com';
        return `https://${cleanHost}${path}${u.search}`;
      }
      const id = u.searchParams.get('v');
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === 'vimeo.com' || host.endsWith('vimeo.com')) {
      if (host === 'player.vimeo.com') return raw;
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (
      host.endsWith('mediadelivery.net') ||
      host.endsWith('cloudflarestream.com') ||
      host.endsWith('videodelivery.net')
    ) {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}
