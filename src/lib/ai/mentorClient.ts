import type { MentorRequest, MentorResponse } from '@/types/ai';
import { env } from '@/config/env';
import { businessProfileRepo } from '@/lib/business/businessProfileRepo';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { nowIso, randomDelay, uid } from '@/lib/utils/time';
import { getMockMentorAnswer } from './prompts';

function shouldCallLiveMentor(): boolean {
  const sb = getSupabase();
  return Boolean(
    isSupabaseConfigured() && sb && env.useSupabaseData && env.useMentorApi,
  );
}

async function postMentorChat(
  request: MentorRequest,
  accessToken: string,
): Promise<MentorResponse> {
  const res = await fetch(env.mentor.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      courseId: request.courseId,
      lessonId: request.lessonId,
      threadId: request.threadId,
      userMessage: request.userMessage,
      mentorMode: request.mentorMode,
      selectedText: request.selectedText,
      currentFileContext: request.currentFileContext,
    }),
  });

  const text = await res.text();
  let payload: MentorResponse & { error?: string };
  try {
    payload = JSON.parse(text) as MentorResponse & { error?: string };
  } catch {
    throw new Error('Respuesta del mentor inválida.');
  }

  if (!res.ok) {
    throw new Error(payload.error ?? 'Error al contactar al mentor.');
  }
  if (!payload.answer || !payload.threadId) {
    throw new Error('Respuesta incompleta del mentor.');
  }

  return {
    answer: payload.answer,
    messageId: payload.messageId,
    threadId: payload.threadId,
    createdAt: payload.createdAt,
    suggestedNoteTitle: payload.suggestedNoteTitle,
  };
}

/**
 * Mentor client adapter: mock local o `/.netlify/functions/mentor-chat` si
 * `VITE_USE_SUPABASE_DATA` y `VITE_USE_MENTOR_API` están activos.
 */
export async function sendMentorMessage(
  request: MentorRequest,
): Promise<MentorResponse> {
  if (shouldCallLiveMentor()) {
    const token = request.accessToken?.trim();
    if (!token) {
      throw new Error('Inicia sesión para usar al mentor.');
    }
    return postMentorChat(request, token);
  }

  await randomDelay(700, 1400);

  const profile = await businessProfileRepo.get();
  const { answer, suggestedNoteTitle } = getMockMentorAnswer({
    mode: request.mentorMode,
    userMessage: request.userMessage,
    selectedText: request.selectedText,
    businessName: profile.business_name,
  });

  return {
    answer,
    messageId: uid('msg'),
    threadId: request.threadId ?? uid('thread'),
    createdAt: nowIso(),
    suggestedNoteTitle,
  };
}
