import type {
  LessonProgress,
  LessonProgressStatus,
} from '@/types/lesson';
import { MOCK_USER_ID } from '@/data/mockBusinessProfile';
import { demoStorage } from '@/lib/utils/storage';
import { nowIso, randomDelay, uid } from '@/lib/utils/time';

const STORE_KEY = 'progress:v1';

type ProgressMap = Record<string, LessonProgress>;

function progressKey(courseId: string, lessonId: string) {
  return `${courseId}::${lessonId}`;
}

function loadAll(): ProgressMap {
  return demoStorage.get<ProgressMap>(STORE_KEY, {});
}

function saveAll(map: ProgressMap): void {
  demoStorage.set(STORE_KEY, map);
}

function makeProgress(
  courseId: string,
  lessonId: string,
  status: LessonProgressStatus,
  percentage: number,
  existing?: LessonProgress,
): LessonProgress {
  return {
    id: existing?.id ?? uid('lp'),
    user_id: MOCK_USER_ID,
    course_id: courseId,
    lesson_id: lessonId,
    status,
    progress_percentage: percentage,
    last_opened_at: nowIso(),
    completed_at:
      status === 'completed' ? nowIso() : existing?.completed_at,
  };
}

export const progressRepo = {
  async listForCourse(courseId: string): Promise<LessonProgress[]> {
    await randomDelay(100, 220);
    const map = loadAll();
    return Object.values(map).filter((p) => p.course_id === courseId);
  },

  /**
   * Returns the most recently opened lesson for the given course, if any.
   * Useful when navigating to `/aprender/:slug` without a lessonId.
   */
  async getLastOpenedLessonId(courseId: string): Promise<string | null> {
    const map = loadAll();
    const entries = Object.values(map).filter((p) => p.course_id === courseId);
    if (entries.length === 0) return null;
    const sorted = entries.sort((a, b) =>
      b.last_opened_at.localeCompare(a.last_opened_at),
    );
    return sorted[0]?.lesson_id ?? null;
  },

  async getForLesson(args: {
    courseId: string;
    lessonId: string;
  }): Promise<LessonProgress | null> {
    await randomDelay(80, 180);
    const map = loadAll();
    return map[progressKey(args.courseId, args.lessonId)] ?? null;
  },

  async markStarted(args: {
    courseId: string;
    lessonId: string;
  }): Promise<LessonProgress> {
    await randomDelay(120, 220);
    const map = loadAll();
    const k = progressKey(args.courseId, args.lessonId);
    const existing = map[k];
    if (existing && existing.status === 'completed') {
      const updated: LessonProgress = {
        ...existing,
        last_opened_at: nowIso(),
      };
      map[k] = updated;
      saveAll(map);
      return updated;
    }
    const next = makeProgress(
      args.courseId,
      args.lessonId,
      'started',
      Math.max(existing?.progress_percentage ?? 25, 25),
      existing,
    );
    map[k] = next;
    saveAll(map);
    return next;
  },

  async markCompleted(args: {
    courseId: string;
    lessonId: string;
  }): Promise<LessonProgress> {
    await randomDelay(120, 250);
    const map = loadAll();
    const k = progressKey(args.courseId, args.lessonId);
    const next = makeProgress(
      args.courseId,
      args.lessonId,
      'completed',
      100,
      map[k],
    );
    map[k] = next;
    saveAll(map);
    return next;
  },

  async resetLesson(args: {
    courseId: string;
    lessonId: string;
  }): Promise<void> {
    await randomDelay(80, 150);
    const map = loadAll();
    delete map[progressKey(args.courseId, args.lessonId)];
    saveAll(map);
  },
};
