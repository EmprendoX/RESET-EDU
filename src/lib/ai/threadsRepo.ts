import type { AIMessage, AIThread, MentorMode } from '@/types/ai';
import { mockMessages, mockThread } from '@/data/mockAIMessages';
import { MOCK_USER_ID } from '@/data/mockBusinessProfile';
import { demoStorage } from '@/lib/utils/storage';
import { nowIso, randomDelay, uid } from '@/lib/utils/time';

interface ThreadsState {
  threads: AIThread[];
  messagesByThread: Record<string, AIMessage[]>;
  threadByLesson: Record<string, string>;
}

const STORE_KEY = 'ai_threads:v1';

function lessonKey(courseId: string, lessonId: string) {
  return `${courseId}::${lessonId}`;
}

function defaultState(): ThreadsState {
  return {
    threads: [mockThread],
    messagesByThread: { [mockThread.id]: [...mockMessages] },
    threadByLesson: mockThread.lesson_id
      ? { [lessonKey(mockThread.course_id, mockThread.lesson_id)]: mockThread.id }
      : {},
  };
}

function load(): ThreadsState {
  return demoStorage.get<ThreadsState>(STORE_KEY, defaultState());
}

function save(state: ThreadsState): void {
  demoStorage.set(STORE_KEY, state);
}

export const threadsRepo = {
  async getOrCreateThread(args: {
    courseId: string;
    lessonId?: string;
    mode: MentorMode;
  }): Promise<AIThread> {
    await randomDelay(80, 180);
    const state = load();
    if (args.lessonId) {
      const existingId = state.threadByLesson[lessonKey(args.courseId, args.lessonId)];
      if (existingId) {
        const existing = state.threads.find((t) => t.id === existingId);
        if (existing) return existing;
      }
    }
    const thread: AIThread = {
      id: uid('thread'),
      user_id: MOCK_USER_ID,
      course_id: args.courseId,
      lesson_id: args.lessonId,
      title: 'Conversación con el mentor',
      mode: args.mode,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    state.threads.push(thread);
    state.messagesByThread[thread.id] = [];
    if (args.lessonId) {
      state.threadByLesson[lessonKey(args.courseId, args.lessonId)] = thread.id;
    }
    save(state);
    return thread;
  },

  async listMessages(threadId: string): Promise<AIMessage[]> {
    await randomDelay(80, 180);
    const state = load();
    return [...(state.messagesByThread[threadId] ?? [])];
  },

  async appendMessage(
    threadId: string,
    message: Omit<AIMessage, 'id' | 'thread_id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    },
  ): Promise<AIMessage> {
    const state = load();
    const created: AIMessage = {
      id: message.id ?? uid('msg'),
      thread_id: threadId,
      role: message.role,
      content: message.content,
      metadata: message.metadata,
      created_at: message.created_at ?? nowIso(),
    };
    state.messagesByThread[threadId] = [
      ...(state.messagesByThread[threadId] ?? []),
      created,
    ];
    const idx = state.threads.findIndex((t) => t.id === threadId);
    if (idx !== -1) {
      state.threads[idx] = { ...state.threads[idx], updated_at: nowIso() };
    }
    save(state);
    return created;
  },

  async updateThreadMode(threadId: string, mode: MentorMode): Promise<void> {
    const state = load();
    const idx = state.threads.findIndex((t) => t.id === threadId);
    if (idx !== -1) {
      state.threads[idx] = { ...state.threads[idx], mode, updated_at: nowIso() };
      save(state);
    }
  },
};
