import type {
  ConstatationTechnique, ConstatationElement,
  ConstatationPieceRemplacer, ConstatationReparation, ConstatationAccessoire,
} from '@/lib/fixtures/constatation.fixtures';
import { api, ApiError } from './client';

export type ConstatationInput = Omit<ConstatationTechnique, 'constatationId' | 'referenceActe' | 'statut'>;
export type ElementInput = Omit<ConstatationElement, 'constatationElementId' | 'constatationId'>;
export type LibelleInput = { libelle: string };

interface RawConstatation extends ConstatationTechnique {
  elements?: ConstatationElement[];
  piecesRemplacer?: ConstatationPieceRemplacer[];
  reparations?: ConstatationReparation[];
  accessoires?: ConstatationAccessoire[];
}

export const constatationApi = {
  list: () => api.get<ConstatationTechnique[]>('/api-constatation/api/constatations'),

  async get(constatationId: string): Promise<RawConstatation | null> {
    try {
      return await api.get<RawConstatation>(`/api-constatation/api/constatations/${encodeURIComponent(constatationId)}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async getByReference(referenceActe: string): Promise<ConstatationTechnique | null> {
    const items = await constatationApi.list();
    return items.find((c) => c.referenceActe === referenceActe) ?? null;
  },

  async elements(constatationId: string): Promise<ConstatationElement[]> {
    const raw = await constatationApi.get(constatationId);
    return raw?.elements ?? [];
  },
  async piecesRemplacer(constatationId: string): Promise<ConstatationPieceRemplacer[]> {
    const raw = await constatationApi.get(constatationId);
    return raw?.piecesRemplacer ?? [];
  },
  async reparations(constatationId: string): Promise<ConstatationReparation[]> {
    const raw = await constatationApi.get(constatationId);
    return raw?.reparations ?? [];
  },
  async accessoires(constatationId: string): Promise<ConstatationAccessoire[]> {
    const raw = await constatationApi.get(constatationId);
    return raw?.accessoires ?? [];
  },

  /** POST /api/constatations — le DTO réel imbrique `constatation` (l'input) + `elements` +
   *  `piecesRemplacer` + `reparations` + `accessoires`.
   *  `soa` → `soaCode` : le formulaire garde le nom de champ `soa` (SoaSearchField, historique)
   *  mais le DTO Java expose `soaCode` (ConstatationInput.java) — sans ce renommage la valeur
   *  saisie est silencieusement ignorée par Jackson (bug déjà constaté avant cette refonte).
   *  ministereCode obligatoire côté DTO réel, absent du formulaire — code MEF/BSCVA réel '21'
   *  (referentiel_rh.rh_ministere, confirmé varchar(2) sur workflow.wf_dossier.ministere_code) en
   *  attendant un vrai sélecteur ministère sur ce formulaire. */
  create: (
    input: ConstatationInput,
    elementsInput: ElementInput[],
    piecesInput: LibelleInput[],
    reparationsInput: LibelleInput[],
    accessoiresInput: LibelleInput[],
  ) => {
    const { soa, ...rest } = input;
    return api.post<{ referenceActe: string; constatationId: string }>('/api-constatation/api/constatations', {
      constatation: { ...rest, soaCode: soa, ministereCode: '21' },
      elements: elementsInput,
      piecesRemplacer: piecesInput,
      reparations: reparationsInput,
      accessoires: accessoiresInput,
    });
  },

  valider: (constatationId: string) => api.patch<{ constatationId: string; statut: string }>(
    `/api-constatation/api/constatations/${encodeURIComponent(constatationId)}/valider`, {}),
};

export type { ConstatationTechnique, ConstatationElement, ConstatationPieceRemplacer, ConstatationReparation, ConstatationAccessoire };
