import type { AIMessage, AIThread, MentorMode } from '@/types/ai';
import type { SupabaseClient } from '@supabase/supabase-js';
import { nowIso } from '@/lib/utils/time';

type ThreadRow = {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  mode: MentorMode;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  thread_id: string;
  role: AIMessage['role'];
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function mapThread(r: ThreadRow): AIThread {
  return {
    id: r.id,
    user_id: r.user_id,
    course_id: r.course_id,
    lesson_id: r.lesson_id ?? undefined,
    title: r.title,
    mode: r.mode,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function mapMessage(r: MessageRow): AIMessage {
  return {
    id: r.id,
    thread_id: r.thread_id,
    role: r.role,
    content: r.content,
    metadata: r.metadata ?? undefined,
    created_at: r.created_at,
  };
}

export const threadsRepoSupabase = {
  async getOrCreateThread(
    sb: SupabaseClient,
    args: { courseId: string; lessonId?: string; mode: MentorMode },
  ): Promise<AIThread> {
    const {
      data: { user },
      error: userErr,
    } = await sb.auth.getUser();
    if (userErr || !user) throw new Error('Sesión no válida.');

    let q = sb
      .from('ai_threads')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', args.courseId);

    if (args.lessonId) {
      q = q.eq('lesson_id', args.lessonId);
    } else {
      q = q.is('lesson_id', null);
    }

    const { data: rows, error: selErr } = await q
      .order('updated_at', { ascending: false })
      .limit(1);

    if (selErr) throw selErr;
    const existing = rows?.[0] as ThreadRow | undefined;
    if (existing) return mapThread(existing);

    const { data: created, error: insErr } = await sb
      .from('ai_threads')
      .insert({
        user_id: user.id,
        course_id: args.courseId,
        lesson_id: args.lessonId ?? null,
        title: 'Conversación con el mentor',
        mode: args.mode,
      })
      .select('*')
      .single();

    if (insErr) throw insErr;
    return mapThread(created as ThreadRow);
  },

  async listMessages(sb: SupabaseClient, threadId: string): Promise<AIMessage[]> {
    const { data, error } = await sb
      .from('ai_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as MessageRow[]).map(mapMessage);
  },

  async appendMessage(
    sb: SupabaseClient,
    threadId: string,
    message: Omit<AIMessage, 'id' | 'thread_id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    },
  ): Promise<AIMessage> {
    const { data: created, error } = await sb
      .from('ai_messages')
      .insert({
        thread_id: threadId,
        role: message.role,
        content: message.content,
        metadata: message.metadata ?? null,
      })
      .select('*')
      .single();

    if (error) throw error;
    await sb
      .from('ai_threads')
      .update({ updated_at: nowIso() })
      .eq('id', threadId);

    return mapMessage(created as MessageRow);
  },

  async updateThreadMode(
    sb: SupabaseClient,
    threadId: string,
    mode: MentorMode,
  ): Promise<void> {
    const { error } = await sb
      .from('ai_threads')
      .update({ mode, updated_at: nowIso() })
      .eq('id', threadId);
    if (error) throw error;
  },
};
