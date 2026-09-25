/**
 * Types liés à l'authentification et aux sessions.
 * Rôles alignés sur workflow.wf_role (Script.sql) du domaine BSCVA.
 */

export type UserRole =
  | 'ADMIN'
  | 'AGENT_SAISIE'
  | 'AGENT_CONTROLE'
  | 'EXPERT_TECH'
  | 'CHEF_BSCVA'
  | 'CHEF_DRPE'
  | 'CHEF_SRB'
  | 'DEPOSITAIRE_CPT'
  | 'CONSULT';

/** Profil utilisateur côté application */
export interface UserProfile {
  id:     string;
  nom:    string;
  prenom: string;
  email:  string;
  role:   UserRole;
}

/** Libellés des rôles (workflow.wf_role.role_libelle) */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN:            'Administrateur',
  AGENT_SAISIE:     "Agent de saisie",
  AGENT_CONTROLE:   'Agent de contrôle',
  EXPERT_TECH:      'Expert technique',
  CHEF_BSCVA:       'Chef du Bureau BSCVA',
  CHEF_DRPE:        'Chef de la Division Régionale du Patrimoine de l\'État',
  CHEF_SRB:         'Chef du Service Régional du Budget',
  DEPOSITAIRE_CPT:  'Dépositaire comptable',
  CONSULT:          'Consultation',
};

/** Permissions applicatives par rôle (granularité écran/action) */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    'vehicules:read', 'vehicules:write',
    'dossiers:read', 'dossiers:write',
    'processus:read', 'processus:write',
    'workflow:traiter',
    'documents:read', 'documents:generer',
    'reporting:read',
    'administration:write',
  ],
  AGENT_SAISIE: [
    'vehicules:read', 'vehicules:write',
    'dossiers:read', 'dossiers:write',
    'processus:read', 'processus:write',
    'workflow:traiter',
  ],
  AGENT_CONTROLE: [
    'vehicules:read',
    'dossiers:read',
    'processus:read',
    'workflow:traiter',
  ],
  EXPERT_TECH: [
    'vehicules:read',
    'dossiers:read',
    'processus:read', 'processus:write',
    'workflow:traiter',
  ],
  CHEF_BSCVA: [
    'vehicules:read',
    'dossiers:read',
    'processus:read',
    'workflow:traiter',
    'documents:read', 'documents:generer',
    'reporting:read',
  ],
  CHEF_DRPE: [
    'vehicules:read',
    'dossiers:read',
    'processus:read',
    'workflow:traiter',
    'documents:read',
    'reporting:read',
  ],
  CHEF_SRB: [
    'vehicules:read',
    'dossiers:read',
    'processus:read',
    'workflow:traiter',
    'documents:read', 'documents:generer',
    'reporting:read',
  ],
  DEPOSITAIRE_CPT: [
    'vehicules:read',
    'dossiers:read',
    'processus:read',
    'workflow:traiter',
  ],
  CONSULT: [
    'vehicules:read',
    'dossiers:read',
    'processus:read',
    'documents:read',
    'reporting:read',
  ],
};
