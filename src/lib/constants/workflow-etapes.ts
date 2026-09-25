/** Chaîne générique du moteur de workflow (conception_finale_complete.md §4, §7.5, §12.2). */
export const WORKFLOW_ETAPES = [
  'DEPOT_DOSSIER',
  'CONTROLE_PIECES',
  'TRAITEMENT_TECHNIQUE',
  'VISA_VALIDATION',
  'EDITION_LIVRABLE',
  'ARCHIVAGE',
] as const;

export type EtapeCode = (typeof WORKFLOW_ETAPES)[number];

/**
 * `returned` : la tâche courante a déjà été dépassée puis renvoyée en arrière via `ressaisirDossier`
 * (motif de rejet renseigné sur `wf_dossier.motif_rejet`) — modèle AUGURE : un seul mécanisme de
 * ressaisie, pas d'état "refusé" terminal distinct (voir décision produit).
 */
export type EtapeNodeState = 'done' | 'active' | 'pending' | 'returned';

export interface WorkflowState {
  etapeStates: Record<EtapeCode, EtapeNodeState>;
}

function fill(state: EtapeNodeState): Record<EtapeCode, EtapeNodeState> {
  return WORKFLOW_ETAPES.reduce(
    (acc, etape) => ({ ...acc, [etape]: state }),
    {} as Record<EtapeCode, EtapeNodeState>,
  );
}

/** Marque les étapes avant `activeIndex` comme `done` et l'étape à `activeIndex` avec `activeState`. */
function upTo(activeIndex: number, activeState: EtapeNodeState): Record<EtapeCode, EtapeNodeState> {
  const states = fill('pending');
  WORKFLOW_ETAPES.forEach((etape, index) => {
    if (index < activeIndex) states[etape] = 'done';
    if (index === activeIndex) states[etape] = activeState;
  });
  return states;
}

/**
 * Dérive l'état visuel des 6 étapes génériques à partir du code de la tâche
 * `wf_processus_activite_tache` réellement ouverte pour ce dossier (`date_fin IS NULL`,
 * champ `tache_a_faire`), obtenue via `dossiersApi.get()` (le backend la calcule déjà).
 * `etapeCode === null` signifie qu'aucune tâche n'est ouverte : le circuit est terminé (toutes
 * les tâches sont closes) — un dossier existant sans tâche ouverte ne peut être qu'à ce stade,
 * la création (`initWorkflow`) posant toujours au moins une tâche ouverte.
 */
export function deriveWorkflowState(etapeCode: EtapeCode | null, motifRejet?: string | null): WorkflowState {
  if (!etapeCode) {
    return { etapeStates: fill('done') };
  }
  const activeIndex = WORKFLOW_ETAPES.indexOf(etapeCode);
  const activeState: EtapeNodeState = motifRejet ? 'returned' : 'active';
  return { etapeStates: upTo(activeIndex, activeState) };
}

/** Étape actuellement actionnable (active ou retournée), ou `null` si le circuit est terminé. */
export function getActionableEtape(etapeStates: Record<EtapeCode, EtapeNodeState>): EtapeCode | null {
  return WORKFLOW_ETAPES.find((e) => etapeStates[e] === 'active' || etapeStates[e] === 'returned') ?? null;
}

/**
 * Statut fonctionnel à plat (badge, filtres de liste — conception_finale_complete.md §7.5) dérivé de
 * la même donnée réelle que `deriveWorkflowState`. `BROUILLON` n'est jamais produit par cette fonction
 * (un `wf_dossier` n'existe qu'après `initWorkflow`, qui pose toujours une tâche ouverte) — il reste
 * dans le type pour compatibilité avec l'UI existante (filtres) tant que le dossier n'est pas chargé.
 * `REFUSE` n'est plus produit non plus (ressaisie unique, voir `deriveWorkflowState`).
 */
export type DossierStatut =
  | 'BROUILLON' | 'DEPOSE' | 'EN_CONTROLE' | 'A_COMPLETER'
  | 'EN_TRAITEMENT_TECHNIQUE' | 'EN_VALIDATION' | 'VALIDE' | 'REFUSE'
  | 'LIVRABLE_GENERE' | 'CLOTURE';

/** Dossier « en cours » (carte du tableau de bord, liste associée, résumé du traitement) : ni clos ni refusé. */
export function estDossierEnCours(statut: DossierStatut): boolean {
  return statut !== 'CLOTURE' && statut !== 'REFUSE';
}

export function deriveDossierStatut(etapeCode: EtapeCode | null, motifRejet?: string | null): DossierStatut {
  if (!etapeCode) return 'CLOTURE';
  const regressed = Boolean(motifRejet);
  switch (etapeCode) {
    case 'DEPOT_DOSSIER':      return regressed ? 'A_COMPLETER' : 'DEPOSE';
    case 'CONTROLE_PIECES':    return regressed ? 'A_COMPLETER' : 'EN_CONTROLE';
    case 'TRAITEMENT_TECHNIQUE': return 'EN_TRAITEMENT_TECHNIQUE';
    case 'VISA_VALIDATION':    return regressed ? 'A_COMPLETER' : 'EN_VALIDATION';
    case 'EDITION_LIVRABLE':   return 'VALIDE';
    case 'ARCHIVAGE':          return 'LIVRABLE_GENERE';
  }
}
