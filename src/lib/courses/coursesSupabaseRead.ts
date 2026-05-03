import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Course,
  CourseLevel,
  CourseModule,
  CourseSection,
  CourseStatus,
  CourseStructure,
  PublishedCatalogRow,
  PublishedCourseSummary,
  StructureType,
} from '@/types/course';
import type { FileType, Lesson, LessonStatus } from '@/types/lesson';
import type { UserRole } from '@/types/auth';

function asRecord(row: unknown): Record<string, unknown> {
  return row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
}

function parseCourseLevel(v: unknown): CourseLevel {
  if (v === 'beginner' || v === 'intermediate' || v === 'advanced') return v;
  return 'beginner';
}

function parseStructureType(v: unknown): StructureType {
  if (v === 'linear' || v === 'modular') return v;
  return 'linear';
}

function parseCourseStatus(v: unknown): CourseStatus {
  if (v === 'draft' || v === 'published' || v === 'archived') return v;
  return 'draft';
}

function parseLessonStatus(v: unknown): LessonStatus {
  if (v === 'draft' || v === 'published') return v;
  return 'draft';
}

function parseFileType(v: unknown): FileType {
  if (
    v === 'pdf' ||
    v === 'video' ||
    v === 'pptx' ||
    v === 'text' ||
    v === 'mixed' ||
    v === 'unsupported'
  ) {
    return v;
  }
  return 'text';
}

export function mapCourseRow(r: Record<string, unknown>): Course {
  const priceRaw = r.price;
  return {
    id: String(r.id ?? ''),
    title: String(r.title ?? ''),
    slug: String(r.slug ?? ''),
    description: String(r.description ?? ''),
    short_description: String(r.short_description ?? ''),
    cover_image_url: String(r.cover_image_url ?? ''),
    category: String(r.category ?? ''),
    level: parseCourseLevel(r.level),
    structure_type: parseStructureType(r.structure_type),
    status: parseCourseStatus(r.status),
    is_featured: Boolean(r.is_featured),
    is_free: Boolean(r.is_free),
    price:
      priceRaw === null || priceRaw === undefined ? undefined : Number(priceRaw),
    ai_context: String(r.ai_context ?? ''),
    created_by: r.created_by != null ? String(r.created_by) : '',
    created_at: String(r.created_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
    published_at:
      r.published_at != null && r.published_at !== ''
        ? String(r.published_at)
        : undefined,
  };
}

export function mapModuleRow(r: Record<string, unknown>): CourseModule {
  return {
    id: String(r.id ?? ''),
    course_id: String(r.course_id ?? ''),
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    order_index: Number(r.order_index ?? 0),
  };
}

export function mapSectionRow(r: Record<string, unknown>): CourseSection {
  return {
    id: String(r.id ?? ''),
    course_id: String(r.course_id ?? ''),
    module_id: String(r.module_id ?? ''),
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    order_index: Number(r.order_index ?? 0),
  };
}

export function mapLessonRow(r: Record<string, unknown>): Lesson {
  const moduleId = r.module_id;
  const sectionId = r.section_id;
  const contentText = r.content_text;
  const aiContext = r.ai_context;
  const videoUrl = r.video_url;
  const pdfUrl = r.pdf_url;
  const fileUrl = r.file_url;
  return {
    id: String(r.id ?? ''),
    course_id: String(r.course_id ?? ''),
    module_id: moduleId != null ? String(moduleId) : undefined,
    section_id: sectionId != null ? String(sectionId) : undefined,
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    content_text:
      contentText != null && String(contentText) !== ''
        ? String(contentText)
        : undefined,
    ai_context:
      aiContext != null && String(aiContext) !== ''
        ? String(aiContext)
        : undefined,
    video_url:
      videoUrl != null && String(videoUrl) !== ''
        ? String(videoUrl)
        : undefined,
    pdf_url:
      pdfUrl != null && String(pdfUrl) !== '' ? String(pdfUrl) : undefined,
    file_url:
      fileUrl != null && String(fileUrl) !== '' ? String(fileUrl) : undefined,
    file_type: parseFileType(r.file_type),
    duration_minutes: Number(r.duration_minutes ?? 0),
    order_index: Number(r.order_index ?? 0),
    is_preview: Boolean(r.is_preview),
    status: parseLessonStatus(r.status),
  };
}

function mapPublishedSummaryFromCourseRow(
  r: Record<string, unknown>,
): PublishedCourseSummary {
  return {
    id: String(r.id ?? ''),
    slug: String(r.slug ?? ''),
    title: String(r.title ?? ''),
    short_description: String(r.short_description ?? ''),
    cover_image_url: String(r.cover_image_url ?? ''),
    lessonCount: Number(r.lesson_count ?? 0),
  };
}

async function fetchEnrolledCourseIds(
  sb: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data, error } = await sb
    .from('enrollments')
    .select('course_id')
    .eq('user_id', userId);
  if (error) throw error;
  const set = new Set<string>();
  for (const row of data ?? []) {
    const rec = asRecord(row);
    const cid = rec.course_id;
    if (cid) set.add(String(cid));
  }
  return set;
}

async function hasEnrollment(
  sb: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const { data, error } = await sb
    .from('enrollments')
    .select('course_id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
  if (error) throw error;
  return data != null;
}

export async function listPublishedCatalogFromSupabase(
  sb: SupabaseClient,
  args: { userId: string; role: UserRole },
): Promise<PublishedCatalogRow[]> {
  const isElevated =
    args.role === 'course_admin' || args.role === 'superadmin';

  const { data: coursesRows, error } = await sb
    .from('courses')
    .select(
      'id, slug, title, short_description, cover_image_url, lesson_count, is_free',
    )
    .eq('status', 'published')
    .order('title');
  if (error) throw error;

  let enrolled = new Set<string>();
  if (!isElevated && args.role === 'student') {
    enrolled = await fetchEnrolledCourseIds(sb, args.userId);
  }

  const rows: PublishedCatalogRow[] = (coursesRows ?? []).map((row) => {
    const rec = asRecord(row);
    const summary = mapPublishedSummaryFromCourseRow(rec);
    const isFree = Boolean(rec.is_free);
    const hasAccess =
      isElevated || isFree || enrolled.has(String(rec.id ?? ''));
    return { ...summary, hasAccess };
  });

  rows.sort((a, b) => {
    if (a.hasAccess !== b.hasAccess) return a.hasAccess ? -1 : 1;
    return a.title.localeCompare(b.title, 'es');
  });
  return rows;
}

export async function resolveAulaGateFromSupabase(
  sb: SupabaseClient,
  args: { userId: string; role: UserRole; courseSlug: string },
): Promise<'allow' | 'not_found' | 'forbidden'> {
  const { data: courseRow, error } = await sb
    .from('courses')
    .select('id, status, is_free')
    .eq('slug', args.courseSlug)
    .maybeSingle();
  if (error) throw error;
  if (!courseRow) return 'not_found';

  const course = asRecord(courseRow);
  const isElevated =
    args.role === 'course_admin' || args.role === 'superadmin';
  if (isElevated) return 'allow';

  if (course.status !== 'published') return 'not_found';

  const courseId = String(course.id ?? '');
  const hasAccess =
    Boolean(course.is_free) ||
    (await hasEnrollment(sb, args.userId, courseId));
  if (!hasAccess) return 'forbidden';
  return 'allow';
}

async function fetchChildrenForCourse(
  sb: SupabaseClient,
  courseId: string,
): Promise<{
  modules: CourseModule[];
  sections: CourseSection[];
  lessons: Lesson[];
}> {
  const [modsRes, secsRes, lessRes] = await Promise.all([
    sb
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true }),
    sb
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true }),
    sb
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true }),
  ]);

  if (modsRes.error) throw modsRes.error;
  if (secsRes.error) throw secsRes.error;
  if (lessRes.error) throw lessRes.error;

  return {
    modules: (modsRes.data ?? []).map((row) => mapModuleRow(asRecord(row))),
    sections: (secsRes.data ?? []).map((row) => mapSectionRow(asRecord(row))),
    lessons: (lessRes.data ?? []).map((row) => mapLessonRow(asRecord(row))),
  };
}

function assembleCourseStructure(
  courseRec: Record<string, unknown>,
  children: {
    modules: CourseModule[];
    sections: CourseSection[];
    lessons: Lesson[];
  },
): CourseStructure {
  return {
    course: mapCourseRow(courseRec),
    modules: children.modules,
    sections: children.sections,
    lessons: children.lessons,
  };
}

/**
 * True si el slug ya está en uso.
 * Con `excludeCourseId`, ignora ese curso (p. ej. al renombrar metadata).
 */
export async function isSlugTaken(
  sb: SupabaseClient,
  slug: string,
  excludeCourseId?: string | null,
): Promise<boolean> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return false;
  let q = sb.from('courses').select('id').eq('slug', normalized);
  if (excludeCourseId) {
    q = q.neq('id', excludeCourseId);
  }
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return data != null;
}

export async function fetchCourseStructureByCourseId(
  sb: SupabaseClient,
  courseId: string,
): Promise<CourseStructure | null> {
  const { data: courseRow, error } = await sb
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .maybeSingle();
  if (error) throw error;
  if (!courseRow) return null;

  const courseRec = asRecord(courseRow);
  const id = String(courseRec.id ?? '');
  const children = await fetchChildrenForCourse(sb, id);
  return assembleCourseStructure(courseRec, children);
}

export async function fetchCourseStructureBySlug(
  sb: SupabaseClient,
  slug: string,
): Promise<CourseStructure | null> {
  const { data: courseRow, error } = await sb
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!courseRow) return null;

  const courseRec = asRecord(courseRow);
  const courseId = String(courseRec.id ?? '');
  const children = await fetchChildrenForCourse(sb, courseId);
  return assembleCourseStructure(courseRec, children);
}

export async function fetchLessonByIdFromSupabase(
  sb: SupabaseClient,
  args: { courseSlug: string; lessonId: string },
): Promise<{ structure: CourseStructure; lesson: Lesson } | null> {
  const structure = await fetchCourseStructureBySlug(sb, args.courseSlug);
  if (!structure) return null;
  const lesson = structure.lessons.find((l) => l.id === args.lessonId);
  if (!lesson) return null;
  return { structure, lesson: { ...lesson } };
}

export async function fetchFirstLessonIdFromSupabase(
  sb: SupabaseClient,
  courseSlug: string,
): Promise<string | null> {
  const { data: courseRow, error } = await sb
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .maybeSingle();
  if (error) throw error;
  if (!courseRow) return null;

  const courseId = String(asRecord(courseRow).id ?? '');

  const { data: lessons, error: lerr } = await sb
    .from('lessons')
    .select('id, order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  if (lerr) throw lerr;
  if (!lessons?.length) return null;

  const sorted = [...lessons].sort(
    (a, b) =>
      Number(asRecord(a).order_index ?? 0) -
      Number(asRecord(b).order_index ?? 0),
  );
  const first = sorted[0];
  return first ? String(asRecord(first).id ?? '') : null;
}
