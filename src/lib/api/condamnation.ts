import type { CategorieMisePrix, EtatActuel, EvaluationCondamnation } from '@/lib/fixtures/condamnation.fixtures';
import { api } from './client';

/** Corps de création : les valeurs (estimée, en AR) sont calculées par le serveur à partir des prix. */
export interface CondamnationInput {
  vehiculeId: string;
  motifCondamnation: string;
  typeMiseAPrix: CategorieMisePrix;
  typeVeh: string;
  etatActuel: EtatActuel;
  depreciationPct: number;
  datePv: string;
  heurePv: string;
  commissionMembresEntite: string;
  commissionMembresDpe: string;
  soaCode: string;
  /** Ministère de la structure bénéficiaire (imprimé dans « … appartenant au … du Ministère de … »). */
  ministereBeneficiaireCode: string;
  prix: { elementId: string; prix: number }[];
}

export const condamnationApi = {
  list: () => api.get<EvaluationCondamnation[]>('/api-condamnation/api/condamnations'),

  /** GET /{id} : la fiche + les prix saisis par élément de la grille. */
  get: (evaluationId: string) =>
    api.get<EvaluationCondamnation>(`/api-condamnation/api/condamnations/${encodeURIComponent(evaluationId)}`),

  /** Fiche complète (avec `prix`) d'un dossier : la liste ne renvoie pas les prix. */
  async getCompletByReference(referenceActe: string): Promise<EvaluationCondamnation | null> {
    const resume = await condamnationApi.getByReference(referenceActe);
    return resume ? condamnationApi.get(resume.evaluationId) : null;
  },

  async getByReference(referenceActe: string): Promise<EvaluationCondamnation | null> {
    const items = await condamnationApi.list();
    return items.find((e) => e.referenceActe === referenceActe) ?? null;
  },

  /** POST /api/condamnations — ministereCode obligatoire côté DTO réel mais absent du formulaire —
   *  code MEF/BSCVA réel '21' (referentiel_rh.rh_ministere) en attendant un vrai sélecteur. */
  create: (input: CondamnationInput) =>
    api.post<{ referenceActe: string; evaluationId: string }>(
      '/api-condamnation/api/condamnations',
      { ...input, ministereCode: '21' },
    ),

  valider: (evaluationId: string) => api.patch<{ evaluationId: string; statut: string }>(
    `/api-condamnation/api/condamnations/${encodeURIComponent(evaluationId)}/valider`, {}),
};

export type { CategorieMisePrix, EtatActuel, EvaluationCondamnation };
