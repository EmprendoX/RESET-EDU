import type { CourseModule, CourseSection, CourseStructure } from '@/types/course';
import type { Lesson } from '@/types/lesson';
import type {
  AdminCourseListFilters,
  AdminCourseListItemMeta,
  CourseMetadataFormValues,
  LessonFormValues,
  PublishValidationIssue,
} from '@/types/admin';
import {
  deleteStructure,
  listAllStructures,
  replaceStructure,
  slugExists,
  upsertStructure,
} from '@/data/courseCatalogMockStore';
import { slugify } from '@/lib/admin/slugify';
import { validateCoursePublish } from '@/lib/admin/publishValidation';
import { randomDelay } from '@/lib/utils/time';
import { env } from '@/config/env';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  sbAdminAddLesson,
  sbAdminAddModule,
  sbAdminAddSection,
  sbAdminAssignLessonPlacement,
  sbAdminCreateDraftCourse,
  sbAdminDeleteCourse,
  sbAdminDeleteLesson,
  sbAdminDeleteModule,
  sbAdminDeleteSection,
  sbAdminGetStructure,
  sbAdminListCourses,
  sbAdminPublishCourse,
  sbAdminReorderLessons,
  sbAdminReorderModules,
  sbAdminReorderSections,
  sbAdminSetCourseStatus,
  sbAdminUpdateCourseMetadata,
  sbAdminUpdateLesson,
  sbAdminUpdateModule,
  sbAdminUpdateSection,
} from '@/lib/courses/adminCoursesSupabase';

function newEntityId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

function parsePrice(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function sortStructures(
  structures: CourseStructure[],
  sort: AdminCourseListFilters['sort'],
): CourseStructure[] {
  const copy = [...structures];
  if (sort === 'title_asc') {
    copy.sort((a, b) =>
      a.course.title.localeCompare(b.course.title, 'es'),
    );
  } else if (sort === 'created_desc') {
    copy.sort(
      (a, b) =>
        new Date(b.course.created_at).getTime() -
        new Date(a.course.created_at).getTime(),
    );
  } else {
    copy.sort(
      (a, b) =>
        new Date(b.course.updated_at).getTime() -
        new Date(a.course.updated_at).getTime(),
    );
  }
  return copy;
}

export const adminCoursesRepo = {
  async createDraftCourse(): Promise<{ courseId: string }> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminCreateDraftCourse(sb);
    }
    await randomDelay(80, 160);
    const id = newEntityId('course');
    let slug = slugify(`borrador-${Date.now()}`);
    let guard = 0;
    while (slugExists(slug) && guard++ < 50) {
      slug = slugify(`borrador-${Date.now()}-${guard}`);
    }
    const now = new Date().toISOString();
    const structure: CourseStructure = {
      course: {
        id,
        title: 'Nuevo curso',
        slug,
        description: '',
        short_description: '',
        cover_image_url: '',
        category: 'General',
        level: 'beginner',
        structure_type: 'linear',
        status: 'draft',
        is_featured: false,
        is_free: true,
        ai_context: '',
        created_by: 'admin_demo',
        created_at: now,
        updated_at: now,
      },
      modules: [],
      sections: [],
      lessons: [],
    };
    upsertStructure(structure);
    return { courseId: id };
  },

  async listCourses(
    filters: AdminCourseListFilters,
  ): Promise<AdminCourseListItemMeta[]> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminListCourses(sb, filters);
    }
    await randomDelay(60, 120);
    let rows = listAllStructures();
    if (filters.status !== 'all') {
      rows = rows.filter((s) => s.course.status === filters.status);
    }
    const q = filters.search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (s) =>
          s.course.title.toLowerCase().includes(q) ||
          s.course.slug.toLowerCase().includes(q),
      );
    }
    rows = sortStructures(rows, filters.sort);
    return rows.map((s) => ({
      id: s.course.id,
      slug: s.course.slug,
      title: s.course.title,
      status: s.course.status,
      structure_type: s.course.structure_type,
      lessonCount: s.lessons.length,
      created_at: s.course.created_at,
      updated_at: s.course.updated_at,
    }));
  },

  async getStructure(courseId: string): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminGetStructure(sb, courseId);
    }
    await randomDelay(40, 90);
    const found = listAllStructures().find((s) => s.course.id === courseId);
    return found ?? null;
  },

  async updateCourseMetadata(
    courseId: string,
    values: CourseMetadataFormValues,
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminUpdateCourseMetadata(sb, courseId, values);
    }
    await randomDelay(80, 140);
    const slug = values.slug.trim().toLowerCase();
    if (slugExists(slug, courseId)) {
      throw new Error('DUPLICATE_SLUG');
    }
    const price = parsePrice(values.price);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        course: {
          ...prev.course,
          title: values.title.trim(),
          slug,
          short_description: values.short_description.trim(),
          description: values.description,
          category: values.category.trim(),
          level: values.level,
          cover_image_url: values.cover_image_url.trim(),
          structure_type: values.structure_type,
          status: values.status,
          is_featured: values.is_featured,
          is_free: values.is_free,
          price: values.is_free ? undefined : price,
          ai_context: values.ai_context,
          updated_at: now,
        },
      };
    });
  },

  async publishCourse(courseId: string): Promise<{
    ok: boolean;
    issues: PublishValidationIssue[];
    structure: CourseStructure | null;
  }> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminPublishCourse(sb, courseId);
    }
    await randomDelay(100, 180);
    const current = listAllStructures().find((s) => s.course.id === courseId);
    if (!current) return { ok: false, issues: [], structure: null };
    const issues = validateCoursePublish(current);
    if (issues.some((i) => i.severity === 'error')) {
      return { ok: false, issues, structure: current };
    }
    const now = new Date().toISOString();
    const next = replaceStructure(courseId, (prev) => ({
      ...prev,
      course: {
        ...prev.course,
        status: 'published' as const,
        published_at: now,
        updated_at: now,
      },
    }));
    return { ok: true, issues, structure: next };
  },

  async setCourseStatus(
    courseId: string,
    status: 'draft' | 'published' | 'archived',
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminSetCourseStatus(sb, courseId, status);
    }
    await randomDelay(60, 100);
    const now = new Date().toISOString();
    return replaceStructure(courseId, (prev) => ({
      ...prev,
      course: {
        ...prev.course,
        status,
        updated_at: now,
        ...(status === 'published' && !prev.course.published_at
          ? { published_at: now }
          : {}),
      },
    }));
  },

  async deleteCourse(courseId: string): Promise<boolean> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminDeleteCourse(sb, courseId);
    }
    await randomDelay(80, 120);
    const exists = listAllStructures().some((s) => s.course.id === courseId);
    if (!exists) return false;
    deleteStructure(courseId);
    return true;
  },

  async addModule(
    courseId: string,
    title: string,
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminAddModule(sb, courseId, title);
    }
    await randomDelay(60, 100);
    return replaceStructure(courseId, (prev) => {
      const order =
        prev.modules.reduce((m, x) => Math.max(m, x.order_index), 0) + 1;
      const mod: CourseModule = {
        id: newEntityId('mod'),
        course_id: courseId,
        title: title.trim() || 'Capítulo sin título',
        description: '',
        order_index: order,
      };
      const now = new Date().toISOString();
      return {
        ...prev,
        modules: [...prev.modules, mod],
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async updateModule(
    courseId: string,
    moduleId: string,
    patch: Partial<Pick<CourseModule, 'title' | 'description'>>,
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminUpdateModule(sb, courseId, moduleId, patch);
    }
    await randomDelay(40, 80);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, ...patch } : m,
        ),
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async deleteModule(
    courseId: string,
    moduleId: string,
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminDeleteModule(sb, courseId, moduleId);
    }
    await randomDelay(60, 100);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        modules: prev.modules.filter((m) => m.id !== moduleId),
        sections: prev.sections.filter((s) => s.module_id !== moduleId),
        lessons: prev.lessons.filter((l) => l.module_id !== moduleId),
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async addSection(
    courseId: string,
    moduleId: string,
    title: string,
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminAddSection(sb, courseId, moduleId, title);
    }
    await randomDelay(60, 100);
    return replaceStructure(courseId, (prev) => {
      const order =
        prev.sections
          .filter((s) => s.module_id === moduleId)
          .reduce((m, x) => Math.max(m, x.order_index), 0) + 1;
      const sec: CourseSection = {
        id: newEntityId('sec'),
        course_id: courseId,
        module_id: moduleId,
        title: title.trim() || 'Sección sin título',
        description: '',
        order_index: order,
      };
      const now = new Date().toISOString();
      return {
        ...prev,
        sections: [...prev.sections, sec],
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async updateSection(
    courseId: string,
    sectionId: string,
    patch: Partial<Pick<CourseSection, 'title' | 'description'>>,
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminUpdateSection(sb, courseId, sectionId, patch);
    }
    await randomDelay(40, 80);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? { ...s, ...patch } : s,
        ),
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async deleteSection(
    courseId: string,
    sectionId: string,
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminDeleteSection(sb, courseId, sectionId);
    }
    await randomDelay(60, 100);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
        lessons: prev.lessons.filter((l) => l.section_id !== sectionId),
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async addLesson(
    courseId: string,
    args: {
      moduleId?: string;
      sectionId?: string;
    },
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminAddLesson(sb, courseId, args);
    }
    await randomDelay(60, 120);
    return replaceStructure(courseId, (prev) => {
      const order =
        prev.lessons.reduce((m, x) => Math.max(m, x.order_index), 0) + 1;
      const now = new Date().toISOString();
      const lesson: Lesson = {
        id: newEntityId('lesson'),
        course_id: courseId,
        module_id: args.moduleId,
        section_id: args.sectionId,
        title: 'Nueva lección',
        description: '',
        content_text: '',
        ai_context: '',
        file_type: 'text',
        duration_minutes: 10,
        order_index: order,
        is_preview: false,
        status: 'draft',
      };
      return {
        ...prev,
        lessons: [...prev.lessons, lesson],
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async updateLesson(
    courseId: string,
    lessonId: string,
    values: LessonFormValues,
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminUpdateLesson(sb, courseId, lessonId, values);
    }
    await randomDelay(60, 120);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === lessonId
            ? {
                ...l,
                title: values.title.trim(),
                description: values.description.trim(),
                content_text: values.content_text,
                ai_context: values.ai_context,
                video_url: values.video_url.trim() || undefined,
                pdf_url: values.pdf_url.trim() || undefined,
                file_url: values.file_url.trim() || undefined,
                file_type: values.file_type,
                duration_minutes: values.duration_minutes,
                order_index: values.order_index,
                is_preview: values.is_preview,
                status: values.status,
              }
            : l,
        ),
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async deleteLesson(
    courseId: string,
    lessonId: string,
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminDeleteLesson(sb, courseId, lessonId);
    }
    await randomDelay(60, 100);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        lessons: prev.lessons.filter((l) => l.id !== lessonId),
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async reorderLessons(
    courseId: string,
    orderedLessonIds: string[],
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminReorderLessons(sb, courseId, orderedLessonIds);
    }
    await randomDelay(40, 80);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      const orderMap = new Map(
        orderedLessonIds.map((id, i) => [id, i + 1]),
      );
      return {
        ...prev,
        lessons: prev.lessons.map((l) => ({
          ...l,
          order_index: orderMap.get(l.id) ?? l.order_index,
        })),
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async reorderModules(
    courseId: string,
    orderedModuleIds: string[],
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminReorderModules(sb, courseId, orderedModuleIds);
    }
    await randomDelay(40, 80);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      const orderMap = new Map(
        orderedModuleIds.map((id, i) => [id, i + 1]),
      );
      return {
        ...prev,
        modules: prev.modules.map((m) => ({
          ...m,
          order_index: orderMap.get(m.id) ?? m.order_index,
        })),
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async reorderSections(
    courseId: string,
    moduleId: string,
    orderedSectionIds: string[],
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminReorderSections(sb, courseId, moduleId, orderedSectionIds);
    }
    await randomDelay(40, 80);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      const orderMap = new Map(
        orderedSectionIds.map((id, i) => [id, i + 1]),
      );
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.module_id === moduleId
            ? { ...s, order_index: orderMap.get(s.id) ?? s.order_index }
            : s,
        ),
        course: { ...prev.course, updated_at: now },
      };
    });
  },

  async assignLessonPlacement(
    courseId: string,
    lessonId: string,
    placement: { moduleId?: string; sectionId?: string },
  ): Promise<CourseStructure | null> {
    const sb = getSupabase();
    if (isSupabaseConfigured() && env.useSupabaseData && sb) {
      return sbAdminAssignLessonPlacement(sb, courseId, lessonId, placement);
    }
    await randomDelay(40, 80);
    return replaceStructure(courseId, (prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === lessonId
            ? {
                ...l,
                module_id: placement.moduleId,
                section_id: placement.sectionId,
              }
            : l,
        ),
        course: { ...prev.course, updated_at: now },
      };
    });
  },
};
