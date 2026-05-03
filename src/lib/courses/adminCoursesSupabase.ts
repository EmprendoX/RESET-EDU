import type { SupabaseClient } from '@supabase/supabase-js';
import type { CourseModule, CourseSection, CourseStructure } from '@/types/course';
import type {
  AdminCourseListFilters,
  AdminCourseListItemMeta,
  CourseMetadataFormValues,
  LessonFormValues,
  PublishValidationIssue,
} from '@/types/admin';
import { slugify } from '@/lib/admin/slugify';
import { validateCoursePublishSupabase } from '@/lib/admin/publishValidation';
import {
  fetchCourseStructureByCourseId,
  isSlugTaken,
} from '@/lib/courses/coursesSupabaseRead';

function parsePrice(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === '23505'
  );
}

async function requireAuthUserId(sb: SupabaseClient): Promise<string> {
  const { data, error } = await sb.auth.getUser();
  if (error) throw error;
  const id = data.user?.id;
  if (!id) {
    throw new Error('Se requiere sesión de administrador para esta acción.');
  }
  return id;
}

async function bumpCourseUpdatedAt(sb: SupabaseClient, courseId: string) {
  const { data, error } = await sb
    .from('courses')
    .select('description')
    .eq('id', courseId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return;
  const row = data as { description: string };
  const { error: upErr } = await sb
    .from('courses')
    .update({ description: row.description })
    .eq('id', courseId);
  if (upErr) throw upErr;
}

function lessonCountFromRow(row: {
  lessons?: { count: number }[] | null;
}): number {
  const agg = row.lessons;
  if (Array.isArray(agg) && agg[0] && typeof agg[0].count === 'number') {
    return agg[0].count;
  }
  return 0;
}

function sortStructures(
  structures: AdminCourseListItemMeta[],
  sort: AdminCourseListFilters['sort'],
): AdminCourseListItemMeta[] {
  const copy = [...structures];
  if (sort === 'title_asc') {
    copy.sort((a, b) => a.title.localeCompare(b.title, 'es'));
  } else if (sort === 'created_desc') {
    copy.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } else {
    copy.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  }
  return copy;
}

export async function sbAdminCreateDraftCourse(
  sb: SupabaseClient,
): Promise<{ courseId: string }> {
  const userId = await requireAuthUserId(sb);
  const courseId = crypto.randomUUID();
  let slug = slugify(`borrador-${Date.now()}`);
  let guard = 0;
  while ((await isSlugTaken(sb, slug)) && guard++ < 50) {
    slug = slugify(`borrador-${Date.now()}-${guard}`);
  }
  const { error } = await sb.from('courses').insert({
    id: courseId,
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
    created_by: userId,
  });
  if (error) {
    if (isUniqueViolation(error)) throw new Error('DUPLICATE_SLUG');
    throw error;
  }
  return { courseId };
}

export async function sbAdminListCourses(
  sb: SupabaseClient,
  filters: AdminCourseListFilters,
): Promise<AdminCourseListItemMeta[]> {
  const { data, error } = await sb
    .from('courses')
    .select(
      'id, slug, title, status, structure_type, updated_at, created_at, lessons(count)',
    );
  if (error) throw error;

  let rows: AdminCourseListItemMeta[] = (data ?? []).map((r) => {
    const row = r as {
      id: string;
      slug: string;
      title: string;
      status: string;
      structure_type: string;
      updated_at: string;
      created_at: string;
      lessons?: { count: number }[] | null;
    };
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status as AdminCourseListItemMeta['status'],
      structure_type:
        row.structure_type as AdminCourseListItemMeta['structure_type'],
      lessonCount: lessonCountFromRow(row),
      updated_at: row.updated_at,
      created_at: row.created_at,
    };
  });

  if (filters.status !== 'all') {
    rows = rows.filter((x) => x.status === filters.status);
  }
  const q = filters.search.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (x) =>
        x.title.toLowerCase().includes(q) || x.slug.toLowerCase().includes(q),
    );
  }
  rows = sortStructures(rows, filters.sort);
  return rows;
}

export async function sbAdminGetStructure(
  sb: SupabaseClient,
  courseId: string,
): Promise<CourseStructure | null> {
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminUpdateCourseMetadata(
  sb: SupabaseClient,
  courseId: string,
  values: CourseMetadataFormValues,
): Promise<CourseStructure | null> {
  const slug = values.slug.trim().toLowerCase();
  if (await isSlugTaken(sb, slug, courseId)) {
    throw new Error('DUPLICATE_SLUG');
  }
  const price = parsePrice(values.price);
  const payload = {
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
    price: values.is_free ? null : price ?? null,
    ai_context: values.ai_context,
  };
  const { error } = await sb.from('courses').update(payload).eq('id', courseId);
  if (error) {
    if (isUniqueViolation(error)) throw new Error('DUPLICATE_SLUG');
    throw error;
  }
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminPublishCourse(
  sb: SupabaseClient,
  courseId: string,
): Promise<{
  ok: boolean;
  issues: PublishValidationIssue[];
  structure: CourseStructure | null;
}> {
  const current = await fetchCourseStructureByCourseId(sb, courseId);
  if (!current) return { ok: false, issues: [], structure: null };
  const issues = await validateCoursePublishSupabase(sb, current);
  if (issues.some((i) => i.severity === 'error')) {
    return { ok: false, issues, structure: current };
  }
  const now = new Date().toISOString();
  const { error } = await sb
    .from('courses')
    .update({
      status: 'published',
      published_at: now,
    })
    .eq('id', courseId);
  if (error) throw error;
  const structure = await fetchCourseStructureByCourseId(sb, courseId);
  return { ok: true, issues, structure };
}

export async function sbAdminSetCourseStatus(
  sb: SupabaseClient,
  courseId: string,
  status: 'draft' | 'published' | 'archived',
): Promise<CourseStructure | null> {
  const current = await fetchCourseStructureByCourseId(sb, courseId);
  if (!current) return null;
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status,
  };
  if (status === 'published' && !current.course.published_at) {
    patch.published_at = now;
  }
  const { error } = await sb.from('courses').update(patch).eq('id', courseId);
  if (error) throw error;
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminDeleteCourse(
  sb: SupabaseClient,
  courseId: string,
): Promise<boolean> {
  const { data, error } = await sb
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;
  const { error: delErr } = await sb.from('courses').delete().eq('id', courseId);
  if (delErr) throw delErr;
  return true;
}

export async function sbAdminAddModule(
  sb: SupabaseClient,
  courseId: string,
  title: string,
): Promise<CourseStructure | null> {
  const { data: mods, error: mErr } = await sb
    .from('course_modules')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1);
  if (mErr) throw mErr;
  const top = mods?.[0] as { order_index: number } | undefined;
  const order = (top?.order_index ?? 0) + 1;
  const id = crypto.randomUUID();
  const { error } = await sb.from('course_modules').insert({
    id,
    course_id: courseId,
    title: title.trim() || 'Capítulo sin título',
    description: '',
    order_index: order,
  });
  if (error) throw error;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminUpdateModule(
  sb: SupabaseClient,
  courseId: string,
  moduleId: string,
  patch: Partial<Pick<CourseModule, 'title' | 'description'>>,
): Promise<CourseStructure | null> {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.description !== undefined) row.description = patch.description;
  if (Object.keys(row).length === 0) {
    return fetchCourseStructureByCourseId(sb, courseId);
  }
  const { error } = await sb
    .from('course_modules')
    .update(row)
    .eq('id', moduleId)
    .eq('course_id', courseId);
  if (error) throw error;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminDeleteModule(
  sb: SupabaseClient,
  courseId: string,
  moduleId: string,
): Promise<CourseStructure | null> {
  const { data: secRows, error: sErr } = await sb
    .from('course_sections')
    .select('id')
    .eq('module_id', moduleId)
    .eq('course_id', courseId);
  if (sErr) throw sErr;
  const sectionIds = (secRows ?? []).map((r) => String((r as { id: string }).id));
  if (sectionIds.length > 0) {
    const { error: lErr } = await sb
      .from('lessons')
      .delete()
      .eq('course_id', courseId)
      .in('section_id', sectionIds);
    if (lErr) throw lErr;
  }
  const { error: l2 } = await sb
    .from('lessons')
    .delete()
    .eq('course_id', courseId)
    .eq('module_id', moduleId);
  if (l2) throw l2;
  const { error: dErr } = await sb
    .from('course_modules')
    .delete()
    .eq('id', moduleId)
    .eq('course_id', courseId);
  if (dErr) throw dErr;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminAddSection(
  sb: SupabaseClient,
  courseId: string,
  moduleId: string,
  title: string,
): Promise<CourseStructure | null> {
  const { data: secs, error: sErr } = await sb
    .from('course_sections')
    .select('order_index')
    .eq('course_id', courseId)
    .eq('module_id', moduleId)
    .order('order_index', { ascending: false })
    .limit(1);
  if (sErr) throw sErr;
  const top = secs?.[0] as { order_index: number } | undefined;
  const order = (top?.order_index ?? 0) + 1;
  const id = crypto.randomUUID();
  const { error } = await sb.from('course_sections').insert({
    id,
    course_id: courseId,
    module_id: moduleId,
    title: title.trim() || 'Sección sin título',
    description: '',
    order_index: order,
  });
  if (error) throw error;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminUpdateSection(
  sb: SupabaseClient,
  courseId: string,
  sectionId: string,
  patch: Partial<Pick<CourseSection, 'title' | 'description'>>,
): Promise<CourseStructure | null> {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.description !== undefined) row.description = patch.description;
  if (Object.keys(row).length === 0) {
    return fetchCourseStructureByCourseId(sb, courseId);
  }
  const { error } = await sb
    .from('course_sections')
    .update(row)
    .eq('id', sectionId)
    .eq('course_id', courseId);
  if (error) throw error;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminDeleteSection(
  sb: SupabaseClient,
  courseId: string,
  sectionId: string,
): Promise<CourseStructure | null> {
  const { error: lErr } = await sb
    .from('lessons')
    .delete()
    .eq('course_id', courseId)
    .eq('section_id', sectionId);
  if (lErr) throw lErr;
  const { error } = await sb
    .from('course_sections')
    .delete()
    .eq('id', sectionId)
    .eq('course_id', courseId);
  if (error) throw error;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminAddLesson(
  sb: SupabaseClient,
  courseId: string,
  args: { moduleId?: string; sectionId?: string },
): Promise<CourseStructure | null> {
  const { data: less, error: lErr } = await sb
    .from('lessons')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1);
  if (lErr) throw lErr;
  const top = less?.[0] as { order_index: number } | undefined;
  const order = (top?.order_index ?? 0) + 1;
  const id = crypto.randomUUID();
  const { error } = await sb.from('lessons').insert({
    id,
    course_id: courseId,
    module_id: args.moduleId ?? null,
    section_id: args.sectionId ?? null,
    title: 'Nueva lección',
    description: '',
    content_text: '',
    ai_context: '',
    file_type: 'text',
    duration_minutes: 10,
    order_index: order,
    is_preview: false,
    status: 'draft',
  });
  if (error) throw error;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

function optionalUrl(v: string): string | null {
  const t = v.trim();
  return t === '' ? null : t;
}

export async function sbAdminUpdateLesson(
  sb: SupabaseClient,
  courseId: string,
  lessonId: string,
  values: LessonFormValues,
): Promise<CourseStructure | null> {
  const { error } = await sb
    .from('lessons')
    .update({
      title: values.title.trim(),
      description: values.description.trim(),
      content_text: values.content_text,
      ai_context: values.ai_context.trim() || null,
      video_url: optionalUrl(values.video_url),
      pdf_url: optionalUrl(values.pdf_url),
      file_url: optionalUrl(values.file_url),
      file_type: values.file_type,
      duration_minutes: values.duration_minutes,
      order_index: values.order_index,
      is_preview: values.is_preview,
      status: values.status,
    })
    .eq('id', lessonId)
    .eq('course_id', courseId);
  if (error) throw error;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminDeleteLesson(
  sb: SupabaseClient,
  courseId: string,
  lessonId: string,
): Promise<CourseStructure | null> {
  const { error } = await sb
    .from('lessons')
    .delete()
    .eq('id', lessonId)
    .eq('course_id', courseId);
  if (error) throw error;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminReorderLessons(
  sb: SupabaseClient,
  courseId: string,
  orderedLessonIds: string[],
): Promise<CourseStructure | null> {
  const orderMap = new Map(orderedLessonIds.map((id, i) => [id, i + 1]));
  for (const [id, order_index] of orderMap) {
    const { error } = await sb
      .from('lessons')
      .update({ order_index })
      .eq('id', id)
      .eq('course_id', courseId);
    if (error) throw error;
  }
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminReorderModules(
  sb: SupabaseClient,
  courseId: string,
  orderedModuleIds: string[],
): Promise<CourseStructure | null> {
  const orderMap = new Map(orderedModuleIds.map((id, i) => [id, i + 1]));
  for (const [id, order_index] of orderMap) {
    const { error } = await sb
      .from('course_modules')
      .update({ order_index })
      .eq('id', id)
      .eq('course_id', courseId);
    if (error) throw error;
  }
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminReorderSections(
  sb: SupabaseClient,
  courseId: string,
  moduleId: string,
  orderedSectionIds: string[],
): Promise<CourseStructure | null> {
  const orderMap = new Map(orderedSectionIds.map((id, i) => [id, i + 1]));
  for (const [id, order_index] of orderMap) {
    const { error } = await sb
      .from('course_sections')
      .update({ order_index })
      .eq('id', id)
      .eq('course_id', courseId)
      .eq('module_id', moduleId);
    if (error) throw error;
  }
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}

export async function sbAdminAssignLessonPlacement(
  sb: SupabaseClient,
  courseId: string,
  lessonId: string,
  placement: { moduleId?: string; sectionId?: string },
): Promise<CourseStructure | null> {
  const { error } = await sb
    .from('lessons')
    .update({
      module_id: placement.moduleId ?? null,
      section_id: placement.sectionId ?? null,
    })
    .eq('id', lessonId)
    .eq('course_id', courseId);
  if (error) throw error;
  await bumpCourseUpdatedAt(sb, courseId);
  return fetchCourseStructureByCourseId(sb, courseId);
}
