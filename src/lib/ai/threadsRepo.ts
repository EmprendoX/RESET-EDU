import type { AIMessage, MentorMode } from '@/types/ai';
import { env } from '@/config/env';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { threadsRepoLocal } from '@/lib/ai/threadsRepoLocal';
import { threadsRepoSupabase } from '@/lib/ai/threadsRepoSupabase';

function threadsAreRemote(): boolean {
  const sb = getSupabase();
  return Boolean(
    isSupabaseConfigured() &&
      sb &&
      env.useSupabaseData &&
      env.useMentorApi,
  );
}

export const threadsRepo = {
  async getOrCreateThread(args: {
    courseId: string;
    lessonId?: string;
    mode: MentorMode;
  }) {
    if (threadsAreRemote()) {
      return threadsRepoSupabase.getOrCreateThread(getSupabase()!, args);
    }
    return threadsRepoLocal.getOrCreateThread(args);
  },

  async listMessages(threadId: string): Promise<AIMessage[]> {
    if (threadsAreRemote()) {
      return threadsRepoSupabase.listMessages(getSupabase()!, threadId);
    }
    return threadsRepoLocal.listMessages(threadId);
  },

  async appendMessage(
    threadId: string,
    message: Omit<AIMessage, 'id' | 'thread_id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    },
  ): Promise<AIMessage> {
    if (threadsAreRemote()) {
      return threadsRepoSupabase.appendMessage(
        getSupabase()!,
        threadId,
        message,
      );
    }
    return threadsRepoLocal.appendMessage(threadId, message);
  },

  async updateThreadMode(threadId: string, mode: MentorMode): Promise<void> {
    if (threadsAreRemote()) {
      return threadsRepoSupabase.updateThreadMode(getSupabase()!, threadId, mode);
    }
    return threadsRepoLocal.updateThreadMode(threadId, mode);
  },
};
