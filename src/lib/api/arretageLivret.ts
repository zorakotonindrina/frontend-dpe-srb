import type {
  ArretageLivret, ArretageLivretDetail, ArretageFeuilles,
} from '@/lib/fixtures/arretageLivret.fixtures';
import { feuillesVides } from '@/lib/fixtures/arretageLivret.fixtures';
import { api, ApiError } from './client';

/** En-tête saisi à la création (les totaux et l'année sont calculés par le serveur). */
export interface ArretageLivretInput {
  vehiculeId:       string;
  dateArretage:     string;
  dernierBc:        string;
  vehiculeFonction: boolean;
  typeCarburant:          string;
  dotationMensuelle:      number | null;
  dotationExceptionnelle: number | null;
}

type Brut = Record<string, unknown>;

interface RawArretage extends ArretageLivret {
  details?: ArretageLivretDetail[];
  carburants?: Brut[]; pneumatiques?: Brut[]; entretiens?: Brut[]; reparations?: Brut[]; parcours?: Brut[];
}

const nombre = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number(v));
const date = (v: unknown): string => (v ? String(v).slice(0, 10) : '');
const texte = (v: unknown): string => (v ? String(v) : '');
const parRang = (a: Brut, b: Brut): number => Number(a.rang ?? 0) - Number(b.rang ?? 0);

/** Lignes des feuilles telles que renvoyées par `GET .../{id}` (dates ISO, numériques en nombre). */
function feuillesDepuis(raw: RawArretage): ArretageFeuilles {
  const trier = (l?: Brut[]): Brut[] => [...(l ?? [])].sort(parRang);
  return {
    carburants: trier(raw.carburants).map((r) => ({
      dateOperation: date(r.dateOperation), nature: texte(r.nature),
      quantiteLitres: nombre(r.quantiteLitres), huileLitres: nombre(r.huileLitres),
    })),
    pneumatiques: trier(raw.pneumatiques).map((r) => ({
      dateLivraison: date(r.dateLivraison), nature: texte(r.nature), prix: nombre(r.prix),
    })),
    entretiens: trier(raw.entretiens).map((r) => ({
      kilometrage: nombre(r.kilometrage), dateLavage: date(r.dateLavage),
      dateVidange: date(r.dateVidange), dateGraissage: date(r.dateGraissage),
    })),
    reparations: trier(raw.reparations).map((r) => ({
      dateEntree: date(r.dateEntree), dateSortie: date(r.dateSortie), nature: texte(r.nature), prix: nombre(r.prix),
    })),
    parcours: trier(raw.parcours).map((r) => ({
      dateSortie: date(r.dateSortie), dateRentree: date(r.dateRentree), motif: texte(r.motif), distanceKm: nombre(r.distanceKm),
    })),
  };
}

/** Retire le marqueur client `fromBc` avant envoi. */
function sansMarqueur<T extends { fromBc?: boolean }>(lignes: T[]): T[] {
  return lignes.map((ligne) => {
    const copie = { ...ligne };
    delete copie.fromBc;
    return copie;
  });
}

export interface ArretageLivretComplet {
  arretage: ArretageLivret;
  feuilles: ArretageFeuilles;
  /** Ancien détail plat (dossiers antérieurs au détail par feuille) */
  details: ArretageLivretDetail[];
}

export const arretageLivretApi = {
  list: () => api.get<ArretageLivret[]>('/api-arretagelivret/api/arretages-livret'),

  async get(arretageId: string): Promise<RawArretage | null> {
    try {
      return await api.get<RawArretage>(`/api-arretagelivret/api/arretages-livret/${encodeURIComponent(arretageId)}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async getByReference(referenceActe: string): Promise<ArretageLivret | null> {
    const items = await arretageLivretApi.list();
    return items.find((a) => a.referenceActe === referenceActe) ?? null;
  },

  /** Arrêtage + lignes des 5 feuilles + ancien détail plat, en un seul appel. */
  async complet(arretageId: string): Promise<ArretageLivretComplet | null> {
    const raw = await arretageLivretApi.get(arretageId);
    if (!raw) return null;
    return { arretage: raw, feuilles: feuillesDepuis(raw), details: raw.details ?? [] };
  },

  /** POST /api/arretages-livret — ministereCode obligatoire côté DTO réel, absent du formulaire —
   *  code MEF/BSCVA réel '21' (referentiel_rh.rh_ministere) en attendant un vrai sélecteur. */
  create: (input: ArretageLivretInput, feuilles: ArretageFeuilles = feuillesVides()) =>
    api.post<{ referenceActe: string; arretageId: string }>('/api-arretagelivret/api/arretages-livret', {
      ...input,
      ministereCode: '21',
      carburants: feuilles.carburants,
      pneumatiques: sansMarqueur(feuilles.pneumatiques),
      entretiens: feuilles.entretiens,
      reparations: sansMarqueur(feuilles.reparations),
      parcours: feuilles.parcours,
    }),

  /** PATCH .../numero — numero_arretage/date_arretage renseignés au moment de la génération du
   *  visa, pas à la création (colonne numero_arretage ajoutée au schéma pour ce lot, cf. plan). */
  updateArretage: (arretageId: string, patch: { numeroArretage: string; dateArretage: string }) =>
    api.patch<{ arretageId: string; numeroArretage: string }>(
      `/api-arretagelivret/api/arretages-livret/${encodeURIComponent(arretageId)}/numero`, patch),

  valider: (arretageId: string) => api.patch<{ arretageId: string; statut: string }>(
    `/api-arretagelivret/api/arretages-livret/${encodeURIComponent(arretageId)}/valider`, {}),
};

export type { ArretageLivret, ArretageLivretDetail, ArretageFeuilles };
