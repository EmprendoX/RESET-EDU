import type { Lesson } from '@/types/lesson';
import { CompleteLessonButton } from './CompleteLessonButton';
import { NextLessonButton } from './NextLessonButton';
import { PreviousLessonButton } from './PreviousLessonButton';

interface Props {
  courseSlug: string;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  isCompleted: boolean;
  isCompleting?: boolean;
  onComplete: () => void;
  hideLabelOnMobile?: boolean;
  size?: 'sm' | 'md';
}

export function LessonNavigation({
  courseSlug,
  previousLesson,
  nextLesson,
  isCompleted,
  isCompleting,
  onComplete,
  hideLabelOnMobile,
  size = 'md',
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <PreviousLessonButton
        courseSlug={courseSlug}
        previousLesson={previousLesson}
        size={size}
        hideLabelOnMobile={hideLabelOnMobile}
      />
      <CompleteLessonButton
        isCompleted={isCompleted}
        isPending={isCompleting}
        onComplete={onComplete}
        size={size}
        hideLabelOnMobile={hideLabelOnMobile}
      />
      <NextLessonButton
        courseSlug={courseSlug}
        nextLesson={nextLesson}
        size={size}
        hideLabelOnMobile={hideLabelOnMobile}
      />
    </div>
  );
}
