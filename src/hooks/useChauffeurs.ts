'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chauffeursApi, type ChauffeurInput } from '@/lib/api/chauffeurs';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useChauffeurs() {
  return useQuery({ queryKey: QUERY_KEYS.chauffeurs.all, queryFn: chauffeursApi.list });
}

export function useCreateChauffeur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChauffeurInput) => chauffeursApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chauffeurs.all });
      toast.success('Chauffeur enregistré avec succès');
    },
  });
}
