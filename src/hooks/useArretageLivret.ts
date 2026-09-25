'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  arretageLivretApi, type ArretageLivretInput, type ArretageFeuilles,
} from '@/lib/api/arretageLivret';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useArretagesLivret() {
  return useQuery({ queryKey: QUERY_KEYS.arretageLivret.all, queryFn: arretageLivretApi.list });
}

export function useArretageLivretByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.arretageLivret.all, 'by-reference', referenceActe],
    queryFn: () => arretageLivretApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

/** Arrêtage + lignes des 5 feuilles de livret + ancien détail plat (dossiers antérieurs). */
export function useArretageLivretComplet(arretageId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.arretageLivret.detail(arretageId), 'complet'],
    queryFn: () => arretageLivretApi.complet(arretageId),
    enabled: Boolean(arretageId),
  });
}

export function useCreateArretageLivret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, feuilles }: { input: ArretageLivretInput; feuilles: ArretageFeuilles }) =>
      arretageLivretApi.create(input, feuilles),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.arretageLivret.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Arrêtage livret créé avec succès', data.referenceActe);
    },
  });
}

export function useValiderArretageLivret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (arretageId: string) => arretageLivretApi.valider(arretageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.arretageLivret.all }),
  });
}

export function useUpdateArretageLivret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ arretageId, ...patch }: { arretageId: string; numeroArretage: string; dateArretage: string }) =>
      arretageLivretApi.updateArretage(arretageId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.arretageLivret.all });
      toast.success('Arrêtage mis à jour');
    },
  });
}
