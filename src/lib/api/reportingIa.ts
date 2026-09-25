import { api, buildQS, getBlob } from './client';

/**
 * Résultats de la brique IA (schéma `ia`, écrits par `ia-siigpe/modeles/entrainer_tout.py`) exposés par le hub
 * (`ReportingController`, `/api/reporting/ia/**`). Seul le modèle actif de chaque code est renvoyé.
 */

const BASE = '/api-financiere/api/reporting/ia';

export type CodeModeleIa = 'DELAI_DOSSIER' | 'DEPENSE_VEHICULE' | 'GROSSE_REPARATION' | 'ANOMALIE_CARBURANT';
export type StatutAnomalie = 'NOUVELLE' | 'VERIFIEE' | 'JUSTIFIEE';

export interface ModeleIa {
  modeleId: string;
  code: CodeModeleIa;
  version: string;
  algorithme: string;
  dateEntrainement: string;
  periodeDonnees: string;
  nbExemples: number;
  /** Métriques d'évaluation (structure propre à chaque modèle, voir le rapport `rapports/rapport_ia.md`). */
  metriques: Record<string, unknown>;
  commentaire: string | null;
}

export interface PrevisionStructure {
  id: string;
  soaCode: string;
  soaLibelle: string | null;
  anneeCible: number;
  nbVehicules: number;
  depensePrevue: number;
  borneBasse: number;
  borneHaute: number;
  /** Par poste (carburant, huile, entretien, reparations, pneumatiques) + `reel_annee_precedente`. */
  detail: Record<string, number>;
}

export interface PrevisionVehicule {
  id: string;
  vehiculeId: string;
  vehiculeImmatriculation: string;
  marque: string | null;
  categorieVehicule: string | null;
  soaDepositaire: string | null;
  soaLibelle: string | null;
  anneeCible: number;
  depensePrevue: number;
  borneBasse: number;
  borneHaute: number;
  detail: Record<string, number>;
  probaGrosseReparation: number | null;
}

export interface AnomalieCarburant {
  id: string;
  vehiculeId: string;
  vehiculeImmatriculation: string;
  soaLibelle: string | null;
  mois: string;
  litres: number;
  km: number;
  consommation100km: number | null;
  score: number;
  motif: string | null;
  statut: StatutAnomalie;
}

export interface DelaiProcessus {
  processusCode: string;
  nbDossiersOuverts: number;
  delaiPrevuMoyen: number;
  borneBasseMoyenne: number;
  borneHauteMoyenne: number;
  ageMoyenJours: number;
  nbEnRetard: number;
}

type Brut = Record<string, unknown>;
const nombre = (v: unknown): number => (v === null || v === undefined || v === '' ? 0 : Number(v));
const nombreOuNull = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number(v));
const json = <T>(v: unknown, defaut: T): T => {
  if (v && typeof v === 'object') return v as T;
  if (typeof v !== 'string' || !v) return defaut;
  try {
    return JSON.parse(v) as T;
  } catch {
    return defaut;
  }
};

export const reportingIaApi = {
  async modeles(): Promise<ModeleIa[]> {
    const rows = await api.get<Brut[]>(`${BASE}/modeles`);
    return rows.map((r) => ({
      modeleId: String(r.modeleId), code: r.code as CodeModeleIa, version: String(r.version ?? ''),
      algorithme: String(r.algorithme ?? ''), dateEntrainement: String(r.dateEntrainement ?? ''),
      periodeDonnees: String(r.periodeDonnees ?? ''), nbExemples: nombre(r.nbExemples),
      metriques: json<Record<string, unknown>>(r.metriques, {}), commentaire: (r.commentaire as string) ?? null,
    }));
  },

  async previsionStructures(annee?: number): Promise<PrevisionStructure[]> {
    const rows = await api.get<Brut[]>(`${BASE}/prevision-structures${buildQS({ annee })}`);
    return rows.map((r) => ({
      id: String(r.id), soaCode: String(r.soaCode ?? ''), soaLibelle: (r.soaLibelle as string) ?? null,
      anneeCible: nombre(r.anneeCible), nbVehicules: nombre(r.nbVehicules), depensePrevue: nombre(r.depensePrevue),
      borneBasse: nombre(r.borneBasse), borneHaute: nombre(r.borneHaute), detail: json<Record<string, number>>(r.detail, {}),
    })).sort((a, b) => b.depensePrevue - a.depensePrevue);
  },

  async previsionVehicules(annee?: number, soa?: string): Promise<PrevisionVehicule[]> {
    const rows = await api.get<Brut[]>(`${BASE}/prevision-vehicules${buildQS({ annee, soa })}`);
    return rows.map((r) => ({
      id: String(r.id), vehiculeId: String(r.vehiculeId), vehiculeImmatriculation: String(r.vehiculeImmatriculation ?? ''),
      marque: (r.marque as string) ?? null, categorieVehicule: (r.categorieVehicule as string) ?? null,
      soaDepositaire: (r.soaDepositaire as string) ?? null, soaLibelle: (r.soaLibelle as string) ?? null,
      anneeCible: nombre(r.anneeCible), depensePrevue: nombre(r.depensePrevue), borneBasse: nombre(r.borneBasse),
      borneHaute: nombre(r.borneHaute), detail: json<Record<string, number>>(r.detail, {}),
      probaGrosseReparation: nombreOuNull(r.probaGrosseReparation),
    }));
  },

  async anomaliesCarburant(statut?: StatutAnomalie): Promise<AnomalieCarburant[]> {
    const rows = await api.get<Brut[]>(`${BASE}/anomalies-carburant${buildQS({ statut })}`);
    return rows.map((r) => ({
      id: String(r.id), vehiculeId: String(r.vehiculeId), vehiculeImmatriculation: String(r.vehiculeImmatriculation ?? ''),
      soaLibelle: (r.soaLibelle as string) ?? null, mois: String(r.mois ?? ''), litres: nombre(r.litres), km: nombre(r.km),
      consommation100km: nombreOuNull(r.consommation100km), score: nombre(r.score), motif: (r.motif as string) ?? null,
      statut: (r.statut as StatutAnomalie) ?? 'NOUVELLE',
    })).sort((a, b) => b.score - a.score);
  },

  suivreAnomalie: (id: string, statut: StatutAnomalie) =>
    api.patch<{ id: string; statut: StatutAnomalie }>(`${BASE}/anomalies-carburant/${encodeURIComponent(id)}`, { statut }),

  async delais(): Promise<DelaiProcessus[]> {
    const rows = await api.get<Brut[]>(`${BASE}/delais`);
    return rows.map((r) => ({
      processusCode: String(r.processusCode ?? ''), nbDossiersOuverts: nombre(r.nbDossiersOuverts),
      delaiPrevuMoyen: nombre(r.delaiPrevuMoyen), borneBasseMoyenne: nombre(r.borneBasseMoyenne),
      borneHauteMoyenne: nombre(r.borneHauteMoyenne), ageMoyenJours: nombre(r.ageMoyenJours), nbEnRetard: nombre(r.nbEnRetard),
    }));
  },

  exporterExcel: (annee?: number) => getBlob(`${BASE}/prevision-budgetaire/export${buildQS({ annee })}`),
};
