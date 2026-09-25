import type { UserRole } from '@/types/auth.types';
import { auditApi } from './audit';
import { api } from './client';

/** workflow.wf_utilisateur (+ role_code de wf_utilisateur_role, jointure côté requête) — le mot de
 *  passe (haché) n'est jamais renvoyé par le backend (AdminUtilisateurController le retire
 *  explicitement des réponses). */
export interface UtilisateurFixture {
  utilisateurMatricule: string;
  login:                string;
  password:             string;
  nom:                  string;
  prenom:                string;
  role:                 UserRole;
  sigle:                string;
  site:                 string;
  statut:                '1' | '0';
}

export type UtilisateurInput = Omit<UtilisateurFixture, 'utilisateurMatricule'>;

interface RawUtilisateur {
  utilisateurMatricule: string;
  login: string;
  utilisateurNom: string | null;
  utilisateurPrenom: string | null;
  roleCode: UserRole | null;
  sigle: string | null;
  site: string | null;
  statut: number | string | null;
}

function toUtilisateur(raw: RawUtilisateur): UtilisateurFixture {
  return {
    utilisateurMatricule: raw.utilisateurMatricule,
    login: raw.login,
    password: '',
    nom: raw.utilisateurNom ?? '',
    prenom: raw.utilisateurPrenom ?? '',
    role: (raw.roleCode ?? 'CONSULT') as UserRole,
    sigle: raw.sigle ?? '',
    site: raw.site ?? '',
    statut: String(raw.statut ?? '0') === '1' ? '1' : '0',
  };
}

/** Calcul pur, réutilisable côté UI (pré-remplissage du login à la création, simple suggestion —
 *  le matricule définitif est de toute façon calculé côté serveur à la création, voir
 *  AdminUtilisateurController.prochainMatricule). */
export function computeNextMatricule(items: UtilisateurFixture[]): string {
  const max = items.reduce((m, u) => Math.max(m, Number(u.utilisateurMatricule) || 0), 0);
  return String(max + 1).padStart(6, '0');
}

export const utilisateursApi = {
  list: () => api.get<RawUtilisateur[]>('/api-financiere/rest/admin/utilisateurs').then((rows) => rows.map(toUtilisateur)),

  get: (matricule: string) =>
    api.get<RawUtilisateur>(`/api-financiere/rest/admin/utilisateurs/${encodeURIComponent(matricule)}`).then(toUtilisateur),

  async create(input: UtilisateurInput): Promise<UtilisateurFixture> {
    const { utilisateurMatricule } = await api.post<{ utilisateurMatricule: string }>(
      '/api-financiere/rest/admin/utilisateurs',
      { nom: input.nom, prenom: input.prenom, login: input.login, password: input.password, role: input.role, sigle: input.sigle, site: input.site },
    );
    auditApi.log('UTILISATEUR_CREE', `Utilisateur ${input.login} créé (rôle ${input.role})`);
    return { ...input, utilisateurMatricule };
  },

  async update(matricule: string, patch: Partial<UtilisateurInput>): Promise<UtilisateurFixture> {
    await api.put(`/api-financiere/rest/admin/utilisateurs/${encodeURIComponent(matricule)}`, patch);
    auditApi.log('UTILISATEUR_MODIFIE', `Utilisateur ${matricule} modifié`);
    return utilisateursApi.get(matricule);
  },
};
