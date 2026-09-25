import type { Recensement, RecensementLigne } from '@/lib/fixtures/recensement.fixtures';
import { api, ApiError, buildQS } from './client';

export type RecensementInput = Omit<Recensement, 'recensementId' | 'referenceActe' | 'dateSaisie' | 'statut'>;
export type RecensementLigneInput = Omit<RecensementLigne, 'recensementLigneId' | 'recensementId'>;

/** traitement_siigpe.tsi_recensement / tsi_recensement_ligne tels que renvoyés par le hub — mêmes
 *  noms de champs que `Recensement` (aligné exprès), sauf les 2 colonnes booléennes stockées en
 *  varchar(1) '1'/'0' (RecensementService.bool01). */
interface RawRecensement extends Omit<Recensement, 'lignes'> { lignes?: RawRecensementLigne[]; }
interface RawRecensementLigne {
  recensementLigneId: string; recensementId: string; vehiculeId: string; detenteurEffectif: string;
  carteGriseDispo: string | null; livretsDispo: string | null; etatGeneral: string; categorieUtilisation: string;
  type: string | null; rang: number; soaCode: string | null; stdCtd: string | null;
}

/** referentiel_siigpe.rsi_vehicule_etat (ligne active, actif=1) — utilisé pour pré-remplir le
 *  panneau de saisie sur une immatriculation déjà recensée lors d'une campagne précédente. `{}`
 *  (objet vide) si ce véhicule n'a encore jamais été recensé. */
export interface DernierEtatVehicule {
  soaCode?: string;
  detenteurEffectif?: string;
  type?: string;
  categorieUtilisation?: string;
  etatGeneral?: string;
  carteGriseDispo?: string | null;
  livretsDispo?: string | null;
  stdCtd?: string;
  exercice?: string;
}

function toLigne(r: RawRecensementLigne): RecensementLigne {
  return {
    recensementLigneId: r.recensementLigneId,
    recensementId:      r.recensementId,
    vehiculeId:         r.vehiculeId,
    detenteurEffectif:  r.detenteurEffectif,
    carteGriseDispo:    r.carteGriseDispo === '1',
    livretsDispo:       r.livretsDispo === '1',
    etatGeneral:        r.etatGeneral,
    categorieUtilisation: r.categorieUtilisation,
    type:               r.type ?? '',
    soaCode:            r.soaCode ?? '',
    stdCtd:             r.stdCtd ?? '',
  };
}

export const recensementApi = {
  list: () => api.get<RawRecensement[]>('/api-recensement/api/recensements'),

  async get(recensementId: string): Promise<Recensement | null> {
    try {
      return await api.get<RawRecensement>(`/api-recensement/api/recensements/${encodeURIComponent(recensementId)}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async getByReference(referenceActe: string): Promise<Recensement | null> {
    const items = await recensementApi.list();
    return items.find((r) => r.referenceActe === referenceActe) ?? null;
  },

  async lignes(recensementId: string): Promise<RecensementLigne[]> {
    const raw = await recensementApi.get(recensementId) as RawRecensement | null;
    return (raw?.lignes ?? []).map(toLigne);
  },

  /** POST /api-recensement/api/recensements — le DTO réel accepte les lignes imbriquées
   *  directement dans le corps de la requête (RecensementInput.lignes), pas un 2e appel. */
  async create(input: RecensementInput, lignes: RecensementLigneInput[]): Promise<{ referenceActe: string; recensementId: string }> {
    return api.post<{ referenceActe: string; recensementId: string }>('/api-recensement/api/recensements', { ...input, lignes });
  },

  /** PATCH /api-recensement/api/recensements/{id}/valider — statut → 'V' + upsert du référentiel
   *  réduit (referentiel_siigpe.rsi_recensement). Appelé depuis la génération du quitus (le seul
   *  endroit où cette validation métier a un sens, voir dossiers/detail/page.tsx). */
  valider: (recensementId: string) => api.patch<{ recensementId: string; statut: string }>(
    `/api-recensement/api/recensements/${encodeURIComponent(recensementId)}/valider`, {}),

  /** GET /api/recensements/verifier-doublon — confort UX (retour immédiat depuis
   *  VehiculeQuickAddPanel) ; la garantie réelle reste le contrôle serveur dans create(). */
  verifierDoublon: (vehiculeId: string, soaCode: string) => api.get<{ existe: boolean }>(
    `/api-recensement/api/recensements/verifier-doublon${buildQS({ vehiculeId, soaCode })}`),

  /** GET /api/recensements/dernier-etat — dernier état connu du véhicule (campagne précédente),
   *  pour pré-remplir VehiculeQuickAddPanel sur une immatriculation déjà recensée. */
  dernierEtat: (vehiculeId: string) => api.get<DernierEtatVehicule>(
    `/api-recensement/api/recensements/dernier-etat${buildQS({ vehiculeId })}`),
};

export type { Recensement, RecensementLigne };
