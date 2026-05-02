import type { Lesson } from './lesson';

export type StructureType = 'linear' | 'modular';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  cover_image_url: string;
  category: string;
  level: CourseLevel;
  structure_type: StructureType;
  status: CourseStatus;
  is_featured: boolean;
  is_free: boolean;
  price?: number;
  ai_context: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
}

export interface CourseSection {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
}

export interface CourseStructure {
  course: Course;
  modules: CourseModule[];
  sections: CourseSection[];
  lessons: Lesson[];
}

/** Resumen para catálogo alumno / dashboard (lectura). */
export interface PublishedCourseSummary {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  cover_image_url: string;
  lessonCount: number;
}

/** Catálogo publicado con flag de acceso al aula (enrollment / gratis / rol admin). */
export interface PublishedCatalogRow extends PublishedCourseSummary {
  hasAccess: boolean;
}
