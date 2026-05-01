import type { CourseStatus, CourseLevel, StructureType } from './course';
import type { FileType, LessonStatus } from './lesson';

export type AdminCourseFilterStatus = 'all' | CourseStatus;

export type AdminCourseListSort = 'updated_desc' | 'title_asc' | 'created_desc';

export interface AdminCourseListFilters {
  search: string;
  status: AdminCourseFilterStatus;
  sort: AdminCourseListSort;
}

export interface CourseMetadataFormValues {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  level: CourseLevel;
  cover_image_url: string;
  structure_type: StructureType;
  status: CourseStatus;
  is_featured: boolean;
  is_free: boolean;
  price: string;
  ai_context: string;
}

export interface LessonFormValues {
  title: string;
  description: string;
  content_text: string;
  ai_context: string;
  video_url: string;
  pdf_url: string;
  file_url: string;
  file_type: FileType;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
  status: LessonStatus;
}

export interface ReorderIndexEntry {
  id: string;
  order_index: number;
}

export type PublishValidationSeverity = 'error' | 'warning';

export interface PublishValidationIssue {
  code: string;
  message: string;
  severity: PublishValidationSeverity;
}

export interface AdminCourseListItemMeta {
  id: string;
  slug: string;
  title: string;
  status: CourseStatus;
  structure_type: StructureType;
  lessonCount: number;
  updated_at: string;
}
