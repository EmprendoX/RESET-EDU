/**
 * Punto de entrada legacy para el Aula demo: misma data que marketingCourseStructure en mockAdminCourses.ts
 */
import {
  marketingCourseStructure,
  MOCK_COURSE_ID,
  MOCK_COURSE_SLUG,
} from '@/data/mockAdminCourses';

export { MOCK_COURSE_ID, MOCK_COURSE_SLUG };

export const mockClassroomData = marketingCourseStructure;

export function getMockLessonById(lessonId: string) {
  return marketingCourseStructure.lessons.find((l) => l.id === lessonId);
}

export function getMockFirstLessonId(): string {
  return marketingCourseStructure.lessons[0]?.id ?? '';
}
