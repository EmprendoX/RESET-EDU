export const queryKeys = {
  course: {
    structureBySlug: (slug: string) => ['course', 'structure', slug] as const,
    lesson: (slug: string, lessonId: string) =>
      ['course', 'structure', slug, 'lesson', lessonId] as const,
    firstLessonId: (slug: string) =>
      ['course', 'first-lesson-id', slug] as const,
  },
  notes: {
    listByLesson: (courseId: string, lessonId?: string) =>
      ['notes', 'list', courseId, lessonId ?? null] as const,
    listByCourse: (courseId: string) =>
      ['notes', 'list', courseId] as const,
  },
  progress: {
    listByCourse: (courseId: string) =>
      ['progress', 'list', courseId] as const,
    byLesson: (courseId: string, lessonId: string) =>
      ['progress', 'by-lesson', courseId, lessonId] as const,
  },
  ai: {
    thread: (courseId: string, lessonId?: string) =>
      ['ai', 'thread', courseId, lessonId ?? null] as const,
    messages: (threadId: string) => ['ai', 'messages', threadId] as const,
  },
  business: {
    profile: () => ['business', 'profile'] as const,
  },
  admin: {
    /** Prefix for all course lists (invalidate with this key). */
    courses: () => ['admin', 'courses'] as const,
    course: (courseId: string) => ['admin', 'course', courseId] as const,
    enrollments: () => ['admin', 'enrollments'] as const,
  },
  catalog: {
    rowsForUser: (userId: string, role: string) =>
      ['catalog', 'rows', userId, role] as const,
  },
};
