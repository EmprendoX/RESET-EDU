export type MentorMode =
  | 'class'
  | 'qna'
  | 'business_application'
  | 'summary'
  | 'action_plan'
  | 'exercise'
  | 'evaluation';

export interface AIThread {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  mode: MentorMode;
  created_at: string;
  updated_at: string;
}

export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: string;
  thread_id: string;
  role: AIMessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface MentorFileContext {
  fileName?: string;
  fileType?: 'pdf' | 'video' | 'pptx' | 'text' | 'mixed';
  page?: number;
  slide?: number;
  videoTimestamp?: number;
}

export interface MentorRequest {
  courseId: string;
  lessonId?: string;
  threadId?: string;
  userMessage: string;
  mentorMode: MentorMode;
  selectedText?: string;
  currentFileContext?: MentorFileContext;
  currentPageOrSlide?: number;
}

export interface MentorResponse {
  answer: string;
  messageId: string;
  threadId: string;
  createdAt: string;
  suggestedNoteTitle?: string;
}
