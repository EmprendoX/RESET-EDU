export type FileType =
  | 'pdf'
  | 'video'
  | 'pptx'
  | 'text'
  | 'mixed'
  | 'unsupported';

export type LessonStatus = 'draft' | 'published';

export type LessonProgressStatus = 'not_started' | 'started' | 'completed';

export interface Lesson {
  id: string;
  course_id: string;
  module_id?: string;
  section_id?: string;
  title: string;
  description: string;
  content_text?: string;
  ai_context?: string;
  video_url?: string;
  pdf_url?: string;
  file_url?: string;
  file_type: FileType;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
  status: LessonStatus;
}

export interface LessonAsset {
  id: string;
  lesson_id: string;
  course_id: string;
  file_name: string;
  file_type: FileType;
  file_url: string;
  storage_path: string;
  visibility: 'public' | 'private';
}

export interface LessonProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  progress_percentage: number;
  last_opened_at: string;
  completed_at?: string;
}
