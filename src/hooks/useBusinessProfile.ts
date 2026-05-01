import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BusinessProfileFormInput } from '@/lib/business/businessProfileSchema';
import { businessProfileRepo } from '@/lib/business/businessProfileRepo';
import { queryKeys } from './queryKeys';

export function useBusinessProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.business.profile(),
    queryFn: () => businessProfileRepo.get(),
  });

  const saveMutation = useMutation({
    mutationFn: (input: BusinessProfileFormInput) =>
      businessProfileRepo.upsert(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.business.profile(),
      });
    },
  });

  return {
    ...query,
    profile: query.data,
    saveProfile: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  };
}
