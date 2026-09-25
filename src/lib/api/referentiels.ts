import { createStore } from '@/lib/fixtures/store';
import {
  soasFixtures,
  stdsFixtures, ctdsFixtures,
  piecesDossierFixtures,
  etatsGeneralConstateFixtures,
  type CategorieVehicule, type EnergieVehicule, type EtatVehicule, type GenreVehicule,
  type CarrosserieVehicule, type MarqueVehicule, type Region, type District, type Commune,
  type Ministere, type Soa, type Std, type Ctd, type PieceDossier, type SectionConstatation, type ElementConstatation, type TypeLivret,
  type CategorieUtilisationVehicule, type EtatGeneralConstate,
} from '@/lib/fixtures/referentiels.fixtures';
import { api, buildQS } from './client';

function delay<T>(value: T, ms = 100): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** referentiel_rh.rh_ministere, referentiel_siigpe.rsi_categorie_utilisation_vehicule et
 *  traitement_siigpe.tsi_vehicule_marque tels que renvoyés par le hub (camelCase des vraies colonnes,
 *  différentes des champs du mock — voir mapping ci-dessous). */
interface RawMinistere { ministereCode: string; ministereLibelle: string; }
interface RawCategorieUtilisation { categorieUtilisation: string; categorieUtilisationLibelle: string; }
interface RawMarque { vehiculeMarqueId: string; vehiculeMarqueNom: string; }
interface RawSoa { soaCode: string; soaLibelle: string; }
interface RawGenre { genreId: string; genreCode: string; genreLibelle: string; }
interface RawCarrosserie { carrosserieId: string; carrosserieCode: string; carrosserieLibelle: string; }
interface RawCategorieVehicule { categorieCode: string; categorieLibelle: string; }
interface RawEnergie { energieCode: string; energieLibelle: string; }
interface RawEtatVehicule { etatVehicule: string; etatLibelle: string; }
interface RawRegion { idRegion: string; regCode: string; regionLibelle: string; }
interface RawDistrict { districtCode: string; regCode: string; districtLibelle: string; }
interface RawCommune { communeCode: string; districtCode: string; communeLibelle: string; }
interface RawTypeLivret { typeLivretCode: string; typeLivretLibelle: string; }
interface RawPieceDossierAdmin { pieceId: string; typeCode: string; pieceLibelle: string; obligatoire: number | boolean; rang: number | null; }
interface RawSignataire { signataireId: string; signataireCode: string; signataireTitre: string; }
interface RawExpert { expertId: string; expertNom: string; }
interface RawTarifDepense { tarifId: string; annee: number | string; code: string; libelle: string; unite: string; prix: number | string; }
interface RawSectionMisePrix { sectionId: string; categorie: string; sectionCode: string; sectionLibelle: string; ligne: number | null; rang: number | null; }
interface RawElementMisePrix { elementId: string; sectionId: string; elementLibelle: string; rang: number | null; }
interface RawSectionEvaluation { sectionEvaluationId: string; sectionCode: string; sectionLibelle: string; rang: number | null; }
interface RawElementEvaluation {
  elementEvaluationId: string; sectionEvaluationId: string; elementLibelle: string; rang: number | null;
  libelleValeur1: string | null; libelleValeur2: string | null;
}

/** referentiel_siigpe.rsi_piece_dossier tel que renvoyé par le hub — pas de type mock équivalent
 *  (l'existant `PieceDossier` des fixtures n'a pas `obligatoire`/`rang` typés pareil). */
export interface PieceDossierAdmin {
  pieceId: string;
  typeCode: string;
  pieceLibelle: string;
  obligatoire: boolean;
  rang: number | null;
}

/** referentiel_siigpe.rsi_signataire — signataire(s) configurable(s) affiché(s) sur les livrables
 *  générés (voir DemoReportBuilder.java, paramètre `signataireBudget`), éditable depuis
 *  Administration > Référentiels. */
export interface Signataire {
  signataireId: string;
  signataireCode: string;
  signataireTitre: string;
}

/** Code du signataire "Chef de Service Régional du Budget Analamanga" — seul signataire
 *  configurable pour l'instant (voir Script.sql §18.14). */
export const SIGNATAIRE_CHEF_SRB_BUDGET = 'CHEF_SRB_BUDGET';

/** referentiel_siigpe.rsi_section_evaluation / rsi_element_evaluation — grille de la fiche
 *  d'évaluation du véhicule (Organes / Éléments / Pourcentage), éditable depuis Administration >
 *  Référentiels. Un élément a 1 pourcentage, ou 2 si `libelleValeur2` est renseigné (ex. AV / AR). */
export interface SectionEvaluation {
  sectionEvaluationId: string;
  sectionCode: string;
  sectionLibelle: string;
  rang: number;
}
export interface ElementEvaluation {
  elementEvaluationId: string;
  sectionEvaluationId: string;
  elementLibelle: string;
  rang: number;
  libelleValeur1: string | null;
  libelleValeur2: string | null;
}

/** referentiel_siigpe.rsi_section_mise_prix / rsi_element_mise_prix — grilles de la « mise à prix » (jeu Véhicule
 *  et jeu Motocyclette), éditables depuis Administration > Référentiels (Script.sql §18.19). `ligne` = rangée
 *  d'impression : les sections d'une même ligne se partagent la largeur d'une rangée de la grille. */
export interface SectionMisePrix {
  sectionId: string;
  categorie: 'VEHICULE' | 'MOTOCYCLE';
  sectionCode: string;
  sectionLibelle: string;
  ligne: number;
  rang: number;
}
export interface ElementMisePrix {
  elementId: string;
  sectionId: string;
  elementLibelle: string;
  rang: number;
}

/** referentiel_siigpe.rsi_tarif_depense — tarifs annuels (Ariary) servant à chiffrer la dépense annuelle d'un véhicule
 *  pour la brique IA : carburant et huile au litre, lavage / vidange / graissage à l'opération (Script.sql §18.21). */
export interface TarifDepense {
  tarifId: string;
  annee: number;
  code: string;
  libelle: string;
  unite: string;
  prix: number;
}

/** referentiel_siigpe.rsi_expert — liste déroulante "Expert" partagée par Constatation technique
 *  et Réception technique (voir Script.sql §18.15), éditable depuis Administration > Référentiels. */
export interface Expert {
  expertId: string;
  expertNom: string;
}

/** SOA/STD/CTD sont créables à la volée (retour utilisateur SRBA) — mini-stores persistants,
 * contrairement aux autres référentiels de ce fichier qui restent des tableaux statiques. */
const soaStore = createStore<Soa>('referentiel-soa', soasFixtures, (s) => s.soaCode);
const stdStore = createStore<Std>('referentiel-std', stdsFixtures, (s) => s.stdCode);
const ctdStore = createStore<Ctd>('referentiel-ctd', ctdsFixtures, (c) => c.ctdCode);

export const referentielsApi = {
  async categoriesVehicule(): Promise<CategorieVehicule[]> {
    const rows = await api.get<RawCategorieVehicule[]>('/api-vehicules/api/referentiels/categories-vehicule');
    return rows.map((r) => ({ categorieCode: r.categorieCode, categorieLibelle: r.categorieLibelle }));
  },
  async energies(): Promise<EnergieVehicule[]> {
    const rows = await api.get<RawEnergie[]>('/api-vehicules/api/referentiels/energies');
    return rows.map((r) => ({ energieCode: r.energieCode, libelle: r.energieLibelle }));
  },
  async etatsVehicule(): Promise<EtatVehicule[]> {
    const rows = await api.get<RawEtatVehicule[]>('/api-vehicules/api/referentiels/etats-vehicule');
    return rows.map((r) => ({ etatVehicule: r.etatVehicule, libelle: r.etatLibelle }));
  },
  async genres(): Promise<GenreVehicule[]> {
    const rows = await api.get<RawGenre[]>('/api-vehicules/api/referentiels/genres-vehicule');
    return rows.map((r) => ({ genreId: r.genreId, genreCode: r.genreCode, libelle: r.genreLibelle }));
  },
  async carrosseries(): Promise<CarrosserieVehicule[]> {
    const rows = await api.get<RawCarrosserie[]>('/api-vehicules/api/referentiels/carrosseries-vehicule');
    return rows.map((r) => ({ carrosserieId: r.carrosserieId, carrosserieCode: r.carrosserieCode, libelle: r.carrosserieLibelle }));
  },
  /** traitement_siigpe.tsi_vehicule_marque n'a qu'un id, pas de "code" séparé — l'id sert de code. */
  async marques(): Promise<MarqueVehicule[]> {
    const rows = await api.get<RawMarque[]>('/api-vehicules/api/referentiels/marques-vehicule');
    return rows.map((r) => ({ marqueId: r.vehiculeMarqueId, marqueCode: r.vehiculeMarqueId, libelle: r.vehiculeMarqueNom }));
  },
  async regions(): Promise<Region[]> {
    const rows = await api.get<RawRegion[]>('/api-vehicules/api/referentiels/regions');
    return rows.map((r) => ({ idRegion: r.idRegion, regCode: r.regCode, regionLibelle: r.regionLibelle, districtCode: '' }));
  },
  /** referentiel_national.rn_district n'a aucune colonne uuid — le lien avec la région se fait par
   *  reg_code (varchar), pas par entite_vehicule.region_id (le vrai id_region uuid). */
  async districts(regCode?: string): Promise<District[]> {
    const rows = await api.get<RawDistrict[]>(`/api-vehicules/api/referentiels/districts${buildQS({ regCode })}`);
    return rows.map((r) => ({ districtCode: r.districtCode, regCode: r.regCode, districtLibelle: r.districtLibelle }));
  },
  async communes(districtCode?: string): Promise<Commune[]> {
    const rows = await api.get<RawCommune[]>(`/api-vehicules/api/referentiels/communes${buildQS({ districtCode })}`);
    return rows.map((r) => ({ communeCode: r.communeCode, districtCode: r.districtCode, communeLibelle: r.communeLibelle }));
  },
  async ministeres(): Promise<Ministere[]> {
    const rows = await api.get<RawMinistere[]>('/api-vehicules/api/referentiels/ministeres');
    return rows.map((r) => ({ minCode: r.ministereCode, libelle: r.ministereLibelle }));
  },
  /**
   * Recherche serveur (referentiel_rh.rh_soa, 20 101 soa_code distincts — jamais chargé en
   * intégralité, voir queries.yml) plafonnée à 50 résultats, fusionnée avec les codes ajoutés "à
   * la volée" en session (`createSoa`, toujours local — aucun endpoint d'écriture réel, cf. plan).
   * `q` vide renvoie les 50 premiers par ordre alphabétique (état initial du combobox).
   */
  async soas(q = ''): Promise<Soa[]> {
    const [reels, locaux] = await Promise.all([
      api.get<RawSoa[]>(`/api-vehicules/api/referentiels/soas${buildQS({ q })}`),
      soaStore.list(),
    ]);
    const parCode = new Map(reels.map((r) => [r.soaCode, { soaCode: r.soaCode, libelle: r.soaLibelle }]));
    for (const s of locaux) {
      if (!q || s.soaCode.toLowerCase().includes(q.toLowerCase()) || s.libelle.toLowerCase().includes(q.toLowerCase())) {
        parCode.set(s.soaCode, s);
      }
    }
    return [...parCode.values()];
  },
  stds:                 (): Promise<Std[]> => stdStore.list(),
  ctds:                 (): Promise<Ctd[]> => ctdStore.list(),
  createSoa:            (input: Soa): Promise<Soa> => soaStore.create(input),
  createStd:            (input: Std): Promise<Std> => stdStore.create(input),
  createCtd:            (input: Ctd): Promise<Ctd> => ctdStore.create(input),
  piecesDossier:        (typeCode: string): Promise<PieceDossier[]> =>
    delay(piecesDossierFixtures.filter((p) => p.typeCode === typeCode).sort((a, b) => a.rang - b.rang)),
  async sectionsConstatation(): Promise<SectionConstatation[]> {
    const rows = await api.get<SectionConstatation[]>('/api-constatation/api/referentiels/sections-constatation');
    return [...rows].sort((a, b) => a.rang - b.rang);
  },
  async elementsConstatation(sectionId: string): Promise<ElementConstatation[]> {
    const rows = await api.get<ElementConstatation[]>(`/api-constatation/api/referentiels/elements-constatation${buildQS({ sectionId })}`);
    return [...rows].sort((a, b) => a.rang - b.rang);
  },
  /** referentiel_siigpe.rsi_type_livret — endpoint déjà réel côté backend (api-arretagelivret),
   *  jamais branché côté front jusqu'ici (oubli, corrigé au passage). */
  async typesLivret(): Promise<TypeLivret[]> {
    const rows = await api.get<RawTypeLivret[]>('/api-arretagelivret/api/referentiels/types-livret');
    return rows.map((r) => ({ typeLivretCode: r.typeLivretCode, libelle: r.typeLivretLibelle }));
  },
  async categoriesUtilisationVehicule(): Promise<CategorieUtilisationVehicule[]> {
    const rows = await api.get<RawCategorieUtilisation[]>('/api-vehicules/api/referentiels/categories-utilisation-vehicule');
    return rows.map((r) => ({ categorieUtilisationCode: r.categorieUtilisation, libelle: r.categorieUtilisationLibelle }));
  },
  /** Pas de table réelle : `etat_general` n'est qu'une colonne codée sur ts_recensement_ligne
   *  (voir Script.sql), cette énumération UI reste donc statique — rien à brancher ici. */
  etatsGeneralConstate: (): Promise<EtatGeneralConstate[]> => delay(etatsGeneralConstateFixtures),

  /** referentiel_siigpe.rsi_piece_dossier — aucune lecture publique n'existait avant l'admin
   *  référentiels (voir AdminReferentielController, seule table de la whitelist sans GET ailleurs). */
  async piecesDossierAdmin(typeCode?: string): Promise<PieceDossierAdmin[]> {
    const rows = await api.get<RawPieceDossierAdmin[]>(`/api-financiere/rest/admin/referentiels/piece-dossier${buildQS({ typeCode })}`);
    return rows.map((r) => ({
      pieceId: r.pieceId, typeCode: r.typeCode, pieceLibelle: r.pieceLibelle,
      obligatoire: Boolean(Number(r.obligatoire)), rang: r.rang,
    }));
  },

  /** referentiel_siigpe.rsi_signataire — même patron que `piecesDossierAdmin` (aucune lecture
   *  publique n'existait pour ce concept avant cet écran d'administration), mais aussi utilisé
   *  directement par les 9 dialogs d'aperçu de livrable (voir `useSignataireBudget`) — le GET de
   *  AdminReferentielController n'est gardé par aucun rôle. */
  async signataires(): Promise<Signataire[]> {
    return api.get<RawSignataire[]>('/api-financiere/rest/admin/referentiels/signataire');
  },

  /** referentiel_siigpe.rsi_expert — même patron que `signataires` ci-dessus. */
  async experts(): Promise<Expert[]> {
    return api.get<RawExpert[]>('/api-financiere/rest/admin/referentiels/expert');
  },

  async sectionsEvaluation(): Promise<SectionEvaluation[]> {
    const rows = await api.get<RawSectionEvaluation[]>('/api-financiere/rest/admin/referentiels/section-evaluation');
    return rows.map((r) => ({ ...r, rang: r.rang ?? 0 })).sort((a, b) => a.rang - b.rang);
  },

  async elementsEvaluation(sectionEvaluationId?: string): Promise<ElementEvaluation[]> {
    const rows = await api.get<RawElementEvaluation[]>(
      `/api-financiere/rest/admin/referentiels/element-evaluation${buildQS({ sectionId: sectionEvaluationId })}`);
    return rows.map((r) => ({ ...r, rang: r.rang ?? 0 })).sort((a, b) => a.rang - b.rang);
  },

  async sectionsMisePrix(categorie?: string): Promise<SectionMisePrix[]> {
    const rows = await api.get<RawSectionMisePrix[]>(
      `/api-financiere/rest/admin/referentiels/section-mise-prix${buildQS({ categorie })}`);
    return rows
      .map((r) => ({ ...r, categorie: r.categorie as SectionMisePrix['categorie'], ligne: r.ligne ?? 1, rang: r.rang ?? 0 }))
      .sort((a, b) => a.ligne - b.ligne || a.rang - b.rang);
  },

  async elementsMisePrix(sectionId?: string): Promise<ElementMisePrix[]> {
    const rows = await api.get<RawElementMisePrix[]>(
      `/api-financiere/rest/admin/referentiels/element-mise-prix${buildQS({ sectionId })}`);
    return rows.map((r) => ({ ...r, rang: r.rang ?? 0 })).sort((a, b) => a.rang - b.rang);
  },

  async tarifsDepense(annee?: number): Promise<TarifDepense[]> {
    const rows = await api.get<RawTarifDepense[]>(
      `/api-financiere/rest/admin/referentiels/tarif-depense${buildQS({ annee })}`);
    return rows
      .map((r) => ({ ...r, annee: Number(r.annee), prix: Number(r.prix) }))
      .sort((a, b) => b.annee - a.annee || a.code.localeCompare(b.code));
  },

  /** CRUD générique admin — un seul contrôleur backend pour les 11 tables (voir
   *  AdminReferentielController), réutilisé tel quel par `ReferentielCrudCard`. */
  createReferentiel: (slug: string, data: Record<string, unknown>) =>
    api.post<{ [key: string]: string }>(`/api-financiere/rest/admin/referentiels/${slug}`, data),
  updateReferentiel: (slug: string, id: string, data: Record<string, unknown>) =>
    api.put<{ status: string }>(`/api-financiere/rest/admin/referentiels/${slug}/${encodeURIComponent(id)}`, data),
  deleteReferentiel: (slug: string, id: string) =>
    api.delete<{ status: string }>(`/api-financiere/rest/admin/referentiels/${slug}/${encodeURIComponent(id)}`),
};

export type {
  CategorieVehicule, EnergieVehicule, EtatVehicule, GenreVehicule, CarrosserieVehicule,
  MarqueVehicule, Region, District, Commune, Ministere, Soa, Std, Ctd, PieceDossier, SectionConstatation,
  ElementConstatation, TypeLivret, CategorieUtilisationVehicule, EtatGeneralConstate,
};
