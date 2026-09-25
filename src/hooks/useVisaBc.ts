'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  visaBcApi, type VisaBcInput, type VisaBcPieceInput, type VisaBcDecisionInput,
} from '@/lib/api/visaBc';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useVisasBc() {
  return useQuery({ queryKey: QUERY_KEYS.visaBonCommande.all, queryFn: visaBcApi.list });
}

export function useVisaBcByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.visaBonCommande.all, 'by-reference', referenceActe],
    queryFn: () => visaBcApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useVisaBcPieces(visaBcId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.visaBonCommande.detail(visaBcId), 'pieces'],
    queryFn: () => visaBcApi.pieces(visaBcId),
    enabled: Boolean(visaBcId),
  });
}

export function useCreateVisaBc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, pieces }: { input: VisaBcInput; pieces: VisaBcPieceInput[] }) =>
      visaBcApi.create(input, pieces),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.visaBonCommande.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Visa bon de commande créé avec succès', data.referenceActe);
    },
  });
}

export function useUpdateVisaBcDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visaBcId, decision }: { visaBcId: string; decision: VisaBcDecisionInput }) =>
      visaBcApi.updateVisa(visaBcId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.visaBonCommande.all });
      toast.success('Décision de visa enregistrée');
    },
  });
}
