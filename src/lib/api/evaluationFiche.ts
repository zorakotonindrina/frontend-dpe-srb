import { api } from './client';

/** Valeur saisie pour un élément de la grille (1 ou 2 pourcentages, voir ElementEvaluation). */
export interface FicheElementValeur {
  elementEvaluationId: string;
  valeur1: number | null;
  valeur2: number | null;
}

/** Fiche d'évaluation d'un véhicule — clé fonctionnelle : référence d'acte + immatriculation.
 *  Partagée par Réception neuve, Réception technique et Évaluation/Condamnation. */
export interface FicheEvaluation {
  ficheId?: string;
  vehiculeId?: string | null;
  immatriculation: string;
  kilometrage: number | null;
  observation: string;
  elements: FicheElementValeur[];
}

interface RawFiche {
  ficheId: string;
  vehiculeId: string | null;
  immatriculation: string | null;
  kilometrage: number | string | null;
  observation: string | null;
  elements: { elementEvaluationId: string; valeur1: number | string | null; valeur2: number | string | null }[];
}

const nombre = (v: number | string | null | undefined): number | null =>
  v === null || v === undefined || v === '' ? null : Number(v);

export const evaluationFicheApi = {
  async list(referenceActe: string): Promise<FicheEvaluation[]> {
    const rows = await api.get<RawFiche[]>(`/api-financiere/rest/evaluation-fiches/${encodeURIComponent(referenceActe)}`);
    return rows.map((r) => ({
      ficheId: r.ficheId,
      vehiculeId: r.vehiculeId,
      immatriculation: r.immatriculation ?? '',
      kilometrage: nombre(r.kilometrage),
      observation: r.observation ?? '',
      elements: r.elements.map((e) => ({
        elementEvaluationId: e.elementEvaluationId, valeur1: nombre(e.valeur1), valeur2: nombre(e.valeur2),
      })),
    }));
  },

  /** Remplace toutes les fiches du dossier (PUT transactionnel côté hub). */
  save: (referenceActe: string, fiches: FicheEvaluation[]) =>
    api.put<{ status: string; fiches: number }>(
      `/api-financiere/rest/evaluation-fiches/${encodeURIComponent(referenceActe)}`, { fiches }),
};
