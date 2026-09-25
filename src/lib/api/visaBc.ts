import type { VisaBonCommande, VisaBcPiece } from '@/lib/fixtures/visaBc.fixtures';
import { api, ApiError } from './client';

export type VisaBcInput = Omit<VisaBonCommande, 'visaBcId' | 'referenceActe' | 'statut'>;
export type VisaBcPieceInput = Omit<VisaBcPiece, 'id' | 'visaBcId'>;
export interface VisaBcDecisionInput {
  decision:   'VISA' | 'REFUS';
  motifRefus?: string;
  numeroVisa: string;
  dateVisa:   string;
}

interface RawVisaBc extends Omit<VisaBonCommande, 'nif' | 'stat'> {
  nifStat?: string;
  lignes?: VisaBcPiece[];
}

/** Le DTO/schéma réel n'a qu'une seule colonne combinée nif_stat (pas de nif/stat séparés) —
 *  reconstruction non ambiguë impossible, tout est affiché dans `nif`, `stat` reste vide. */
function toVisaBc(raw: RawVisaBc): VisaBonCommande {
  return { ...raw, nif: raw.nifStat ?? '', stat: '' };
}

export const visaBcApi = {
  async list(): Promise<VisaBonCommande[]> {
    const rows = await api.get<RawVisaBc[]>('/api-visabc/api/visas-bc');
    return rows.map(toVisaBc);
  },

  async get(visaBcId: string): Promise<VisaBonCommande | null> {
    try {
      const raw = await api.get<RawVisaBc>(`/api-visabc/api/visas-bc/${encodeURIComponent(visaBcId)}`);
      return toVisaBc(raw);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async getByReference(referenceActe: string): Promise<VisaBonCommande | null> {
    const items = await visaBcApi.list();
    return items.find((v) => v.referenceActe === referenceActe) ?? null;
  },

  async pieces(visaBcId: string): Promise<VisaBcPiece[]> {
    const raw = await api.get<RawVisaBc>(`/api-visabc/api/visas-bc/${encodeURIComponent(visaBcId)}`).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    });
    return raw?.lignes ?? [];
  },

  /** POST /api/visas-bc — ministereCode obligatoire côté DTO réel, absent du formulaire — code
   *  MEF/BSCVA réel '21' (referentiel_rh.rh_ministere) en attendant un vrai sélecteur. nif/stat
   *  fusionnés en nifStat. */
  create: (input: VisaBcInput, piecesInput: VisaBcPieceInput[]) =>
    api.post<{ referenceActe: string; visaBcId: string }>('/api-visabc/api/visas-bc', {
      ...input,
      ministereCode: '21',
      nifStat: `${input.nif} ${input.stat}`.trim(),
      lignes: piecesInput,
    }),

  updateVisa: (visaBcId: string, decision: VisaBcDecisionInput) =>
    api.patch<{ visaBcId: string; decision: string }>(
      `/api-visabc/api/visas-bc/${encodeURIComponent(visaBcId)}/decision`, decision),
};

export type { VisaBonCommande, VisaBcPiece };
