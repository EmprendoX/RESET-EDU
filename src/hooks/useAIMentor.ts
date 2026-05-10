import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AIMessage, MentorFileContext, MentorMode } from '@/types/ai';
import { sendMentorMessage } from '@/lib/ai/mentorClient';
import { threadsRepo } from '@/lib/ai/threadsRepo';
import { env } from '@/config/env';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { nowIso, uid } from '@/lib/utils/time';
import { useClassroomStore } from '@/stores/useClassroomStore';
import { queryKeys } from './queryKeys';

function mentorUsesLiveApi(): boolean {
  const sb = getSupabase();
  return Boolean(
    isSupabaseConfigured() && sb && env.useSupabaseData && env.useMentorApi,
  );
}

interface Args {
  courseId: string | undefined;
  lessonId: string | undefined;
  fileContext?: MentorFileContext;
}

export function useAIMentor({ courseId, lessonId, fileContext }: Args) {
  const queryClient = useQueryClient();
  const aiMode = useClassroomStore((s) => s.aiMode);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastSuggestedTitle, setLastSuggestedTitle] = useState<
    string | undefined
  >(undefined);

  const threadQuery = useQuery({
    queryKey: queryKeys.ai.thread(courseId ?? '', lessonId),
    queryFn: () =>
      threadsRepo.getOrCreateThread({
        courseId: courseId!,
        lessonId,
        mode: aiMode,
      }),
    enabled: Boolean(courseId),
  });

  const threadId = threadQuery.data?.id;

  const messagesQuery = useQuery({
    queryKey: queryKeys.ai.messages(threadId ?? ''),
    queryFn: () => threadsRepo.listMessages(threadId!),
    enabled: Boolean(threadId),
  });

  const setMessages = useCallback(
    (updater: (prev: AIMessage[]) => AIMessage[]) => {
      if (!threadId) return;
      const key = queryKeys.ai.messages(threadId);
      const prev = queryClient.getQueryData<AIMessage[]>(key) ?? [];
      queryClient.setQueryData<AIMessage[]>(key, updater(prev));
    },
    [queryClient, threadId],
  );

  const sendMutation = useMutation({
    mutationFn: async (params: {
      userMessage: string;
      mode?: MentorMode;
      selectedText?: string;
    }) => {
      if (!courseId || !threadId) {
        throw new Error('AI mentor: missing courseId/threadId');
      }
      const useApi = mentorUsesLiveApi();

      const userMessage: AIMessage = {
        id: uid('msg'),
        thread_id: threadId,
        role: 'user',
        content: params.userMessage,
        created_at: nowIso(),
      };

      // Optimistic: el mensaje del alumno se muestra de inmediato en ambos
      // modos. En mock también lo persistimos local; en api lo persiste el
      // backend al recibirlo (mentor-chat.ts) y se refresca al refetch.
      setMessages((prev) => [...prev, userMessage]);
      if (!useApi) {
        await threadsRepo.appendMessage(threadId, {
          role: 'user',
          content: params.userMessage,
        });
      }

      setIsStreaming(true);
      try {
        let accessToken: string | undefined;
        if (useApi) {
          const { data } = await getSupabase()!.auth.getSession();
          accessToken = data.session?.access_token;
        }

        const response = await sendMentorMessage({
          courseId,
          lessonId,
          threadId,
          userMessage: params.userMessage,
          mentorMode: params.mode ?? aiMode,
          selectedText: params.selectedText,
          currentFileContext: fileContext,
          accessToken,
        });

        const assistantMessage: AIMessage = {
          id: response.messageId,
          thread_id: response.threadId,
          role: 'assistant',
          content: response.answer,
          created_at: response.createdAt,
          metadata: response.suggestedNoteTitle
            ? { suggestedNoteTitle: response.suggestedNoteTitle }
            : undefined,
        };

        if (!useApi) {
          setMessages((prev) => [...prev, assistantMessage]);
          await threadsRepo.appendMessage(threadId, {
            role: 'assistant',
            content: response.answer,
            id: response.messageId,
            created_at: response.createdAt,
            metadata: assistantMessage.metadata,
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.ai.messages(threadId),
          });
        }

        if (params.mode && params.mode !== aiMode) {
          await threadsRepo.updateThreadMode(threadId, params.mode);
        }

        setLastSuggestedTitle(response.suggestedNoteTitle);
        return assistantMessage;
      } finally {
        setIsStreaming(false);
      }
    },
  });

  const sendError =
    sendMutation.error instanceof Error
      ? sendMutation.error.message
      : sendMutation.error
        ? 'No se pudo enviar el mensaje al mentor.'
        : null;

  return {
    thread: threadQuery.data,
    messages: messagesQuery.data ?? [],
    isLoadingMessages: messagesQuery.isLoading,
    isError: messagesQuery.isError || threadQuery.isError,
    isStreaming,
    sendMessage: (params: {
      userMessage: string;
      mode?: MentorMode;
      selectedText?: string;
    }) => sendMutation.mutateAsync(params),
    sendError,
    resetSendError: () => sendMutation.reset(),
    lastSuggestedTitle,
  };
}
