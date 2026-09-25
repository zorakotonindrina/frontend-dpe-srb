import type { ExpertiseAccident, ExpertiseDommage } from '@/lib/fixtures/expertise.fixtures';
import { api, ApiError } from './client';

export type ExpertiseInput = Omit<ExpertiseAccident, 'expertiseId' | 'referenceActe' | 'statut'>;
export type DommageInput = Omit<ExpertiseDommage, 'id' | 'expertiseId'>;

interface RawExpertise extends ExpertiseAccident { dommages?: Array<ExpertiseDommage & { id?: string }> }

export const expertiseApi = {
  list: () => api.get<ExpertiseAccident[]>('/api-expertise/api/expertises'),

  async getByReference(referenceActe: string): Promise<ExpertiseAccident | null> {
    const items = await expertiseApi.list();
    return items.find((e) => e.referenceActe === referenceActe) ?? null;
  },

  async dommages(expertiseId: string): Promise<ExpertiseDommage[]> {
    try {
      const raw = await api.get<RawExpertise>(`/api-expertise/api/expertises/${encodeURIComponent(expertiseId)}`);
      return raw.dommages ?? [];
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return [];
      throw e;
    }
  },

  /** POST /api/expertises — ministereCode obligatoire côté DTO réel mais absent du formulaire —
   *  code MEF/BSCVA réel '21' (referentiel_rh.rh_ministere) en attendant un vrai sélecteur. Les
   *  dommages sont imbriqués directement dans le corps de la requête réelle, pas un 2e appel. */
  create: (input: ExpertiseInput, dommages: DommageInput[]) =>
    api.post<{ referenceActe: string; expertiseId: string }>(
      '/api-expertise/api/expertises',
      { ...input, ministereCode: '21', dommages },
    ),

  valider: (expertiseId: string) => api.patch<{ expertiseId: string; statut: string }>(
    `/api-expertise/api/expertises/${encodeURIComponent(expertiseId)}/valider`, {}),
};

export type { ExpertiseAccident, ExpertiseDommage };
