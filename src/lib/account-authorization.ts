import { ROLE_PERMISSIONS, type UserRole } from '@/types/auth.types';

/**
 * Autorisations UI dérivées du rôle de session — modèle simplifié par rapport
 * à un système de privilèges granulaire (workflow.wf_privilege_role), car le
 * MVP statique ne branche pas encore le backend d'habilitations.
 */
export function getAccountAuthorization(role: UserRole | undefined) {
  const permissions = new Set(role ? ROLE_PERMISSIONS[role] : []);
  const has = (permission: string) => permissions.has(permission);

  return {
    permissions,
    canViewVehicules:      has('vehicules:read'),
    canEditVehicules:      has('vehicules:write'),
    canViewDossiers:       has('dossiers:read'),
    canEditDossiers:       has('dossiers:write'),
    canEditProcessus:      has('processus:write'),
    canTraiterWorkflow:    has('workflow:traiter'),
    canGenererDocuments:   has('documents:generer'),
    canViewReporting:      has('reporting:read'),
    canAdministrate:       has('administration:write'),
  };
}
