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
  let res: Response;
  try {
    res = await fetch(env.mentor.endpoint, {
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
  } catch (e) {
    throw new Error(
      'No se pudo conectar con el mentor. Revisa tu conexión a internet.',
    );
  }

  // Vite dev (puerto 5173) no sirve Netlify Functions: el SPA fallback
  // devuelve 404 con el index.html. Damos un mensaje claro para evitar
  // que el alumno crea que la app está rota.
  if (res.status === 404) {
    throw new Error(
      'Endpoint del mentor no disponible. En local arranca `netlify dev` ' +
        '(puerto 8888) en vez de `vite dev`. En producción revisa que la ' +
        'función `mentor-chat` esté desplegada.',
    );
  }

  const text = await res.text();
  let payload: MentorResponse & { error?: string };
  try {
    payload = JSON.parse(text) as MentorResponse & { error?: string };
  } catch {
    throw new Error(
      `Respuesta del mentor inválida (HTTP ${res.status}). Verifica que ` +
        '`OPENAI_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY` estén en las env ' +
        'vars del servidor.',
    );
  }

  if (!res.ok) {
    throw new Error(payload.error ?? `Error al contactar al mentor (HTTP ${res.status}).`);
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
