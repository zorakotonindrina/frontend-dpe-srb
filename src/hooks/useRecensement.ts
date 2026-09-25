'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recensementApi, type RecensementInput, type RecensementLigneInput } from '@/lib/api/recensement';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useRecensements() {
  return useQuery({ queryKey: QUERY_KEYS.recensement.all, queryFn: recensementApi.list });
}

export function useRecensement(id: string) {
  return useQuery({ queryKey: QUERY_KEYS.recensement.detail(id), queryFn: () => recensementApi.get(id), enabled: Boolean(id) });
}

export function useRecensementByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.recensement.all, 'by-reference', referenceActe],
    queryFn: () => recensementApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useRecensementLignes(recensementId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.recensement.detail(recensementId), 'lignes'],
    queryFn: () => recensementApi.lignes(recensementId),
    enabled: Boolean(recensementId),
  });
}

/** Dernier état connu (campagne de recensement la plus récente, actif=1) d'un véhicule — réutilisé
 *  tel quel par l'écran Constatation technique pour confronter la STRUCTURE saisie au SOA du
 *  dernier recensement du véhicule (voir processus/constatation-technique/nouveau/page.tsx). */
export function useDernierEtatVehicule(vehiculeId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.recensement.all, 'dernier-etat', vehiculeId],
    queryFn: () => recensementApi.dernierEtat(vehiculeId),
    enabled: Boolean(vehiculeId),
  });
}

export function useCreateRecensement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, lignes }: { input: RecensementInput; lignes: RecensementLigneInput[] }) =>
      recensementApi.create(input, lignes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recensement.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Recensement créé avec succès', data.referenceActe);
    },
  });
}

/** PATCH .../valider — appelé à la génération du quitus (dossiers/detail/page.tsx), le seul
 *  endroit où cette validation métier (statut ts_recensement → 'V') a un sens naturel. */
export function useValiderRecensement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recensementId: string) => recensementApi.valider(recensementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recensement.all });
    },
  });
}
