import { useQuery } from '@tanstack/react-query';
import { coursesRepo } from '@/lib/courses/coursesRepo';
import { queryKeys } from './queryKeys';

export function useLessonData(args: {
  courseSlug: string | undefined;
  lessonId: string | undefined;
}) {
  const { courseSlug, lessonId } = args;
  return useQuery({
    queryKey: queryKeys.course.lesson(courseSlug ?? '', lessonId ?? ''),
    queryFn: () =>
      coursesRepo.getLessonById({
        courseSlug: courseSlug!,
        lessonId: lessonId!,
      }),
    enabled: Boolean(courseSlug && lessonId),
  });
}
