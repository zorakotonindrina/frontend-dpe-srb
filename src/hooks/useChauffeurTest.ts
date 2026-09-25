'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chauffeurTestApi, type ChauffeurTestInput } from '@/lib/api/chauffeurTest';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useChauffeurTests() {
  return useQuery({ queryKey: QUERY_KEYS.chauffeurTest.all, queryFn: chauffeurTestApi.list });
}

export function useChauffeurTestByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.chauffeurTest.all, 'by-reference', referenceActe],
    queryFn: () => chauffeurTestApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useCreateChauffeurTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChauffeurTestInput) => chauffeurTestApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chauffeurTest.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Résultat de test enregistré avec succès', data.referenceActe);
    },
  });
}

export function useUpdateChauffeurTestResultat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, resultat, observations }: { testId: string; resultat: 'APTE' | 'NON_APTE'; observations?: string }) =>
      chauffeurTestApi.updateResultat(testId, resultat, observations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chauffeurTest.all });
      toast.success('Résultat de test chauffeur enregistré');
    },
  });
}
