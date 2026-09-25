import type { Vehicule } from '@/lib/fixtures/vehicules.fixtures';
import { auditApi } from './audit';
import { api, buildQS } from './client';
import { referentielsApi } from './referentiels';

export interface VehiculesParams {
  search?: string;
  etatVehicule?: string;
  categorieVehicule?: string;
}

export type VehiculeInput = Omit<Vehicule, 'vehiculeId'>;

/** Sous-ensemble des champs du canevas papier de recensement (`utils/IMPRIMES DIGITALISATION
 *  2026.xlsx`, feuille "Modele Canevas") — utilisé par la création rapide de véhicule intégrée au
 *  wizard recensement (`VehiculeQuickAddPanel`), volontairement plus restreint que `VehiculeInput`
 *  (28 champs). Tout est optionnel à part l'immatriculation : `tsi_entite_vehicule` n'a aucune
 *  contrainte NOT NULL hors sa PK (voir Script.sql), le reste de la fiche pourra être complété plus
 *  tard via /vehicules. */
export interface VehiculeQuickInput {
  vehiculeImmatriculation: string;
  minCode?: string;
  soaDepositaire?: string;
  marqueCode?: string;
  genreCode?: string;
  carrosserieCode?: string;
  puissanceAdministrative?: number;
  numeroMoteur?: string;
  sourceEnergie?: string;
  datePremierMiseCirculation?: string;
}

/** traitement_siigpe.tsi_entite_vehicule, tel que renvoyé par le hub (camelCase des colonnes réelles). */
interface RawVehicule {
  vehiculeId: string;
  vehiculeImmatriculation: string;
  minCode: string;
  soaDepositaire: string;
  vehiculeMarqueId: string | null;
  marqueNom: string | null;
  regionLibelle: string | null;
  districtLibelle: string | null;
  communeLibelle: string | null;
  vehiculeGenre: string | null;
  vehiculeCarroserie: string | null;
  categorieVehicule: string | null;
  vehiculeSourceEnergie: string | null;
  etatVehicule: string | null;
  vehiculeNumeroMoteur: string | null;
  vehiculeVin: string | null;
  vehiculePuissanceAdministrative: string | null;
  vehiculePls: string | null;
  vehiculePv: string | null;
  vehiculeCu: string | null;
  vehiculePt: string | null;
  vehiculeDatePremierMise: string | null;
  carteGrise: string | null;
  livretsDisponibles: string | null;
  detenteurEffectif: string | null;
  regionId: string | null;
  districtId: string | null;
  communeId: string | null;
  valeurEstimative: string | null;
  statut: 'ACTIF' | 'REFORME' | 'CONDAMNE';
  utilisateurModifier: string | null;
  dateModifier: string | null;
  utilisateurSupprimer: string | null;
  dateSuppression: string | null;
  motifSuppression: string | null;
  /** referentiel_siigpe.rsi_vehicule_etat (actif=1) — dernier recensement connu du véhicule, voir
   *  q_vehicule_liste. Null si ce véhicule n'a jamais été recensé. */
  soaCode: string | null;
  exercice: string | null;
}

/**
 * Mappe les colonnes réelles vers `Vehicule` — les champs effectivement utilisés par le parcours
 * recensement (immatriculation, détenteur, carte grise, livrets, statut) sont fidèles.
 * marque/genre/carrosserie/région restent de vraies clés étrangères uuid côté backend, pas des
 * "codes" comme le suppose encore `Vehicule` — passés tels quels en attendant le lot séparé "fiche
 * véhicule" qui alignera les types référentiels correspondants. district/commune, eux, sont déjà de
 * vrais codes `varchar` (FK réelles depuis Script.sql §18.8), cohérents avec `Vehicule.districtCode`/
 * `communeCode`.
 */
function toVehicule(raw: RawVehicule): Vehicule {
  return {
    vehiculeId:                raw.vehiculeId,
    vehiculeImmatriculation:   raw.vehiculeImmatriculation,
    minCode:                   raw.minCode,
    soaDepositaire:            raw.soaDepositaire,
    marqueCode:                raw.vehiculeMarqueId ?? '',
    marqueLibelle:             raw.marqueNom ?? raw.vehiculeMarqueId ?? '',
    genreCode:                 raw.vehiculeGenre ?? '',
    carrosserieCode:           raw.vehiculeCarroserie ?? '',
    categorieVehicule:         raw.categorieVehicule ?? '',
    sourceEnergie:             raw.vehiculeSourceEnergie ?? '',
    etatVehicule:              raw.etatVehicule ?? '',
    numeroMoteur:              raw.vehiculeNumeroMoteur ?? '',
    vin:                       raw.vehiculeVin ?? '',
    puissanceAdministrative:   Number(raw.vehiculePuissanceAdministrative ?? 0),
    pls:                       Number(raw.vehiculePls ?? 0),
    pv:                        Number(raw.vehiculePv ?? 0),
    cu:                        Number(raw.vehiculeCu ?? 0),
    pt:                        Number(raw.vehiculePt ?? 0),
    valeurEstimative:          Number(raw.valeurEstimative ?? 0),
    datePremierMiseCirculation: raw.vehiculeDatePremierMise ?? '',
    carteGrise:                raw.carteGrise === '1',
    livretsDisponibles:        raw.livretsDisponibles === '1',
    detenteurEffectif:         raw.detenteurEffectif ?? '',
    regionCode:                raw.regionId ?? '',
    districtCode:              raw.districtId ?? '',
    communeCode:               raw.communeId ?? '',
    regionLibelle:             raw.regionLibelle ?? raw.regionId ?? '',
    districtLibelle:           raw.districtLibelle ?? raw.districtId ?? '',
    communeLibelle:            raw.communeLibelle ?? raw.communeId ?? '',
    soaCode:                   raw.soaCode ?? '',
    exercice:                  raw.exercice ?? '',
    statut:                    raw.statut,
    isDeleted:                 raw.dateSuppression != null,
    deletedAt:                 raw.dateSuppression ?? undefined,
    motifSuppression:          raw.motifSuppression ?? undefined,
  };
}

/** Construit le body snake_case attendu par VehiculeController à partir des champs présents dans
 *  `input` — utilisé tel quel (objet complet) par `create()`, et avec un patch partiel par
 *  `update()`. `statut` n'est envoyé que s'il est présent (create() laisse le backend le défaulter
 *  à 'ACTIF', update() peut le faire évoluer vers REFORME/CONDAMNE). */
function toBackendBody(input: Partial<VehiculeInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.vehiculeImmatriculation !== undefined) body.vehicule_immatriculation = input.vehiculeImmatriculation;
  if (input.minCode !== undefined) body.min_code = input.minCode;
  if (input.soaDepositaire !== undefined) body.soa_depositaire = input.soaDepositaire;
  if (input.marqueCode !== undefined) body.vehicule_marque_id = input.marqueCode;
  if (input.genreCode !== undefined) body.vehicule_genre = input.genreCode;
  if (input.carrosserieCode !== undefined) body.vehicule_carroserie = input.carrosserieCode;
  if (input.categorieVehicule !== undefined) body.categorie_vehicule = input.categorieVehicule;
  if (input.sourceEnergie !== undefined) body.vehicule_source_energie = input.sourceEnergie;
  if (input.etatVehicule !== undefined) body.etat_vehicule = input.etatVehicule;
  if (input.numeroMoteur !== undefined) body.vehicule_numero_moteur = input.numeroMoteur;
  if (input.vin !== undefined) body.vehicule_vin = input.vin;
  if (input.puissanceAdministrative !== undefined) body.vehicule_puissance_administrative = String(input.puissanceAdministrative);
  if (input.pls !== undefined) body.vehicule_pls = String(input.pls);
  if (input.pv !== undefined) body.vehicule_pv = String(input.pv);
  if (input.cu !== undefined) body.vehicule_cu = String(input.cu);
  if (input.pt !== undefined) body.vehicule_pt = String(input.pt);
  if (input.datePremierMiseCirculation !== undefined) body.vehicule_date_premier_mise = input.datePremierMiseCirculation;
  if (input.carteGrise !== undefined) body.carte_grise = input.carteGrise ? '1' : '0';
  if (input.livretsDisponibles !== undefined) body.livrets_disponibles = input.livretsDisponibles ? '1' : '0';
  if (input.detenteurEffectif !== undefined) body.detenteur_effectif = input.detenteurEffectif;
  if (input.statut !== undefined) body.statut = input.statut;
  // district_id/commune_id sont de vraies FK varchar vers rn_district/rn_commune depuis le
  // correctif de schéma — jamais une chaîne vide (violerait la FK), null si non renseigné.
  if (input.districtCode !== undefined) body.district_id = input.districtCode || null;
  if (input.communeCode !== undefined) body.commune_id = input.communeCode || null;
  if (input.valeurEstimative !== undefined) body.valeur_estimative = input.valeurEstimative;
  return body;
}

export const vehiculesApi = {
  /** GET /api-vehicules/api/vehicules — recherche/filtre déjà supportés côté backend
   *  (VehiculeController.list), mêmes paramètres que le mock. */
  async list(params?: VehiculesParams): Promise<Vehicule[]> {
    const rows = await api.get<RawVehicule[]>(`/api-vehicules/api/vehicules${buildQS(params ?? {})}`);
    return rows.map(toVehicule);
  },

  get: (id: string) => api.get<RawVehicule>(`/api-vehicules/api/vehicules/${encodeURIComponent(id)}`).then(toVehicule),

  /** POST /api-vehicules/api/vehicules — body brut en snake_case (VehiculeController n'a pas de
   *  DTO strict, insertion directe dans entite_vehicule). `region_id` est résolu vers le vrai uuid
   *  `id_region` (le formulaire ne connaît que `regCode`, utilisé pour le filtrage en cascade des
   *  districts — pas la même clé que la FK réelle) ; `districtCode`/`communeCode` sont en revanche
   *  déjà les bons codes `varchar` (mêmes clés que `district_id`/`commune_id`, corrigés en FK
   *  réelles vers `rn_district`/`rn_commune` — voir Script.sql §18.8), envoyés tels quels. */
  async create(input: VehiculeInput): Promise<Vehicule> {
    const regions = await referentielsApi.regions();
    const region = regions.find((r) => r.regCode === input.regionCode);

    const body = toBackendBody(input);
    if (region) body.region_id = region.idRegion;

    const { vehiculeId } = await api.post<{ vehiculeId: string }>('/api-vehicules/api/vehicules', body);
    auditApi.log('VEHICULE_CREE', `Véhicule ${input.vehiculeImmatriculation} créé`);
    return { ...input, vehiculeId };
  },

  /** POST /api-vehicules/api/vehicules — variante minimale pour la création rapide depuis le wizard
   *  recensement (`VehiculeQuickAddPanel`). Construit son propre body snake_case, n'envoyant QUE les
   *  clés renseignées : contrairement à `toBackendBody`/`create()`, ne passe jamais par le type
   *  `VehiculeInput` (qui obligerait TypeScript à fournir `etatVehicule`/`categorieVehicule` — deux
   *  colonnes avec FK vers un référentiel, où une chaîne vide ferait échouer l'insert en base). */
  async createQuick(input: VehiculeQuickInput): Promise<{ vehiculeId: string }> {
    const body: Record<string, unknown> = {
      vehicule_immatriculation: input.vehiculeImmatriculation,
    };
    if (input.minCode) body.min_code = input.minCode;
    if (input.soaDepositaire) body.soa_depositaire = input.soaDepositaire;
    if (input.marqueCode) body.vehicule_marque_id = input.marqueCode;
    if (input.genreCode) body.vehicule_genre = input.genreCode;
    if (input.carrosserieCode) body.vehicule_carroserie = input.carrosserieCode;
    if (input.puissanceAdministrative) body.vehicule_puissance_administrative = String(input.puissanceAdministrative);
    if (input.numeroMoteur) body.vehicule_numero_moteur = input.numeroMoteur;
    if (input.sourceEnergie) body.vehicule_source_energie = input.sourceEnergie;
    if (input.datePremierMiseCirculation) body.vehicule_date_premier_mise = input.datePremierMiseCirculation;

    const { vehiculeId } = await api.post<{ vehiculeId: string }>('/api-vehicules/api/vehicules', body);
    auditApi.log('VEHICULE_CREE', `Véhicule ${input.vehiculeImmatriculation} créé (recensement)`);
    return { vehiculeId };
  },

  /** PUT /api-vehicules/api/vehicules/{id} — même contrôleur brut que create(), pas de DTO strict. */
  async update(id: string, patch: Partial<VehiculeInput>): Promise<Vehicule> {
    await api.put(`/api-vehicules/api/vehicules/${encodeURIComponent(id)}`, toBackendBody(patch));
    const updated = await vehiculesApi.get(id);
    auditApi.log('VEHICULE_MODIFIE', `Véhicule ${updated.vehiculeImmatriculation} modifié`);
    return updated;
  },

  /** DELETE /api-vehicules/api/vehicules/{id}?motif=... — suppression logique uniquement (voir
   *  VehiculeController.delete) : le véhicule disparaît de list() mais reste consultable par id. */
  async remove(id: string, motif: string): Promise<Vehicule> {
    await api.delete(`/api-vehicules/api/vehicules/${encodeURIComponent(id)}${buildQS({ motif })}`);
    const updated = await vehiculesApi.get(id);
    auditApi.log('VEHICULE_SUPPRIME', `Véhicule ${updated.vehiculeImmatriculation} supprimé — motif : ${motif}`);
    return updated;
  },
};

export type { Vehicule };
