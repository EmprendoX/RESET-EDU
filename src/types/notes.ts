export type NoteSource = 'manual' | 'ai' | 'selection';

export interface SelectionMeta {
  sourceType: 'pdf' | 'text' | 'video' | 'ai';
  page?: number;
  slide?: number;
  videoTimestamp?: number;
  fileName?: string;
}

export interface Note {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  source: NoteSource;
  selection_meta?: SelectionMeta;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  course_id: string;
  lesson_id?: string;
  title: string;
  content: string;
  tags?: string[];
  source: NoteSource;
  selection_meta?: SelectionMeta;
}

export interface UpdateNoteInput {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  is_pinned?: boolean;
}
