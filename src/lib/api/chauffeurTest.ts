import type { ChauffeurTest } from '@/lib/fixtures/chauffeurTest.fixtures';
import { chauffeursApi } from './chauffeurs';
import { api } from './client';

export type ChauffeurTestInput = Omit<ChauffeurTest, 'testId' | 'referenceActe' | 'statut'>;

export const chauffeurTestApi = {
  list: () => api.get<ChauffeurTest[]>('/api-testchauffeur/api/tests-chauffeurs'),

  async getByReference(referenceActe: string): Promise<ChauffeurTest | null> {
    const items = await chauffeurTestApi.list();
    return items.find((t) => t.referenceActe === referenceActe) ?? null;
  },

  /** POST /api/tests-chauffeurs — ministereCode obligatoire côté DTO réel, absent du formulaire :
   *  dérivé du chauffeur choisi (même simplification que le mock, qui faisait déjà ce lookup). */
  async create(input: ChauffeurTestInput): Promise<{ referenceActe: string; testId: string }> {
    const chauffeurs = await chauffeursApi.list();
    const chauffeur = chauffeurs.find((c) => c.chauffeurId === input.chauffeurId);
    return api.post<{ referenceActe: string; testId: string }>(
      '/api-testchauffeur/api/tests-chauffeurs',
      { ...input, ministereCode: chauffeur?.minCode ?? '' },
    );
  },

  /** PATCH .../resultat — capture le résultat ET déclenche la génération du document côté serveur
   *  (ChauffeurTestService.appliquerResultat), contrairement aux autres modules où le frontend
   *  déclenche lui-même genererDocumentReel : ici c'est déjà fait par le backend (best-effort,
   *  RESULTAT_TEST_CHAUFFEUR n'a pas de gabarit Jasper réel — aucune erreur remontée si absent).
   *  `observations` est saisi au moment de la décision (pas à la création) — même pattern que
   *  aptitudeLocationApi.updateAvis(id, avis, observation). */
  updateResultat: (testId: string, resultat: 'APTE' | 'NON_APTE', observations?: string) =>
    api.patch<{ testId: string; resultat: string }>(
      `/api-testchauffeur/api/tests-chauffeurs/${encodeURIComponent(testId)}/resultat`,
      { resultat, observations },
    ),
};

export type { ChauffeurTest };
