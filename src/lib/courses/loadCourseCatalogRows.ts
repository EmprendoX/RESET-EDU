import { coursesRepo } from '@/lib/courses/coursesRepo';
import { progressRepo } from '@/lib/progress/progressRepo';
import { computeCoursePercentage } from '@/hooks/useLessonProgress';
import type { CourseCatalogRow } from '@/components/student/StudentCourseCatalog';
import type { UserRole } from '@/types/auth';

/**
 * Catálogo del alumno con progreso (dashboard y /cursos autenticado).
 */
export async function loadCourseCatalogRows(
  userId: string,
  role: UserRole,
): Promise<CourseCatalogRow[]> {
  const summaries = await coursesRepo.listPublishedCatalogForUser({
    userId,
    role,
  });

  const courses: CourseCatalogRow[] = await Promise.all(
    summaries.map(async (c) => {
      if (!c.hasAccess) {
        return {
          ...c,
          progressPercent: 0,
          completedLessons: 0,
          continueLessonId: null,
        };
      }
      const [progressList, lastOpened] = await Promise.all([
        progressRepo.listForCourse(c.id),
        progressRepo.getLastOpenedLessonId(c.id),
      ]);
      const completed = progressList.filter((p) => p.status === 'completed')
        .length;
      const progressPercent = computeCoursePercentage(
        c.lessonCount,
        completed,
      );
      let continueLessonId = lastOpened;
      if (!continueLessonId) {
        continueLessonId = await coursesRepo.getFirstLessonId(c.slug);
      }
      return {
        ...c,
        progressPercent,
        completedLessons: completed,
        continueLessonId,
      };
    }),
  );

  return courses;
}
