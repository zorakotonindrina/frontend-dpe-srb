import type { ReceptionTechnique, ReceptionConstat } from '@/lib/fixtures/receptionTechnique.fixtures';
import { api, ApiError } from './client';

export type ReceptionTechniqueInput = Omit<ReceptionTechnique, 'receptionId' | 'referenceActe' | 'statut'>;
export type ReceptionConstatInput = Omit<ReceptionConstat, 'id' | 'receptionId'>;

interface RawReception extends ReceptionTechnique { constats?: ReceptionConstat[] }

export const receptionTechniqueApi = {
  list: () => api.get<ReceptionTechnique[]>('/api-receptiontechnique/api/receptions-techniques'),

  async get(receptionId: string): Promise<RawReception | null> {
    try {
      return await api.get<RawReception>(`/api-receptiontechnique/api/receptions-techniques/${encodeURIComponent(receptionId)}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async getByReference(referenceActe: string): Promise<ReceptionTechnique | null> {
    const items = await receptionTechniqueApi.list();
    return items.find((r) => r.referenceActe === referenceActe) ?? null;
  },

  async constats(receptionId: string): Promise<ReceptionConstat[]> {
    const raw = await receptionTechniqueApi.get(receptionId);
    return raw?.constats ?? [];
  },

  /** POST /api/receptions-techniques — ministereCode obligatoire côté DTO réel, absent du
   *  formulaire — code MEF/BSCVA réel '21' (referentiel_rh.rh_ministere) en attendant un vrai
   *  sélecteur. `constats` réel = tableau de libellés (pas d'objets {libelle}), contrairement à
   *  constatation/reparations. */
  create: (input: ReceptionTechniqueInput, constatsInput: ReceptionConstatInput[]) =>
    api.post<{ referenceActe: string; receptionId: string }>('/api-receptiontechnique/api/receptions-techniques', {
      ...input,
      ministereCode: '21',
      constats: constatsInput.map((c) => c.libelle),
    }),

  updateAvis: (receptionId: string, avis: 'FAVORABLE' | 'DEFAVORABLE') =>
    api.patch<{ receptionId: string; avis: string }>(
      `/api-receptiontechnique/api/receptions-techniques/${encodeURIComponent(receptionId)}/avis`, { avis }),
};

export type { ReceptionTechnique, ReceptionConstat };
