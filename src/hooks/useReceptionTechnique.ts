'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  receptionTechniqueApi, type ReceptionTechniqueInput, type ReceptionConstatInput,
} from '@/lib/api/receptionTechnique';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useReceptionsTechniques() {
  return useQuery({ queryKey: QUERY_KEYS.receptionTechnique.all, queryFn: receptionTechniqueApi.list });
}

export function useReceptionTechniqueByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.receptionTechnique.all, 'by-reference', referenceActe],
    queryFn: () => receptionTechniqueApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useReceptionConstats(receptionId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.receptionTechnique.detail(receptionId), 'constats'],
    queryFn: () => receptionTechniqueApi.constats(receptionId),
    enabled: Boolean(receptionId),
  });
}

export function useCreateReceptionTechnique() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, constats }: { input: ReceptionTechniqueInput; constats: ReceptionConstatInput[] }) =>
      receptionTechniqueApi.create(input, constats),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receptionTechnique.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Réception technique créée avec succès', data.referenceActe);
    },
  });
}

export function useUpdateReceptionAvis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ receptionId, avis }: { receptionId: string; avis: 'FAVORABLE' | 'DEFAVORABLE' }) =>
      receptionTechniqueApi.updateAvis(receptionId, avis),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receptionTechnique.all });
      toast.success('Avis de réception enregistré');
    },
  });
}
