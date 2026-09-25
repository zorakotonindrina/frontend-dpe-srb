import type { ReceptionVaNeuf, ReceptionNeufLigne } from '@/lib/fixtures/receptionNeuf.fixtures';
import { api, ApiError } from './client';

export type ReceptionNeufInput = Omit<ReceptionVaNeuf, 'receptionNeufId' | 'referenceActe' | 'statut'>;
export type ReceptionNeufLigneInput = Omit<ReceptionNeufLigne, 'id' | 'receptionNeufId'>;

interface RawReceptionNeuf extends ReceptionVaNeuf { lignes?: ReceptionNeufLigne[] }

export const receptionNeufApi = {
  list: () => api.get<ReceptionVaNeuf[]>('/api-receptionneuf/api/receptions-va-neuf'),

  async get(receptionNeufId: string): Promise<RawReceptionNeuf | null> {
    try {
      return await api.get<RawReceptionNeuf>(`/api-receptionneuf/api/receptions-va-neuf/${encodeURIComponent(receptionNeufId)}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async getByReference(referenceActe: string): Promise<ReceptionVaNeuf | null> {
    const items = await receptionNeufApi.list();
    return items.find((r) => r.referenceActe === referenceActe) ?? null;
  },

  async lignes(receptionNeufId: string): Promise<ReceptionNeufLigne[]> {
    const raw = await receptionNeufApi.get(receptionNeufId);
    return raw?.lignes ?? [];
  },

  /** POST /api/receptions-va-neuf — ministereCode obligatoire côté DTO réel, absent du formulaire —
   *  code MEF/BSCVA réel '21' (referentiel_rh.rh_ministere) en attendant un vrai sélecteur. */
  create: (input: ReceptionNeufInput, lignesInput: ReceptionNeufLigneInput[]) =>
    api.post<{ referenceActe: string; receptionNeufId: string }>('/api-receptionneuf/api/receptions-va-neuf', {
      ...input,
      ministereCode: '21',
      lignes: lignesInput,
    }),

  valider: (receptionNeufId: string) => api.patch<{ receptionNeufId: string; statut: string }>(
    `/api-receptionneuf/api/receptions-va-neuf/${encodeURIComponent(receptionNeufId)}/valider`, {}),
};

export type { ReceptionVaNeuf, ReceptionNeufLigne };
