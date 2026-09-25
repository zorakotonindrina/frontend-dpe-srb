'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receptionNeufApi, type ReceptionNeufInput, type ReceptionNeufLigneInput } from '@/lib/api/receptionNeuf';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useReceptionsNeuf() {
  return useQuery({ queryKey: QUERY_KEYS.receptionVaNeuf.all, queryFn: receptionNeufApi.list });
}

export function useReceptionNeufByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.receptionVaNeuf.all, 'by-reference', referenceActe],
    queryFn: () => receptionNeufApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useReceptionNeufLignes(receptionNeufId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.receptionVaNeuf.detail(receptionNeufId), 'lignes'],
    queryFn: () => receptionNeufApi.lignes(receptionNeufId),
    enabled: Boolean(receptionNeufId),
  });
}

export function useValiderReceptionNeuf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receptionNeufId: string) => receptionNeufApi.valider(receptionNeufId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receptionVaNeuf.all }),
  });
}

export function useCreateReceptionNeuf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, lignes }: { input: ReceptionNeufInput; lignes: ReceptionNeufLigneInput[] }) =>
      receptionNeufApi.create(input, lignes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receptionVaNeuf.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Réception VA neuf créée avec succès', data.referenceActe);
    },
  });
}
