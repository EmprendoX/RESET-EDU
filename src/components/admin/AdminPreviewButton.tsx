import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';

interface Props {
  courseSlug: string;
}

export function AdminPreviewButton({ courseSlug }: Props) {
  return (
    <Link
      to={`/aprender/${courseSlug}`}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:bg-slate-100',
      )}
    >
      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
      Vista alumno
    </Link>
  );
}
