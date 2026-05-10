import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Note, UpdateNoteInput } from '@/types/notes';
import { notesRepo } from '@/lib/notes/notesRepo';
import { queryKeys } from './queryKeys';

/**
 * FR-017 — Notas globales del alumno (`/notas` y `/notas/:courseId`).
 * Reusa `notesRepo.listAllForUser` y `listAllForCourse`. No reemplaza
 * a `useNotes`, que sigue siendo el hook de la lección.
 */
export function useNotesGlobal(args: { courseId?: string } = {}) {
  const queryClient = useQueryClient();
  const { courseId } = args;

  const queryKey = courseId
    ? queryKeys.notes.listByCourse(courseId)
    : queryKeys.notes.listAll();

  const listQuery = useQuery({
    queryKey,
    queryFn: () =>
      courseId
        ? notesRepo.listAllForCourse(courseId)
        : notesRepo.listAllForUser(),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  }

  const updateMutation = useMutation({
    mutationFn: (input: UpdateNoteInput) => notesRepo.update(input),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => notesRepo.remove(id),
    onSuccess: invalidate,
  });

  const togglePinMutation = useMutation({
    mutationFn: (id: string) => notesRepo.togglePin(id),
    onSuccess: invalidate,
  });

  const sorted = useMemo<Note[]>(() => {
    const list = listQuery.data ?? [];
    return [...list].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return b.updated_at.localeCompare(a.updated_at);
    });
  }, [listQuery.data]);

  return {
    notes: sorted,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    updateNote: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    removeNote: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    togglePin: togglePinMutation.mutateAsync,
  };
}
