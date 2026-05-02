import type {
  CourseStructure,
  PublishedCatalogRow,
  PublishedCourseSummary,
} from '@/types/course';
import type { Lesson } from '@/types/lesson';
import type { UserRole } from '@/types/auth';
import {
  getStructureBySlug,
  listAllStructures,
} from '@/data/courseCatalogMockStore';
import { listEnrolledCourseIdsForUser } from '@/data/enrollmentsMockStore';
import { randomDelay } from '@/lib/utils/time';
import { env } from '@/config/env';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Course repository (read path). Backed by the multi-course mock catalog store.
 *
 * When Supabase is connected, replace the bodies with real queries. The public
 * signatures stay the same.
 */

function studentHasAccessToCourse(
  userId: string,
  course: { id: string; is_free: boolean },
): boolean {
  if (course.is_free) return true;
  return listEnrolledCourseIdsForUser(userId).includes(course.id);
}

export const coursesRepo = {
  async listPublishedSummaries(): Promise<PublishedCourseSummary[]> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      const { data, error } = await sb
        .from('courses')
        .select(
          'id, slug, title, short_description, cover_image_url, lesson_count',
        )
        .eq('status', 'published')
        .order('title');
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id as string,
        slug: row.slug as string,
        title: row.title as string,
        short_description: (row.short_description as string) ?? '',
        cover_image_url: (row.cover_image_url as string) ?? '',
        lessonCount: Number(row.lesson_count ?? 0),
      }));
    }

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

  /** Catálogo publicado con `hasAccess` para el aula; accesibles primero, luego por título. */
  async listPublishedCatalogForUser(args: {
    userId: string;
    role: UserRole;
  }): Promise<PublishedCatalogRow[]> {
    await randomDelay(80, 160);
    const isElevated = args.role === 'course_admin' || args.role === 'superadmin';
    const rows: PublishedCatalogRow[] = listAllStructures()
      .filter((s) => s.course.status === 'published')
      .map((s) => {
        const summary: PublishedCourseSummary = {
          id: s.course.id,
          slug: s.course.slug,
          title: s.course.title,
          short_description: s.course.short_description,
          cover_image_url: s.course.cover_image_url,
          lessonCount: s.lessons.length,
        };
        const hasAccess =
          isElevated || studentHasAccessToCourse(args.userId, s.course);
        return { ...summary, hasAccess };
      });
    rows.sort((a, b) => {
      if (a.hasAccess !== b.hasAccess) return a.hasAccess ? -1 : 1;
      return a.title.localeCompare(b.title, 'es');
    });
    return rows;
  },

  /**
   * Control de acceso al aula por slug.
   * - Admin/superadmin: siempre `allow` si el curso existe (incl. borrador, vista previa).
   * - Student/visitor: `not_found` si no hay curso o no está publicado; `forbidden` si publicado sin acceso.
   */
  async resolveAulaGate(args: {
    userId: string;
    role: UserRole;
    courseSlug: string;
  }): Promise<AulaGateResult> {
    await randomDelay(40, 100);
    const structure = getStructureBySlug(args.courseSlug);
    if (!structure) return 'not_found';
    if (args.role === 'course_admin' || args.role === 'superadmin') {
      return 'allow';
    }
    if (structure.course.status !== 'published') return 'not_found';
    if (!studentHasAccessToCourse(args.userId, structure.course)) {
      return 'forbidden';
    }
    return 'allow';
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

export type AulaGateResult = 'allow' | 'not_found' | 'forbidden';

function cloneStructure(s: CourseStructure): CourseStructure {
  return {
    course: { ...s.course },
    modules: s.modules.map((m) => ({ ...m })),
    sections: s.sections.map((sec) => ({ ...sec })),
    lessons: s.lessons.map((l) => ({ ...l })),
  };
}
