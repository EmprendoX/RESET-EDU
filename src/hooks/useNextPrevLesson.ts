import { useMemo } from 'react';
import type { CourseStructure } from '@/types/course';
import type { Lesson } from '@/types/lesson';

export interface NeighborLessons {
  previous: Lesson | null;
  next: Lesson | null;
  ordered: Lesson[];
}

export function getOrderedLessons(structure: CourseStructure): Lesson[] {
  const { lessons, modules, sections } = structure;

  if (structure.course.structure_type === 'linear') {
    return [...lessons].sort((a, b) => a.order_index - b.order_index);
  }

  const moduleOrder = new Map(
    [...modules]
      .sort((a, b) => a.order_index - b.order_index)
      .map((m, i) => [m.id, i]),
  );

  const sectionOrder = new Map(
    [...sections]
      .sort((a, b) => a.order_index - b.order_index)
      .map((s, i) => [s.id, i]),
  );

  return [...lessons].sort((a, b) => {
    const ma = a.module_id ? (moduleOrder.get(a.module_id) ?? 0) : 0;
    const mb = b.module_id ? (moduleOrder.get(b.module_id) ?? 0) : 0;
    if (ma !== mb) return ma - mb;
    const sa = a.section_id ? (sectionOrder.get(a.section_id) ?? 0) : 0;
    const sb = b.section_id ? (sectionOrder.get(b.section_id) ?? 0) : 0;
    if (sa !== sb) return sa - sb;
    return a.order_index - b.order_index;
  });
}

export function useNextPrevLesson(
  structure: CourseStructure | null | undefined,
  currentLessonId: string | undefined,
): NeighborLessons {
  return useMemo(() => {
    if (!structure || !currentLessonId) {
      return { previous: null, next: null, ordered: [] };
    }
    const ordered = getOrderedLessons(structure);
    const idx = ordered.findIndex((l) => l.id === currentLessonId);
    return {
      ordered,
      previous: idx > 0 ? ordered[idx - 1] : null,
      next: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null,
    };
  }, [structure, currentLessonId]);
}
