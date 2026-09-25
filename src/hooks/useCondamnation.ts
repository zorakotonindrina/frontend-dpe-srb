'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { condamnationApi, type CondamnationInput } from '@/lib/api/condamnation';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useEvaluationsCondamnation() {
  return useQuery({ queryKey: QUERY_KEYS.condamnation.all, queryFn: condamnationApi.list });
}

export function useCondamnationByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.condamnation.all, 'by-reference', referenceActe],
    queryFn: () => condamnationApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

/** Fiche complète (avec la grille de prix) du dossier — onglet Condamnation et aperçus des PV. */
export function useCondamnationComplet(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.condamnation.all, 'complet', referenceActe],
    queryFn: () => condamnationApi.getCompletByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useCreateCondamnation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CondamnationInput) => condamnationApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.condamnation.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Évaluation créée avec succès', data.referenceActe);
    },
  });
}

export function useValiderCondamnation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (evaluationId: string) => condamnationApi.valider(evaluationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.condamnation.all }),
  });
}
