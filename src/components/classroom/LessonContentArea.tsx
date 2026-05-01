import type { Lesson } from '@/types/lesson';
import { cn } from '@/lib/utils/cn';

interface Props {
  lesson: Lesson | null | undefined;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LessonContentArea({
  lesson,
  loading,
  className,
  children,
}: Props) {
  return (
    <section
      id="tabpanel-content"
      role="tabpanel"
      aria-labelledby="tab-content"
      aria-busy={loading}
      data-lesson-id={lesson?.id}
      className={cn(
        'relative flex h-full min-h-0 flex-col overflow-hidden bg-slate-50',
        className,
      )}
    >
      {children}
    </section>
  );
}
