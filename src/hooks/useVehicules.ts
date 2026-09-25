'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { vehiculesApi, type VehiculesParams, type VehiculeInput, type VehiculeQuickInput } from '@/lib/api/vehicules';
import { mouvementsVehiculeApi } from '@/lib/api/vehiculeMouvements';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useVehicules(params?: VehiculesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicules.list(params),
    queryFn: () => vehiculesApi.list(params),
  });
}

export function useVehicule(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicules.detail(id),
    queryFn: () => vehiculesApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateVehicule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VehiculeInput) => vehiculesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicules.all });
      toast.success('Véhicule créé avec succès');
    },
  });
}

/** Création rapide (8-9 champs du canevas papier) depuis le wizard recensement — voir
 *  `VehiculeQuickAddPanel`. Pas de toast de succès ici : le composant appelant enchaîne
 *  immédiatement la sélection du véhicule créé, un toast serait redondant. */
export function useCreateVehiculeQuick() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VehiculeQuickInput) => vehiculesApi.createQuick(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicules.all });
    },
  });
}

export function useUpdateVehicule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<VehiculeInput> }) => vehiculesApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicules.all });
      toast.success('Véhicule modifié avec succès');
    },
  });
}

/** Historique mouvements/affectations — branché sur le vrai backend (voir
 *  lib/api/vehiculeMouvements.ts), même convention de clé sous-ressource que
 *  useDossierHistorique. */
export function useVehiculeHistorique(vehiculeId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.vehicules.detail(vehiculeId), 'historique'],
    queryFn: () => mouvementsVehiculeApi.historique(vehiculeId),
    enabled: Boolean(vehiculeId),
  });
}

export function useDeleteVehicule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) => vehiculesApi.remove(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicules.all });
      toast.success('Véhicule supprimé avec succès');
    },
  });
}
