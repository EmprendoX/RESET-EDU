import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { Lesson } from '@/types/lesson';

interface Props {
  courseSlug: string;
  nextLesson: Lesson | null;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'outline';
  hideLabelOnMobile?: boolean;
}

export function NextLessonButton({
  courseSlug,
  nextLesson,
  size = 'md',
  variant = 'primary',
  hideLabelOnMobile,
}: Props) {
  if (!nextLesson) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        rightIcon={<ChevronRight className="h-4 w-4" />}
      >
        <span className={hideLabelOnMobile ? 'hidden md:inline' : undefined}>
          Última lección
        </span>
      </Button>
    );
  }
  return (
    <Link
      to={`/aprender/${courseSlug}/${nextLesson.id}`}
      aria-label={`Ir a siguiente lección: ${nextLesson.title}`}
      className="inline-flex"
    >
      <Button
        variant={variant}
        size={size}
        rightIcon={<ChevronRight className="h-4 w-4" />}
      >
        <span className={hideLabelOnMobile ? 'hidden md:inline' : undefined}>
          Siguiente
        </span>
      </Button>
    </Link>
  );
}
