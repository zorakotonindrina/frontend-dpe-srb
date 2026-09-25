'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportingIaApi, type StatutAnomalie } from '@/lib/api/reportingIa';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

/** Résultats de la brique IA (onglet Reporting « Prévisions IA »). Données recalculées hors ligne par `ia-siigpe` : pas de rafraîchissement auto. */
const STALE = 5 * 60 * 1000;

export function useModelesIa() {
  return useQuery({ queryKey: QUERY_KEYS.reporting.ia.modeles(), queryFn: reportingIaApi.modeles, staleTime: STALE });
}

export function usePrevisionStructures(annee?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.reporting.ia.previsionStructures(annee),
    queryFn: () => reportingIaApi.previsionStructures(annee),
    staleTime: STALE,
  });
}

export function usePrevisionVehicules(annee?: number, soa?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reporting.ia.previsionVehicules(annee, soa),
    queryFn: () => reportingIaApi.previsionVehicules(annee, soa),
    staleTime: STALE,
  });
}

export function useAnomaliesCarburant() {
  return useQuery({ queryKey: QUERY_KEYS.reporting.ia.anomalies(), queryFn: () => reportingIaApi.anomaliesCarburant(), staleTime: STALE });
}

export function useDelaisPrevus() {
  return useQuery({ queryKey: QUERY_KEYS.reporting.ia.delais(), queryFn: reportingIaApi.delais, staleTime: STALE });
}

/** Suivi d'une anomalie de carburant par un agent (NOUVELLE → VERIFIEE / JUSTIFIEE). */
export function useSuivreAnomalie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: StatutAnomalie }) => reportingIaApi.suivreAnomalie(id, statut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reporting.ia.anomalies() });
    },
    onError: () => {
      toast.error("Échec de la mise à jour de l'anomalie");
    },
  });
}

/** Téléchargement de l'Excel de prévision budgétaire (structures, véhicules, anomalies, délais, modèles). */
export function useExporterPrevisionBudgetaire() {
  return useMutation({
    mutationFn: async (annee?: number) => {
      const blob = await reportingIaApi.exporterExcel(annee);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prevision_budgetaire${annee ? `_${annee}` : ''}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error("Échec de l'export de la prévision budgétaire");
    },
  });
}
