import type { CourseStructure, PublishedCourseSummary } from '@/types/course';
import type { Lesson } from '@/types/lesson';
import {
  getStructureBySlug,
  listAllStructures,
} from '@/data/courseCatalogMockStore';
import { randomDelay } from '@/lib/utils/time';

/**
 * Course repository (read path). Backed by the multi-course mock catalog store.
 *
 * When Supabase is connected, replace the bodies with real queries. The public
 * signatures stay the same.
 */

export const coursesRepo = {
  async listPublishedSummaries(): Promise<PublishedCourseSummary[]> {
    await randomDelay(80, 160);
    return listAllStructures()
      .filter((s) => s.course.status === 'published')
      .map((s) => ({
        id: s.course.id,
        slug: s.course.slug,
        title: s.course.title,
        short_description: s.course.short_description,
        cover_image_url: s.course.cover_image_url,
        lessonCount: s.lessons.length,
      }))
      .sort((a, b) => a.title.localeCompare(b.title, 'es'));
  },

  async getCourseStructureBySlug(
    slug: string,
  ): Promise<CourseStructure | null> {
    await randomDelay();
    const structure = getStructureBySlug(slug);
    return structure ? cloneStructure(structure) : null;
  },

  async getLessonById(args: {
    courseSlug: string;
    lessonId: string;
  }): Promise<{
    structure: CourseStructure;
    lesson: Lesson;
  } | null> {
    await randomDelay();
    const structure = getStructureBySlug(args.courseSlug);
    if (!structure) return null;
    const lesson = structure.lessons.find((l) => l.id === args.lessonId);
    if (!lesson) return null;
    return {
      structure: cloneStructure(structure),
      lesson: { ...lesson },
    };
  },

  async getFirstLessonId(courseSlug: string): Promise<string | null> {
    await randomDelay(100, 200);
    const structure = getStructureBySlug(courseSlug);
    if (!structure || structure.lessons.length === 0) return null;
    const sorted = [...structure.lessons].sort(
      (a, b) => a.order_index - b.order_index,
    );
    return sorted[0]?.id ?? null;
  },
};

function cloneStructure(s: CourseStructure): CourseStructure {
  return {
    course: { ...s.course },
    modules: s.modules.map((m) => ({ ...m })),
    sections: s.sections.map((sec) => ({ ...sec })),
    lessons: s.lessons.map((l) => ({ ...l })),
  };
}
