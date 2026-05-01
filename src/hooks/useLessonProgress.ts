import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LessonProgress } from '@/types/lesson';
import { progressRepo } from '@/lib/progress/progressRepo';
import { queryKeys } from './queryKeys';

export function useCourseProgress(courseId: string | undefined) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.progress.listByCourse(courseId ?? ''),
    queryFn: () => progressRepo.listForCourse(courseId!),
    enabled: Boolean(courseId),
  });

  const progressByLessonId = useMemo(() => {
    const map = new Map<string, LessonProgress>();
    (listQuery.data ?? []).forEach((p) => {
      map.set(p.lesson_id, p);
    });
    return map;
  }, [listQuery.data]);

  function invalidate() {
    if (!courseId) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.progress.listByCourse(courseId),
    });
  }

  const markStartedMutation = useMutation({
    mutationFn: (lessonId: string) =>
      progressRepo.markStarted({ courseId: courseId!, lessonId }),
    onSuccess: invalidate,
  });

  const markCompletedMutation = useMutation({
    mutationFn: (lessonId: string) =>
      progressRepo.markCompleted({ courseId: courseId!, lessonId }),
    onSuccess: invalidate,
  });

  const resetLessonMutation = useMutation({
    mutationFn: (lessonId: string) =>
      progressRepo.resetLesson({ courseId: courseId!, lessonId }),
    onSuccess: invalidate,
  });

  return {
    progressList: listQuery.data ?? [],
    progressByLessonId,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    markStarted: markStartedMutation.mutateAsync,
    markCompleted: markCompletedMutation.mutateAsync,
    isCompleting: markCompletedMutation.isPending,
    resetLesson: resetLessonMutation.mutateAsync,
  };
}

export function computeCoursePercentage(
  totalLessons: number,
  completedCount: number,
): number {
  if (totalLessons <= 0) return 0;
  return Math.round((completedCount / totalLessons) * 100);
}
