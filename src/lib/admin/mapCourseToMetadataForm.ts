import type { Course } from '@/types/course';
import type { CourseMetadataFormValues } from '@/types/admin';

export function courseToMetadataFormValues(
  course: Course,
): CourseMetadataFormValues {
  return {
    title: course.title,
    slug: course.slug,
    short_description: course.short_description,
    description: course.description,
    category: course.category,
    level: course.level,
    cover_image_url: course.cover_image_url,
    structure_type: course.structure_type,
    status: course.status,
    is_featured: course.is_featured,
    is_free: course.is_free,
    price: course.price != null ? String(course.price) : '',
    ai_context: course.ai_context,
  };
}
