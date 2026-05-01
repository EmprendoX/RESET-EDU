import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateNoteInput,
  Note,
  UpdateNoteInput,
} from '@/types/notes';
import { notesRepo } from '@/lib/notes/notesRepo';
import { queryKeys } from './queryKeys';

/** Misma orden que `notesRepo.list`: pinned primero, luego `updated_at` desc. */
function sortNotesLikeRepo(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export function useNotes(args: {
  courseId: string | undefined;
  lessonId?: string;
}) {
  const queryClient = useQueryClient();
  const { courseId, lessonId } = args;

  const listQuery = useQuery({
    queryKey: queryKeys.notes.listByLesson(courseId ?? '', lessonId),
    queryFn: () =>
      notesRepo.list({ courseId: courseId!, lessonId }),
    enabled: Boolean(courseId),
  });

  function invalidate() {
    if (!courseId) return;
    queryClient.invalidateQueries({
      queryKey: ['notes', 'list', courseId],
    });
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateNoteInput) => notesRepo.create(input),
    onSuccess: (created) => {
      if (!courseId) return;
      const key = queryKeys.notes.listByLesson(courseId, lessonId);
      queryClient.setQueryData<Note[]>(key, (prev) => {
        const base = prev ?? [];
        if (base.some((n) => n.id === created.id)) {
          return sortNotesLikeRepo(
            base.map((n) => (n.id === created.id ? created : n)),
          );
        }
        return sortNotesLikeRepo([created, ...base]);
      });
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateNoteInput) => notesRepo.update(input),
    onMutate: async (input) => {
      if (!courseId) return;
      const key = queryKeys.notes.listByLesson(courseId, lessonId);
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<Note[]>(key);
      if (prev) {
        queryClient.setQueryData<Note[]>(
          key,
          prev.map((n) =>
            n.id === input.id
              ? {
                  ...n,
                  ...(input.title !== undefined ? { title: input.title } : {}),
                  ...(input.content !== undefined
                    ? { content: input.content }
                    : {}),
                  ...(input.tags !== undefined ? { tags: input.tags } : {}),
                  ...(input.is_pinned !== undefined
                    ? { is_pinned: input.is_pinned }
                    : {}),
                  updated_at: new Date().toISOString(),
                }
              : n,
          ),
        );
      }
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (!courseId || !ctx?.prev) return;
      queryClient.setQueryData(
        queryKeys.notes.listByLesson(courseId, lessonId),
        ctx.prev,
      );
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => notesRepo.remove(id),
    onMutate: async (id) => {
      if (!courseId) return;
      const key = queryKeys.notes.listByLesson(courseId, lessonId);
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<Note[]>(key);
      if (prev) {
        queryClient.setQueryData<Note[]>(
          key,
          prev.filter((n) => n.id !== id),
        );
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (!courseId || !ctx?.prev) return;
      queryClient.setQueryData(
        queryKeys.notes.listByLesson(courseId, lessonId),
        ctx.prev,
      );
    },
    onSuccess: invalidate,
  });

  const togglePinMutation = useMutation({
    mutationFn: (id: string) => notesRepo.togglePin(id),
    onSuccess: invalidate,
  });

  return {
    notes: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    createNote: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateNote: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    removeNote: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    togglePin: togglePinMutation.mutateAsync,
  };
}
