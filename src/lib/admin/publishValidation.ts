import type { CourseStructure } from '@/types/course';
import type { PublishValidationIssue } from '@/types/admin';
import { slugExists } from '@/data/courseCatalogMockStore';

export function validateCoursePublish(structure: CourseStructure): PublishValidationIssue[] {
  const issues: PublishValidationIssue[] = [];
  const { course, modules, sections, lessons } = structure;

  if (!course.title.trim()) {
    issues.push({
      code: 'title_required',
      message: 'El curso necesita un título.',
      severity: 'error',
    });
  }

  if (!course.slug.trim()) {
    issues.push({
      code: 'slug_required',
      message: 'El slug es obligatorio.',
      severity: 'error',
    });
  } else if (slugExists(course.slug, course.id)) {
    issues.push({
      code: 'slug_duplicate',
      message: 'Ya existe otro curso con este slug.',
      severity: 'error',
    });
  }

  if (lessons.length === 0) {
    issues.push({
      code: 'no_lessons',
      message: 'Añade al menos una lección antes de publicar.',
      severity: 'error',
    });
  }

  if (course.structure_type === 'modular') {
    for (const lesson of lessons) {
      if (!lesson.module_id) {
        issues.push({
          code: 'lesson_missing_module',
          message: `La lección "${lesson.title}" debe pertenecer a un capítulo en cursos modulares.`,
          severity: 'error',
        });
      }
    }

    const modulesWithSections = new Set(
      sections.map((s) => s.module_id),
    );

    for (const lesson of lessons) {
      if (!lesson.module_id) continue;
      if (modulesWithSections.has(lesson.module_id) && !lesson.section_id) {
        issues.push({
          code: 'lesson_missing_section',
          message: `La lección "${lesson.title}" debe estar en una sección porque su capítulo tiene secciones.`,
          severity: 'error',
        });
      }
    }

    if (modules.length === 0 && lessons.some((l) => l.module_id)) {
      issues.push({
        code: 'orphan_module_refs',
        message: 'Hay lecciones con capítulo inexistente.',
        severity: 'error',
      });
    }
  }

  if (!course.short_description.trim()) {
    issues.push({
      code: 'short_description_empty',
      message: 'Recomendamos una descripción corta para el catálogo.',
      severity: 'warning',
    });
  }

  return issues;
}
