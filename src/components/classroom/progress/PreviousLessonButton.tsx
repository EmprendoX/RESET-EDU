import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { Lesson } from '@/types/lesson';

interface Props {
  courseSlug: string;
  previousLesson: Lesson | null;
  size?: 'sm' | 'md';
  variant?: 'outline' | 'ghost';
  hideLabelOnMobile?: boolean;
}

export function PreviousLessonButton({
  courseSlug,
  previousLesson,
  size = 'md',
  variant = 'outline',
  hideLabelOnMobile,
}: Props) {
  if (!previousLesson) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        leftIcon={<ChevronLeft className="h-4 w-4" />}
      >
        <span className={hideLabelOnMobile ? 'hidden md:inline' : undefined}>
          Anterior
        </span>
      </Button>
    );
  }
  return (
    <Link
      to={`/aprender/${courseSlug}/${previousLesson.id}`}
      aria-label={`Ir a lección anterior: ${previousLesson.title}`}
      className="inline-flex"
    >
      <Button
        variant={variant}
        size={size}
        leftIcon={<ChevronLeft className="h-4 w-4" />}
      >
        <span className={hideLabelOnMobile ? 'hidden md:inline' : undefined}>
          Anterior
        </span>
      </Button>
    </Link>
  );
}
