import { useQuery } from '@tanstack/react-query';
import { coursesRepo } from '@/lib/courses/coursesRepo';
import { progressRepo } from '@/lib/progress/progressRepo';
import { queryKeys } from './queryKeys';

export function useCourseStructure(courseSlug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.course.structureBySlug(courseSlug ?? ''),
    queryFn: () => coursesRepo.getCourseStructureBySlug(courseSlug!),
    enabled: Boolean(courseSlug),
  });
}

/**
 * Returns the lessonId to send the user to when no lessonId is in the URL.
 * Prefers the most recently opened lesson for this course; falls back to the
 * first lesson by order_index.
 */
export function useFirstLessonId(courseSlug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.course.firstLessonId(courseSlug ?? ''),
    queryFn: async () => {
      const structure = await coursesRepo.getCourseStructureBySlug(courseSlug!);
      if (!structure) return null;
      const last = await progressRepo.getLastOpenedLessonId(structure.course.id);
      if (last && structure.lessons.some((l) => l.id === last)) {
        return last;
      }
      return await coursesRepo.getFirstLessonId(courseSlug!);
    },
    enabled: Boolean(courseSlug),
  });
}
