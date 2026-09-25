import { api, ApiError } from './client';
import type {
  WfProcessusActiviteTache,
  ValiderWorkflowRequest, ValiderWorkflowResponse,
  RessaisirDossierRequest, RessaisirDossierResponse,
} from '@/types/workflow.types';

export interface WorkflowMesTachesParams {
  roleCode?: string;
}

function erreurDe(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Erreur réseau';
}

/**
 * Branché sur le vrai backend `api-workflow` (DossierController). Le rôle/matricule appelant est
 * résolu côté serveur depuis le JWT (headers "id"/"role" injectés par la gateway) — les champs
 * `agentMatriculeConnected`/`sousEntiteCode`/`entiteCode` des requêtes ne sont plus transmis,
 * conservés dans les types (`workflow.types.ts`) uniquement pour ne pas casser les appelants
 * existants (`useWorkflow.ts`).
 */
export const workflowApi = {
  /**
   * POST /{ref}/valider — ferme la tâche courante et ouvre la suivante (ou clôture le circuit si
   * `cloture` est vrai). Un rôle non autorisé renvoie 403 (DossierService.verifierRoleAutorise),
   * mappé ici en `erreur` plutôt que de laisser l'exception remonter jusqu'au composant.
   */
  async validerWorkflow(request: ValiderWorkflowRequest): Promise<ValiderWorkflowResponse> {
    try {
      const body: Record<string, string> = {};
      if (request.referenceSortie) body.referenceSortie = request.referenceSortie;
      if (request.dateSortie) body.dateSortie = request.dateSortie;
      await api.post(`/api-workflow/api/dossiers/${encodeURIComponent(request.referenceActe)}/valider`, body);
      return { success: 'OK' };
    } catch (e) {
      return { erreur: erreurDe(e) };
    }
  },

  /** POST /{ref}/retourner-complement — ferme la tâche courante, pose `motif_rejet` et rouvre
   *  l'étape précédente (mécanisme unique "retour pour complément"/"refus", voir DossierService). */
  async ressaisirDossier(request: RessaisirDossierRequest): Promise<RessaisirDossierResponse> {
    try {
      await api.post(`/api-workflow/api/dossiers/${encodeURIComponent(request.referenceActe)}/retourner-complement`,
        { motifRejet: request.motifRejet });
      return { success: 'OK' };
    } catch (e) {
      return { erreur: erreurDe(e) };
    }
  },

  /** GET /api/dossiers/mes-taches — tâches ouvertes des 11 processus VA_* autorisées pour le rôle
   *  du JWT courant (`params.roleCode` n'est plus transmis, cf. commentaire de tête de fichier). */
  async mesTaches(_params?: WorkflowMesTachesParams): Promise<WfProcessusActiviteTache[]> {
    return api.get<WfProcessusActiviteTache[]>('/api-workflow/api/dossiers/mes-taches');
  },
};
