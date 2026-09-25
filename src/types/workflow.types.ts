/**
 * Types miroir du moteur de workflow générique partagé avec AUGURE
 * (workflow.wf_activite / wf_tache_role_entite / wf_processus_activite_tache — Script.sql).
 * Contrats de requête/réponse alignés sur WorkflowController.java et
 * ProcessusActiviteTacheController.java (api-augure/api-workflow).
 */

/** workflow.wf_activite — une activité par processus (voir seed Script.sql). */
export interface WfActivite {
  activiteCode:     string;
  activiteLibelle:  string;
  processusCode:    string;
  activiteAvant:    string | null;
  activiteSuivant:  string | null;
  entiteCode:       string;
  url:              string | null;
  rang:             number;
}

/** workflow.wf_tache_role_entite — tâches ordonnées d'une activité. */
export interface WfTache {
  tacheCode:       string;
  tacheLibelle:    string;
  activiteCode:    string;
  tacheAvant:      string | null;
  tacheSuivant:    string | null;
  roleCode:        string;
  url:             string | null;
  sousEntiteCode:  string;
  rang:            number;
  page:            string | null;
  duree:           number | null;
  condition:       string | null;
}

/** workflow.wf_processus_activite_tache — pivot dossier/tâche (rôle d'historique + tâche courante). */
export interface WfProcessusActiviteTache {
  processusCode:  string;
  activiteCode:   string;
  tacheAFaire:    string;
  dateDebut:      string | null;
  dateFin:        string | null;
  referenceActe:  string;
  detenteur:      string | null;
  rang:           number;
  /** Enrichis par GET /api/dossiers/mes-taches depuis wf_tache_role_entite (absents du mock). */
  url?:           string | null;
  tacheLibelle?:  string;
}

// --------------------------------------------------------------------
// POST /rest/etapesWorkflow (ProcessusActiviteTacheController)
// --------------------------------------------------------------------

export interface EtapesWorkflowRequest {
  activiteCode:   string;
  processusCode:  string;
  referenceActe:  string;
  tacheAFaire:    string;
  dossierMotif?:  string;
  sousEntiteCode: string;
}

export interface EtapesWorkflowResponse {
  etapes: Array<{ tacheCode: string; tacheLibelle: string; rang: number; roleCode: string }>;
  rangCourant: string;
  libelleActiviteSuivant: string;
}

// --------------------------------------------------------------------
// POST /rest/validerWorkflow (WorkflowController)
// --------------------------------------------------------------------

export interface ValiderWorkflowRequest {
  referenceActe:            string;
  agentMatriculeConnected:  string;
  sousEntiteCode:           string;
  /** Numéro et date de sortie (saisis à la main après signature papier du livrable) — envoyés
   *  seulement à la clôture de l'étape ARCHIVAGE, stockés dans workflow.wf_dossier.reference_sortie/
   *  date_sortie. Optionnels : les 10 autres processus n'ont pas besoin de ces champs. */
  referenceSortie?:         string;
  dateSortie?:              string;
}

export interface ValiderWorkflowResponse {
  success?: string;
  erreur?:  string;
}

// --------------------------------------------------------------------
// POST /rest/ressaisirDossier (WorkflowController)
// --------------------------------------------------------------------

export interface RessaisirDossierRequest {
  referenceActe:            string;
  agentMatriculeConnected:  string;
  entiteCode:               string;
  sousEntiteCode:           string;
  motifRejet:               string;
}

export interface RessaisirDossierResponse {
  success?: string;
  erreur?:  string;
}

// --------------------------------------------------------------------
// POST /rest/rechercherDossierTraitement (ProcessusActiviteTacheController)
// --------------------------------------------------------------------

export interface RechercheDossierRequest {
  referenceActe:          string;
  utilisateurMatricule:   string;
  uadmConnected:          string;
  sousEntiteCode:         string;
}

export type RechercheDossierStatus =
  | 'OK' | 'DEJA_TRAITE' | 'AU_NIVEAU' | 'AUTRE_ENTITE'
  | 'PAS_DE_DROIT' | 'INEXISTANT' | 'CIRCUIT_TERMINE';

export interface RechercheDossierResponse {
  status: RechercheDossierStatus;
  dossiers?:     Array<Record<string, unknown>>;
  detenteur?:    string;
  tacheLibelle?: string;
  roleLibelle?:  string;
}
