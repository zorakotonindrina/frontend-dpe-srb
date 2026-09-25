'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowApi, type WorkflowMesTachesParams } from '@/lib/api/workflow';
import type { ValiderWorkflowRequest, RessaisirDossierRequest } from '@/types/workflow.types';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useWorkflowMesTaches(params?: WorkflowMesTachesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.workflow.mesTaches(params),
    queryFn: () => workflowApi.mesTaches(params),
  });
}

function invalidateDossier(queryClient: ReturnType<typeof useQueryClient>, referenceActe: string) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.detail(referenceActe) });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workflow.all });
}

/** POST /rest/validerWorkflow — clôt la tâche courante et ouvre la suivante (avancer dans le circuit). */
export function useValiderWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ValiderWorkflowRequest) => workflowApi.validerWorkflow(request),
    onSuccess: (data, variables) => {
      if (data.erreur) { toast.error(data.erreur); return; }
      invalidateDossier(queryClient, variables.referenceActe);
      toast.success('Dossier mis à jour');
    },
  });
}

/**
 * POST /rest/ressaisirDossier — ferme la tâche courante, renseigne `motif_rejet` et réinsère une
 * tâche antérieure. Mécanisme unique pour "retourner pour complément" et "refuser" (voir décision
 * produit dans `lib/constants/workflow-etapes.ts`).
 */
export function useRessaisirDossier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RessaisirDossierRequest) => workflowApi.ressaisirDossier(request),
    onSuccess: (data, variables) => {
      if (data.erreur) { toast.error(data.erreur); return; }
      invalidateDossier(queryClient, variables.referenceActe);
      toast.success('Dossier renvoyé pour complément');
    },
  });
}
