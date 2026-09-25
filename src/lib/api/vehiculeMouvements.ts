import { api } from './client';
import type { MouvementVehicule } from '@/lib/fixtures/vehiculeMouvements.fixtures';

export const mouvementsVehiculeApi = {
  /** GET /api-vehicules/api/vehicules/{id}/mouvements — dérivé côté backend des endpoints
   *  existants + des condamnations validées (aucune table dédiée). Contrat JSON identique à
   *  MouvementVehicule (camelCase, mêmes noms de champs) — pas de mapper Raw/to() nécessaire.
   *  REFORME reste dans l'union TypeScript mais n'est jamais renvoyé pour l'instant (pas de
   *  source de données côté backend). */
  async historique(vehiculeId: string): Promise<MouvementVehicule[]> {
    const items = await api.get<MouvementVehicule[]>(
      `/api-vehicules/api/vehicules/${encodeURIComponent(vehiculeId)}/mouvements`,
    );
    return [...items].sort((a, b) => b.dateMouvement.localeCompare(a.dateMouvement)); // plus récent en premier
  },
};

export type { MouvementVehicule };
