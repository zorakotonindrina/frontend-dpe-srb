/** tsi_arretage_livret + une table par feuille de livret (Script.sql §18.18) */
export interface ArretageLivret {
  arretageId:      string;
  referenceActe:   string;
  vehiculeId:      string;
  dateArretage:    string;
  dernierBc:       string;
  vehiculeFonction: boolean;
  /** tsi_arretage_livret.numero_arretage — renseigné au moment de la génération du livrable, pas à la création */
  numeroArretage?: string;
  statut:          string;
  /** En-tête de la feuille « Carburants et lubrifiants » */
  typeCarburant?:          string;
  dotationMensuelle?:      number | null;
  dotationExceptionnelle?: number | null;
  /** Année et totaux calculés par le serveur à la création (prévisions/reporting) */
  anneeArretage?:      number | null;
  totalLitres?:        number | null;
  totalHuile?:         number | null;
  totalKm?:            number | null;
  totalPneumatiques?:  number | null;
  totalReparations?:   number | null;
  consommation100km?:  number | null;
}

/** tsi_arretage_livret_detail — ancien détail plat, conservé pour les dossiers antérieurs au détail par feuille */
export type TypeLivretCode = 'SA' | 'GSS' | 'PARCOURS';

export interface ArretageLivretDetail {
  id:            string;
  arretageId:    string;
  typeLivretCode: TypeLivretCode;
  rubrique:      string;
  valeurArretee: number;
  observation:   string;
}

// ---------------------------------------------------------------------------
// Feuilles de livret — colonnes identiques aux feuilles papier (photos du classeur
// IMPRIMES DIGITALISATION 2026.xlsx). Dates en texte ISO (« 2025-12-31 », '' = non renseignée).
// `fromBc` : marqueur client (ligne pré-remplie depuis le dernier bon de commande), jamais envoyé.
// ---------------------------------------------------------------------------

/** Livret Service Automobile — Carburants et lubrifiants, quantités délivrées */
export interface ArretageCarburant {
  dateOperation: string;
  nature:        string;
  quantiteLitres: number | null;
  huileLitres:   number | null;
}

/** Livret Service Automobile — Pneumatiques et accessoires divers */
export interface ArretagePneumatique {
  dateLivraison: string;
  nature:        string;
  prix:          number | null;
  fromBc?:       boolean;
}

/** Livret Garage Station Service — Entretien courant */
export interface ArretageEntretien {
  kilometrage:   number | null;
  dateLavage:    string;
  dateVidange:   string;
  dateGraissage: string;
}

/** Livret Garage Station Service — Réparations */
export interface ArretageReparation {
  dateEntree: string;
  dateSortie: string;
  nature:     string;
  prix:       number | null;
  fromBc?:    boolean;
}

/** Livret Parcours (voiture de service) */
export interface ArretageParcours {
  dateSortie:  string;
  dateRentree: string;
  motif:       string;
  distanceKm:  number | null;
}

export interface ArretageFeuilles {
  carburants:   ArretageCarburant[];
  pneumatiques: ArretagePneumatique[];
  entretiens:   ArretageEntretien[];
  reparations:  ArretageReparation[];
  parcours:     ArretageParcours[];
}

export const feuillesVides = (): ArretageFeuilles => ({
  carburants: [], pneumatiques: [], entretiens: [], reparations: [], parcours: [],
});

export const arretagesLivretFixtures: ArretageLivret[] = [
  {
    arretageId: 'arl-1', referenceActe: 'ARL072026006', vehiculeId: 'veh-0001',
    dateArretage: '2025-12-31', dernierBc: 'BC-2025-0042', vehiculeFonction: false, statut: 'DEPOSE',
    typeCarburant: 'Gasoil', anneeArretage: 2025, totalLitres: 1285, totalKm: 9178, consommation100km: 14,
  },
];

export const arretageFeuillesFixtures: ArretageFeuilles = {
  carburants: [
    { dateOperation: '2025-08-10', nature: 'Approvisionnement carburant', quantiteLitres: 490, huileLitres: null },
    { dateOperation: '2025-08-19', nature: 'Approvisionnement carburant', quantiteLitres: 450, huileLitres: null },
    { dateOperation: '2025-12-27', nature: 'Approvisionnement carburant', quantiteLitres: 345, huileLitres: null },
  ],
  pneumatiques: [],
  entretiens: [],
  reparations: [],
  parcours: [
    { dateSortie: '2025-01-06', dateRentree: '2025-12-30', motif: 'Parcours effectués durant l’année 2025', distanceKm: 9178 },
  ],
};
