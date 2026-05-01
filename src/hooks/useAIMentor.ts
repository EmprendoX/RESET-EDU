import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AIMessage, MentorMode, MentorRequest } from '@/types/ai';
import { sendMentorMessage } from '@/lib/ai/mentorClient';
import { threadsRepo } from '@/lib/ai/threadsRepo';
import { nowIso, uid } from '@/lib/utils/time';
import { useClassroomStore } from '@/stores/useClassroomStore';
import { queryKeys } from './queryKeys';

interface Args {
  courseId: string | undefined;
  lessonId: string | undefined;
  fileContext?: MentorRequest['currentFileContext'];
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
      const userMessage: AIMessage = {
        id: uid('msg'),
        thread_id: threadId,
        role: 'user',
        content: params.userMessage,
        created_at: nowIso(),
      };
      setMessages((prev) => [...prev, userMessage]);
      await threadsRepo.appendMessage(threadId, {
        role: 'user',
        content: params.userMessage,
      });

      setIsStreaming(true);
      try {
        const response = await sendMentorMessage({
          courseId,
          lessonId,
          threadId,
          userMessage: params.userMessage,
          mentorMode: params.mode ?? aiMode,
          selectedText: params.selectedText,
          currentFileContext: fileContext,
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
        setMessages((prev) => [...prev, assistantMessage]);
        await threadsRepo.appendMessage(threadId, {
          role: 'assistant',
          content: response.answer,
          id: response.messageId,
          created_at: response.createdAt,
          metadata: assistantMessage.metadata,
        });

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
    lastSuggestedTitle,
  };
}
