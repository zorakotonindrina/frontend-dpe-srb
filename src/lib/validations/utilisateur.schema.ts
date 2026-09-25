import { z } from 'zod';

// Les 9 valeurs ci-dessous doivent rester synchronisées avec `UserRole` (types/auth.types.ts).
const USER_ROLES = [
  'ADMIN', 'AGENT_SAISIE', 'AGENT_CONTROLE', 'EXPERT_TECH',
  'CHEF_BSCVA', 'CHEF_DRPE', 'CHEF_SRB', 'DEPOSITAIRE_CPT', 'CONSULT',
] as const;

export const utilisateurSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  login: z.string().min(1, 'Login requis'),
  role: z.enum(USER_ROLES, { message: 'Rôle requis' }),
  sigle: z.string().optional().default(''),
  site: z.string().optional().default(''),
});

export const utilisateurCreateSchema = utilisateurSchema.extend({
  password: z.string().min(4, 'Mot de passe requis (4 caractères minimum)'),
});

export type UtilisateurFormData = z.infer<typeof utilisateurSchema>;
export type UtilisateurCreateFormData = z.infer<typeof utilisateurCreateSchema>;
