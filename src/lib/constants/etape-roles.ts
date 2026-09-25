import type { UserRole } from '@/types/auth.types';
import type { EtapeCode } from './workflow-etapes';

/**
 * Rôles autorisés à agir sur chaque étape générique du workflow (conception_finale_complete.md §4, §16).
 * Simplification assumée : par étape, pas par (processus, étape) comme le ferait `wf_tache_role_entite`
 * en toute rigueur — à affiner si le backend réel impose une granularité par processus.
 * `ADMIN` garde un accès universel, vérifié séparément par l'appelant.
 */
export const ETAPE_ROLE_MAP: Record<EtapeCode, UserRole[]> = {
  DEPOT_DOSSIER: ['AGENT_SAISIE'],
  CONTROLE_PIECES: ['AGENT_CONTROLE', 'AGENT_SAISIE'],
  TRAITEMENT_TECHNIQUE: ['EXPERT_TECH'],
  VISA_VALIDATION: ['CHEF_BSCVA', 'CHEF_DRPE', 'CHEF_SRB'],
  EDITION_LIVRABLE: ['AGENT_SAISIE', 'CHEF_SRB'],
  ARCHIVAGE: ['AGENT_SAISIE', 'DEPOSITAIRE_CPT'],
};
