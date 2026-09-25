/** Référentiels de base — referentiel_national / referentiel_siigpe / bscva (Script.sql) */

export interface CategorieVehicule { categorieCode: string; categorieLibelle: string; }
export interface EnergieVehicule { energieCode: string; libelle: string; }
export interface EtatVehicule { etatVehicule: string; libelle: string; }
export interface CategorieUtilisationVehicule { categorieUtilisationCode: string; libelle: string; }
export interface EtatGeneralConstate { etatGeneralCode: string; libelle: string; }
export interface GenreVehicule { genreId: string; genreCode: string; libelle: string; }
export interface CarrosserieVehicule { carrosserieId: string; carrosserieCode: string; libelle: string; }
export interface MarqueVehicule { marqueId: string; marqueCode: string; libelle: string; }

export interface Region { idRegion: string; regCode: string; regionLibelle: string; districtCode: string; }
export interface District { districtCode: string; regCode: string; districtLibelle: string; }
export interface Commune { communeCode: string; districtCode: string; communeLibelle: string; }

export interface Ministere { minCode: string; libelle: string; }
export interface Soa { soaCode: string; libelle: string; }
export interface Std { stdCode: string; libelle: string; }
export interface Ctd { ctdCode: string; libelle: string; }
export interface PieceDossier { pieceId: string; typeCode: string; pieceLibelle: string; obligatoire: boolean; rang: number; }
export interface SectionConstatation { sectionId: string; sectionCode: string; sectionLibelle: string; rang: number; }
export interface ElementConstatation { elementId: string; sectionId: string; elementLibelle: string; rang: number; }
export interface TypeLivret { typeLivretCode: string; libelle: string; }

export const categoriesVehiculeFixtures: CategorieVehicule[] = [
  { categorieCode: 'BERLINE',  categorieLibelle: 'Berline' },
  { categorieCode: '4X4',      categorieLibelle: 'Tout-terrain (4x4)' },
  { categorieCode: 'CAMION',   categorieLibelle: 'Camion' },
  { categorieCode: 'MOTO',     categorieLibelle: 'Moto' },
  { categorieCode: 'BUS',      categorieLibelle: 'Bus / Minibus' },
  { categorieCode: 'PICKUP',   categorieLibelle: 'Pick-up' },
];

export const energiesVehiculeFixtures: EnergieVehicule[] = [
  { energieCode: 'ESSENCE', libelle: 'Essence' },
  { energieCode: 'GASOIL',  libelle: 'Gasoil' },
  { energieCode: 'HYBRIDE', libelle: 'Hybride' },
  { energieCode: 'ELECTRIQUE', libelle: 'Électrique' },
];

export const etatsVehiculeFixtures: EtatVehicule[] = [
  { etatVehicule: 'BON',      libelle: 'Bon état' },
  { etatVehicule: 'MOYEN',    libelle: 'État moyen' },
  { etatVehicule: 'MAUVAIS',  libelle: 'Mauvais état' },
  { etatVehicule: 'HS',       libelle: 'Hors service' },
];

/** referentiel_siigpe.rsi_categorie_utilisation_vehicule (Script.sql) — usage du véhicule, distinct de la carrosserie/catégorie */
export const categoriesUtilisationVehiculeFixtures: CategorieUtilisationVehicule[] = [
  { categorieUtilisationCode: '1', libelle: 'Représentation' },
  { categorieUtilisationCode: '2', libelle: 'Fonction' },
  { categorieUtilisationCode: '3', libelle: 'Service' },
];

/**
 * Échelle fonctionnelle « constatée sur le terrain » (1 marche / 2 panne / 3 calle / 4 epave) —
 * distincte de EtatVehicule (échelle qualitative BON/MOYEN/MAUVAIS/HS de la fiche véhicule
 * permanente). Partagée par bscva.recensement_ligne.etat_general et
 * bscva.constatation_technique.etat_general (Script.sql).
 */
export const etatsGeneralConstateFixtures: EtatGeneralConstate[] = [
  { etatGeneralCode: '1', libelle: 'En marche' },
  { etatGeneralCode: '2', libelle: 'En panne' },
  { etatGeneralCode: '3', libelle: 'Sur cale' },
  { etatGeneralCode: '4', libelle: 'Épave' },
];

export const genresVehiculeFixtures: GenreVehicule[] = [
  { genreId: 'genre-vp',  genreCode: 'VP',  libelle: 'Véhicule particulier' },
  { genreId: 'genre-vu',  genreCode: 'VU',  libelle: 'Véhicule utilitaire' },
  { genreId: 'genre-ctte', genreCode: 'CTTE', libelle: 'Camionnette' },
  { genreId: 'genre-tcp', genreCode: 'TCP', libelle: 'Transport en commun de personnes' },
];

export const carrosseriesVehiculeFixtures: CarrosserieVehicule[] = [
  { carrosserieId: 'carr-berline', carrosserieCode: 'BERLINE', libelle: 'Berline' },
  { carrosserieId: 'carr-break',   carrosserieCode: 'BREAK',   libelle: 'Break' },
  { carrosserieId: 'carr-4x4',     carrosserieCode: '4X4',     libelle: 'Tout-terrain' },
  { carrosserieId: 'carr-plateau', carrosserieCode: 'PLATEAU', libelle: 'Plateau' },
];

export const marquesVehiculeFixtures: MarqueVehicule[] = [
  { marqueId: 'marque-toyota',    marqueCode: 'TOYOTA',    libelle: 'Toyota' },
  { marqueId: 'marque-nissan',    marqueCode: 'NISSAN',    libelle: 'Nissan' },
  { marqueId: 'marque-mitsubishi', marqueCode: 'MITSUBISHI', libelle: 'Mitsubishi' },
  { marqueId: 'marque-hyundai',   marqueCode: 'HYUNDAI',   libelle: 'Hyundai' },
  { marqueId: 'marque-mercedes',  marqueCode: 'MERCEDES',  libelle: 'Mercedes-Benz' },
];

export const regionsFixtures: Region[] = [
  { idRegion: 'region-analamanga', regCode: 'REG-ALA', regionLibelle: 'Analamanga', districtCode: 'DIST-ANTA' },
  { idRegion: 'region-vakinankaratra', regCode: 'REG-VAK', regionLibelle: 'Vakinankaratra', districtCode: 'DIST-ANTS' },
];

export const districtsFixtures: District[] = [
  { districtCode: 'DIST-ANTA', regCode: 'REG-ALA', districtLibelle: 'Antananarivo Renivohitra' },
  { districtCode: 'DIST-AVAR', regCode: 'REG-ALA', districtLibelle: 'Avaradrano' },
  { districtCode: 'DIST-ANTS', regCode: 'REG-VAK', districtLibelle: 'Antsirabe I' },
];

export const communesFixtures: Commune[] = [
  { communeCode: 'COM-1ARR', districtCode: 'DIST-ANTA', communeLibelle: 'Antananarivo I' },
  { communeCode: 'COM-4ARR', districtCode: 'DIST-ANTA', communeLibelle: 'Antananarivo IV' },
  { communeCode: 'COM-AMBO', districtCode: 'DIST-AVAR', communeLibelle: 'Ambohimanga Rova' },
  { communeCode: 'COM-ANTS', districtCode: 'DIST-ANTS', communeLibelle: 'Antsirabe I' },
];

/** workflow.wf_type_acte (11 processus BSCVA) */
export const TYPE_ACTE_CODES = {
  REC: 'REC', CST: 'CST', VBC: 'VBC', RCT: 'RCT', RNE: 'RNE',
  ARL: 'ARL', LOC: 'LOC', CAR: 'CAR', EXP: 'EXP', CDN: 'CDN', TCH: 'TCH',
} as const;

/**
 * referentiel_rh.rh_ministere (Script.sql) — la table existe mais n'a aucune ligne seedée dans le
 * script SQL de référence ; libellés plausibles inventés ici pour les 2 seuls codes utilisés dans
 * l'application (`MIN-FIN`, `MIN-BUD`), à remplacer par les vraies données une fois le backend branché.
 */
export const ministeresFixtures: Ministere[] = [
  { minCode: 'MIN-FIN', libelle: "Ministère de l'Économie et des Finances" },
  { minCode: 'MIN-BUD', libelle: 'Ministère du Budget et des Comptes Publics' },
];

/**
 * referentiel_rh.rh_soa (Script.sql) — la table réelle est une table budgétaire complexe (codes
 * GAC/ordonnateur/comptable...) sans lien direct avec un simple libellé de service ; simplifiée ici
 * en soaCode/libelle pour ce mock, comme ministeresFixtures, à remplacer par les vraies données une
 * fois le backend branché. Codes repris de ceux déjà utilisés ailleurs dans l'application
 * (recensement, chauffeurs).
 */
export const soasFixtures: Soa[] = [
  { soaCode: 'SRB-ALA', libelle: 'Service Régional du Budget Analamanga' },
  { soaCode: 'BSCVA', libelle: 'Bureau du Suivi et de Contrôle des Véhicules Administratifs' },
  { soaCode: 'DRPE-ALA', libelle: "Division Régionale du Patrimoine de l'État Analamanga" },
];

/**
 * Service Technique Déconcentré — référentiel simplifié, champ indépendant du SOA (pas de
 * hiérarchie construite entre les deux, à la demande du retour utilisateur SRBA). Données
 * plausibles à remplacer par les vraies données une fois le backend branché.
 */
export const stdsFixtures: Std[] = [
  { stdCode: 'STD-DRPE-ALA', libelle: "Direction Régionale du Patrimoine de l'État Analamanga" },
  { stdCode: 'STD-DRB-ALA', libelle: 'Direction Régionale du Budget Analamanga' },
];

/**
 * Collectivité Territoriale Décentralisée — référentiel simplifié, indépendant du référentiel
 * géographique existant (`referentiel_national` région/district/commune), à la demande du retour
 * utilisateur SRBA. Données plausibles à remplacer par les vraies données.
 */
export const ctdsFixtures: Ctd[] = [
  { ctdCode: 'CTD-REG-ALA', libelle: 'Région Analamanga' },
  { ctdCode: 'CTD-CUA', libelle: "Commune Urbaine d'Antananarivo" },
];

/**
 * bscva.piece_dossier (Script.sql, seed complet) — pièces exigibles par type de dossier, reprises
 * mot pour mot du script SQL de référence (55 lignes, processus I à VIII).
 */
export const piecesDossierFixtures: PieceDossier[] = [
  // I — Recensement
  { pieceId: 'p-rec-1', typeCode: 'REC', pieceLibelle: "Bordereau d'envoi (contact + n° téléphone)", obligatoire: true, rang: 1 },
  { pieceId: 'p-rec-2', typeCode: 'REC', pieceLibelle: 'Demande de recensement (Mme le Chef SRB Analamanga)', obligatoire: true, rang: 2 },
  { pieceId: 'p-rec-3', typeCode: 'REC', pieceLibelle: 'Livret (GSS, SA, PE)', obligatoire: true, rang: 3 },
  { pieceId: 'p-rec-4', typeCode: 'REC', pieceLibelle: 'Photocopie carte grise ou rose', obligatoire: true, rang: 4 },
  { pieceId: 'p-rec-5', typeCode: 'REC', pieceLibelle: 'Canevas de recensement', obligatoire: true, rang: 5 },

  // II — Constatation
  { pieceId: 'p-cst-1', typeCode: 'CST', pieceLibelle: "Bordereau d'envoi (contact + tél pour rendez-vous)", obligatoire: true, rang: 1 },
  { pieceId: 'p-cst-2', typeCode: 'CST', pieceLibelle: 'Demande de constatation technique (M. le Chef SRB)', obligatoire: true, rang: 2 },
  { pieceId: 'p-cst-3', typeCode: 'CST', pieceLibelle: "Photocopie quitus de l'année en cours", obligatoire: true, rang: 3 },
  { pieceId: 'p-cst-4', typeCode: 'CST', pieceLibelle: 'Proposition de constatation', obligatoire: true, rang: 4 },
  { pieceId: 'p-cst-5', typeCode: 'CST', pieceLibelle: 'Livret (GSS, SA, PE)', obligatoire: true, rang: 5 },
  { pieceId: 'p-cst-6', typeCode: 'CST', pieceLibelle: 'Photocopie carte grise', obligatoire: true, rang: 6 },
  { pieceId: 'p-cst-7', typeCode: 'CST', pieceLibelle: 'Note de présentation / explicative (si anomalies)', obligatoire: false, rang: 7 },

  // III — Visa BC
  { pieceId: 'p-vbc-1', typeCode: 'VBC', pieceLibelle: "Bordereau d'envoi (contact + tél)", obligatoire: true, rang: 1 },
  { pieceId: 'p-vbc-2', typeCode: 'VBC', pieceLibelle: 'Demande de visa de bon de commande (Mme le Chef SRB)', obligatoire: true, rang: 2 },
  { pieceId: 'p-vbc-3', typeCode: 'VBC', pieceLibelle: "Photocopie quitus de l'année en cours", obligatoire: true, rang: 3 },
  { pieceId: 'p-vbc-4', typeCode: 'VBC', pieceLibelle: 'Photocopie carte grise ou rose', obligatoire: true, rang: 4 },
  { pieceId: 'p-vbc-5', typeCode: 'VBC', pieceLibelle: 'Photocopie PV de constatation technique', obligatoire: true, rang: 5 },
  { pieceId: 'p-vbc-6', typeCode: 'VBC', pieceLibelle: 'Bon de commande original', obligatoire: true, rang: 6 },
  { pieceId: 'p-vbc-7', typeCode: 'VBC', pieceLibelle: 'Photocopie du bon de commande', obligatoire: true, rang: 7 },
  { pieceId: 'p-vbc-8', typeCode: 'VBC', pieceLibelle: 'Photocopie NIF/STAT fournisseur', obligatoire: true, rang: 8 },
  { pieceId: 'p-vbc-9', typeCode: 'VBC', pieceLibelle: 'Facture pro-forma + photocopie', obligatoire: true, rang: 9 },
  { pieceId: 'p-vbc-10', typeCode: 'VBC', pieceLibelle: 'Photocopie convention ou marché', obligatoire: true, rang: 10 },
  { pieceId: 'p-vbc-11', typeCode: 'VBC', pieceLibelle: 'Livret Service Automobile (SA) renseigné', obligatoire: true, rang: 11 },
  { pieceId: 'p-vbc-12', typeCode: 'VBC', pieceLibelle: 'Note explicative (si TEF visé par le CF avant visa)', obligatoire: false, rang: 12 },

  // IV — Réception technique
  { pieceId: 'p-rct-1', typeCode: 'RCT', pieceLibelle: "Bordereau d'envoi (contact + tél pour rendez-vous)", obligatoire: true, rang: 1 },
  { pieceId: 'p-rct-2', typeCode: 'RCT', pieceLibelle: 'Demande de réception technique (Mme le Chef SRB)', obligatoire: true, rang: 2 },
  { pieceId: 'p-rct-3', typeCode: 'RCT', pieceLibelle: "Photocopie quitus de l'année en cours", obligatoire: true, rang: 3 },
  { pieceId: 'p-rct-4', typeCode: 'RCT', pieceLibelle: 'Photocopie PV de constatation', obligatoire: true, rang: 4 },
  { pieceId: 'p-rct-5', typeCode: 'RCT', pieceLibelle: 'Photocopie du bon de commande', obligatoire: true, rang: 5 },
  { pieceId: 'p-rct-6', typeCode: 'RCT', pieceLibelle: 'Photocopie NIF/STAT fournisseur', obligatoire: true, rang: 6 },
  { pieceId: 'p-rct-7', typeCode: 'RCT', pieceLibelle: 'Photocopie TEF', obligatoire: true, rang: 7 },
  { pieceId: 'p-rct-8', typeCode: 'RCT', pieceLibelle: 'Liste de pièces remplacées', obligatoire: true, rang: 8 },

  // V — Réception VA neuf
  { pieceId: 'p-rne-1', typeCode: 'RNE', pieceLibelle: "Bordereau d'envoi (contact + tél pour rendez-vous)", obligatoire: true, rang: 1 },
  { pieceId: 'p-rne-2', typeCode: 'RNE', pieceLibelle: 'Demande de réception technique (M. le Chef SRB)', obligatoire: true, rang: 2 },
  { pieceId: 'p-rne-3', typeCode: 'RNE', pieceLibelle: "Photocopie quitus de l'année en cours", obligatoire: true, rang: 3 },
  { pieceId: 'p-rne-4', typeCode: 'RNE', pieceLibelle: 'Liste des véhicules à réceptionner', obligatoire: true, rang: 4 },
  { pieceId: 'p-rne-5', typeCode: 'RNE', pieceLibelle: 'Photocopie carte rose ou grise des véhicules', obligatoire: true, rang: 5 },
  { pieceId: 'p-rne-6', typeCode: 'RNE', pieceLibelle: 'Photocopie légalisée marché ou convention', obligatoire: true, rang: 6 },
  { pieceId: 'p-rne-7', typeCode: 'RNE', pieceLibelle: 'Décision de nomination du dépositaire comptable', obligatoire: true, rang: 7 },
  { pieceId: 'p-rne-8', typeCode: 'RNE', pieceLibelle: 'Décision de nomination des membres de commission (1 président + 2 membres)', obligatoire: true, rang: 8 },

  // VI — Arrêtage livret
  { pieceId: 'p-arl-1', typeCode: 'ARL', pieceLibelle: "Bordereau d'envoi (contact + tél)", obligatoire: true, rang: 1 },
  { pieceId: 'p-arl-2', typeCode: 'ARL', pieceLibelle: 'Demande de visa arrêtage livret (Mme le Chef SRB)', obligatoire: true, rang: 2 },
  { pieceId: 'p-arl-3', typeCode: 'ARL', pieceLibelle: 'Attestation de catégorie (véhicule de fonction)', obligatoire: false, rang: 3 },
  { pieceId: 'p-arl-4', typeCode: 'ARL', pieceLibelle: 'Les 3 livrets arrêtés au 31/12 (par rubrique)', obligatoire: true, rang: 4 },
  { pieceId: 'p-arl-5', typeCode: 'ARL', pieceLibelle: 'Photocopie du dernier bon de commande', obligatoire: true, rang: 5 },
  { pieceId: 'p-arl-6', typeCode: 'ARL', pieceLibelle: 'Note explicative (renouvellement / égaré / anomalie)', obligatoire: false, rang: 6 },

  // VII — Location
  { pieceId: 'p-loc-1', typeCode: 'LOC', pieceLibelle: "Bordereau d'envoi (contact + tél pour rendez-vous)", obligatoire: true, rang: 1 },
  { pieceId: 'p-loc-2', typeCode: 'LOC', pieceLibelle: "Demande d'attestation d'aptitude / de location (Mme le Chef SRB)", obligatoire: true, rang: 2 },
  { pieceId: 'p-loc-3', typeCode: 'LOC', pieceLibelle: 'Photocopie carte grise ou carte rose', obligatoire: true, rang: 3 },
  { pieceId: 'p-loc-4', typeCode: 'LOC', pieceLibelle: 'Contrat de location original + photocopie', obligatoire: true, rang: 4 },
  { pieceId: 'p-loc-5', typeCode: 'LOC', pieceLibelle: 'Photocopie NIF/STAT fournisseur', obligatoire: true, rang: 5 },
  { pieceId: 'p-loc-6', typeCode: 'LOC', pieceLibelle: 'Photocopie facture pro-forma / marché / convention', obligatoire: true, rang: 6 },

  // VIII — Attestation de caractéristiques
  { pieceId: 'p-car-1', typeCode: 'CAR', pieceLibelle: "Bordereau d'envoi (contact + tél pour rendez-vous)", obligatoire: true, rang: 1 },
  { pieceId: 'p-car-2', typeCode: 'CAR', pieceLibelle: "Demande d'attestation de caractéristiques (Mme le Chef SRB)", obligatoire: true, rang: 2 },
  { pieceId: 'p-car-3', typeCode: 'CAR', pieceLibelle: 'Photocopie de la carte grise', obligatoire: true, rang: 3 },
  { pieceId: 'p-car-4', typeCode: 'CAR', pieceLibelle: 'Attestation de déclaration de perte', obligatoire: true, rang: 4 },
];

/**
 * Sections et éléments de la Fiche de diagnostic technique (constatation avant réparation) —
 * recopiés fidèlement depuis le seed SQL officiel (Script.sql, section « Sections et éléments de
 * la Fiche de Constatation technique »), lui-même issu du classeur
 * "IMPRIMES DIGITALISATION 2026.xlsx" (feuille "Fiche de Constatation").
 * sectionCode reprend le section_code SQL — utilisé pour détecter la section PNEUMATIQUE
 * (traitement spécial % dans l'écran, pas conforme/non-conforme).
 */
export const sectionsConstatationFixtures: SectionConstatation[] = [
  { sectionId: 'sec-moteur',              sectionCode: 'MOTEUR',              sectionLibelle: 'Moteur', rang: 1 },
  { sectionId: 'sec-organe-transmission', sectionCode: 'ORGANE_TRANSMISSION', sectionLibelle: 'Organe de transmission et d’utilisation', rang: 2 },
  { sectionId: 'sec-freinage',            sectionCode: 'FREINAGE',            sectionLibelle: 'Système de freinage', rang: 3 },
  { sectionId: 'sec-trains-suspension',   sectionCode: 'TRAINS_SUSPENSION',   sectionLibelle: 'Trains et suspension (avant et arrière)', rang: 4 },
  { sectionId: 'sec-direction',           sectionCode: 'DIRECTION',           sectionLibelle: 'Système de direction', rang: 5 },
  { sectionId: 'sec-alimentation-carburant', sectionCode: 'ALIMENTATION_CARBURANT', sectionLibelle: 'Alimentation carburant', rang: 6 },
  { sectionId: 'sec-refroidissement',     sectionCode: 'REFROIDISSEMENT',     sectionLibelle: 'Système de refroidissement moteur', rang: 7 },
  { sectionId: 'sec-electricite',         sectionCode: 'ELECTRICITE',         sectionLibelle: 'Électricité', rang: 8 },
  { sectionId: 'sec-climatisation',       sectionCode: 'CLIMATISATION',       sectionLibelle: 'Climatisation', rang: 9 },
  { sectionId: 'sec-tolerie',             sectionCode: 'TOLERIE',             sectionLibelle: 'Tôlerie', rang: 10 },
  { sectionId: 'sec-capitonnage',         sectionCode: 'CAPITONNAGE',         sectionLibelle: 'Capitonnage', rang: 11 },
  { sectionId: 'sec-vitrerie',            sectionCode: 'VITRERIE',            sectionLibelle: 'Vitrerie', rang: 12 },
  { sectionId: 'sec-optiques',            sectionCode: 'OPTIQUES',            sectionLibelle: 'Optiques', rang: 13 },
  { sectionId: 'sec-fibres-plastiques',   sectionCode: 'FIBRES_PLASTIQUES',   sectionLibelle: 'Fibres plastiques', rang: 14 },
  { sectionId: 'sec-peintures',           sectionCode: 'PEINTURES',           sectionLibelle: 'Peintures', rang: 15 },
  { sectionId: 'sec-pneumatique',         sectionCode: 'PNEUMATIQUE',         sectionLibelle: 'Pneumatique', rang: 16 },
  { sectionId: 'sec-reglages',            sectionCode: 'REGLAGES',            sectionLibelle: 'Réglages', rang: 17 },
];

export const elementsConstatationFixtures: ElementConstatation[] = [
  // MOTEUR (10)
  { elementId: 'el-moteur-culasse',          sectionId: 'sec-moteur', elementLibelle: 'Culasse', rang: 1 },
  { elementId: 'el-moteur-turbo',            sectionId: 'sec-moteur', elementLibelle: 'Turbo', rang: 2 },
  { elementId: 'el-moteur-admission-air',    sectionId: 'sec-moteur', elementLibelle: 'Système admission air', rang: 3 },
  { elementId: 'el-moteur-bas-moteur',       sectionId: 'sec-moteur', elementLibelle: 'Bas moteur', rang: 4 },
  { elementId: 'el-moteur-collecteur-echap', sectionId: 'sec-moteur', elementLibelle: 'Collecteur échappement', rang: 5 },
  { elementId: 'el-moteur-filtres',          sectionId: 'sec-moteur', elementLibelle: 'Filtres', rang: 6 },
  { elementId: 'el-moteur-courroies',        sectionId: 'sec-moteur', elementLibelle: 'Courroies crantée', rang: 7 },
  { elementId: 'el-moteur-tendeur',          sectionId: 'sec-moteur', elementLibelle: 'Tendeur', rang: 8 },
  { elementId: 'el-moteur-avertisseur',      sectionId: 'sec-moteur', elementLibelle: 'Avertisseur sonore', rang: 9 },
  { elementId: 'el-moteur-supports',         sectionId: 'sec-moteur', elementLibelle: 'Supports moteur', rang: 10 },

  // ORGANE DE TRANSMISSION ET D'UTILISATION (8)
  { elementId: 'el-transmission-boite-vitesse',  sectionId: 'sec-organe-transmission', elementLibelle: 'Boîte de vitesse', rang: 1 },
  { elementId: 'el-transmission-boite-transfert', sectionId: 'sec-organe-transmission', elementLibelle: 'Boîte de transfert', rang: 2 },
  { elementId: 'el-transmission-relais',         sectionId: 'sec-organe-transmission', elementLibelle: 'Relais', rang: 3 },
  { elementId: 'el-transmission-embrayage',      sectionId: 'sec-organe-transmission', elementLibelle: 'Système d’embrayage', rang: 4 },
  { elementId: 'el-transmission-pont-avant',     sectionId: 'sec-organe-transmission', elementLibelle: 'Pont avant', rang: 5 },
  { elementId: 'el-transmission-pont-arriere',   sectionId: 'sec-organe-transmission', elementLibelle: 'Pont arrière', rang: 6 },
  { elementId: 'el-transmission-arbre',          sectionId: 'sec-organe-transmission', elementLibelle: 'Arbre transmission', rang: 7 },
  { elementId: 'el-transmission-supports-boite', sectionId: 'sec-organe-transmission', elementLibelle: 'Supports boîte', rang: 8 },

  // SYSTEME DE FREINAGE (9)
  { elementId: 'el-freinage-disques',    sectionId: 'sec-freinage', elementLibelle: 'Disques/Plaquette/Ferodo', rang: 1 },
  { elementId: 'el-freinage-tambours',   sectionId: 'sec-freinage', elementLibelle: 'Tambours', rang: 2 },
  { elementId: 'el-freinage-cylindre',   sectionId: 'sec-freinage', elementLibelle: 'Cylindre de roues', rang: 3 },
  { elementId: 'el-freinage-etriers',    sectionId: 'sec-freinage', elementLibelle: 'Etriers', rang: 4 },
  { elementId: 'el-freinage-garnitures', sectionId: 'sec-freinage', elementLibelle: 'Garnitures', rang: 5 },
  { elementId: 'el-freinage-pompe',      sectionId: 'sec-freinage', elementLibelle: 'Pompe centrale', rang: 6 },
  { elementId: 'el-freinage-servofrein', sectionId: 'sec-freinage', elementLibelle: 'Servofrein', rang: 7 },
  { elementId: 'el-freinage-circuit',    sectionId: 'sec-freinage', elementLibelle: 'Circuit freinage', rang: 8 },
  { elementId: 'el-freinage-frein-main', sectionId: 'sec-freinage', elementLibelle: 'Frein à main', rang: 9 },

  // TRAINS ET SUSPENSION (avant et arrière) (8)
  { elementId: 'el-suspension-barre-torsion', sectionId: 'sec-trains-suspension', elementLibelle: 'Barre de torsion', rang: 1 },
  { elementId: 'el-suspension-barre-stab',    sectionId: 'sec-trains-suspension', elementLibelle: 'Barre stabilisatrice', rang: 2 },
  { elementId: 'el-suspension-biellettes',    sectionId: 'sec-trains-suspension', elementLibelle: 'Biellettes barre stabilisatrice', rang: 3 },
  { elementId: 'el-suspension-bras',          sectionId: 'sec-trains-suspension', elementLibelle: 'Bras de suspension', rang: 4 },
  { elementId: 'el-suspension-sillent-bloc',  sectionId: 'sec-trains-suspension', elementLibelle: 'Sillent bloc bras', rang: 5 },
  { elementId: 'el-suspension-ressorts',      sectionId: 'sec-trains-suspension', elementLibelle: 'Ressorts / Amortisseurs', rang: 6 },
  { elementId: 'el-suspension-roulements',    sectionId: 'sec-trains-suspension', elementLibelle: 'Roulements', rang: 7 },
  { elementId: 'el-suspension-rotules',       sectionId: 'sec-trains-suspension', elementLibelle: 'Rotules pivot', rang: 8 },

  // SYSTEME DE DIRECTION (8)
  { elementId: 'el-direction-colonne',      sectionId: 'sec-direction', elementLibelle: 'Colonne de direction', rang: 1 },
  { elementId: 'el-direction-servo',        sectionId: 'sec-direction', elementLibelle: 'Servodirection', rang: 2 },
  { elementId: 'el-direction-boitiers',     sectionId: 'sec-direction', elementLibelle: 'Boîtiers de direction', rang: 3 },
  { elementId: 'el-direction-cylindres',    sectionId: 'sec-direction', elementLibelle: 'Cylindres direction', rang: 4 },
  { elementId: 'el-direction-cremaillere',  sectionId: 'sec-direction', elementLibelle: 'Crémaillère', rang: 5 },
  { elementId: 'el-direction-barre-accoup', sectionId: 'sec-direction', elementLibelle: 'Barre d’accouplement', rang: 6 },
  { elementId: 'el-direction-pompe-assist', sectionId: 'sec-direction', elementLibelle: 'Pompe assistée', rang: 7 },
  { elementId: 'el-direction-bielle',       sectionId: 'sec-direction', elementLibelle: 'Bielle d’accouplement', rang: 8 },

  // ALIMENTATION CARBURANT (7)
  { elementId: 'el-carburant-reservoir',   sectionId: 'sec-alimentation-carburant', elementLibelle: 'Réservoir', rang: 1 },
  { elementId: 'el-carburant-pompe-main',  sectionId: 'sec-alimentation-carburant', elementLibelle: 'Pompe à main', rang: 2 },
  { elementId: 'el-carburant-pompe-hp',    sectionId: 'sec-alimentation-carburant', elementLibelle: 'Pompe HP', rang: 3 },
  { elementId: 'el-carburant-capteurs',    sectionId: 'sec-alimentation-carburant', elementLibelle: 'Capteurs', rang: 4 },
  { elementId: 'el-carburant-rampe',       sectionId: 'sec-alimentation-carburant', elementLibelle: 'Rampe commune', rang: 5 },
  { elementId: 'el-carburant-carburateurs', sectionId: 'sec-alimentation-carburant', elementLibelle: 'Carburateurs', rang: 6 },
  { elementId: 'el-carburant-injecteurs',  sectionId: 'sec-alimentation-carburant', elementLibelle: 'Injecteurs', rang: 7 },

  // SYSTEME DE REFROIDISSEMENT MOTEUR (8)
  { elementId: 'el-refroidissement-pompe-eau',  sectionId: 'sec-refroidissement', elementLibelle: 'Pompe à eau', rang: 1 },
  { elementId: 'el-refroidissement-radiateur',  sectionId: 'sec-refroidissement', elementLibelle: 'Radiateur', rang: 2 },
  { elementId: 'el-refroidissement-visco',      sectionId: 'sec-refroidissement', elementLibelle: 'Visco coupleur', rang: 3 },
  { elementId: 'el-refroidissement-durites',    sectionId: 'sec-refroidissement', elementLibelle: 'Durites', rang: 4 },
  { elementId: 'el-refroidissement-thermostats', sectionId: 'sec-refroidissement', elementLibelle: 'Thermostats', rang: 5 },
  { elementId: 'el-refroidissement-ventilateur', sectionId: 'sec-refroidissement', elementLibelle: 'Ventilateur', rang: 6 },
  { elementId: 'el-refroidissement-thermo',     sectionId: 'sec-refroidissement', elementLibelle: 'Thermo contact', rang: 7 },
  { elementId: 'el-refroidissement-vase',       sectionId: 'sec-refroidissement', elementLibelle: 'Vase expansion', rang: 8 },

  // ELECTRICITE (19)
  { elementId: 'el-electricite-calculateur', sectionId: 'sec-electricite', elementLibelle: 'Calculateur', rang: 1 },
  { elementId: 'el-electricite-modules',     sectionId: 'sec-electricite', elementLibelle: 'Modules', rang: 2 },
  { elementId: 'el-electricite-bougies',     sectionId: 'sec-electricite', elementLibelle: 'Bougies', rang: 3 },
  { elementId: 'el-electricite-bobines',     sectionId: 'sec-electricite', elementLibelle: 'Bobines', rang: 4 },
  { elementId: 'el-electricite-faisceaux',   sectionId: 'sec-electricite', elementLibelle: 'Faisceaux', rang: 5 },
  { elementId: 'el-electricite-allumeur',    sectionId: 'sec-electricite', elementLibelle: 'Allumeur', rang: 6 },
  { elementId: 'el-electricite-prechauffage', sectionId: 'sec-electricite', elementLibelle: 'Préchauffage', rang: 7 },
  { elementId: 'el-electricite-temporisateur', sectionId: 'sec-electricite', elementLibelle: 'Temporisateur', rang: 8 },
  { elementId: 'el-electricite-eclairage',   sectionId: 'sec-electricite', elementLibelle: 'Eclairage (Codes, phares, stop, clignotant, position, recul…)', rang: 9 },
  { elementId: 'el-electricite-batterie',    sectionId: 'sec-electricite', elementLibelle: 'Batterie', rang: 10 },
  { elementId: 'el-electricite-alternateur', sectionId: 'sec-electricite', elementLibelle: 'Alternateur', rang: 11 },
  { elementId: 'el-electricite-demarreur',   sectionId: 'sec-electricite', elementLibelle: 'Démarreur', rang: 12 },
  { elementId: 'el-electricite-regulateur',  sectionId: 'sec-electricite', elementLibelle: 'Régulateur', rang: 13 },
  { elementId: 'el-electricite-courroies',   sectionId: 'sec-electricite', elementLibelle: 'Courroies', rang: 14 },
  { elementId: 'el-electricite-tendeur',     sectionId: 'sec-electricite', elementLibelle: 'Tendeur', rang: 15 },
  { elementId: 'el-electricite-tableau-bord', sectionId: 'sec-electricite', elementLibelle: 'Tableau de bord', rang: 16 },
  { elementId: 'el-electricite-voyants',     sectionId: 'sec-electricite', elementLibelle: 'Voyants', rang: 17 },
  { elementId: 'el-electricite-tachymetre',  sectionId: 'sec-electricite', elementLibelle: 'Tachymètre', rang: 18 },
  { elementId: 'el-electricite-compte-tour', sectionId: 'sec-electricite', elementLibelle: 'Compte tour', rang: 19 },

  // CLIMATISATION (3)
  { elementId: 'el-climatisation-compresseur', sectionId: 'sec-climatisation', elementLibelle: 'Compresseur', rang: 1 },
  { elementId: 'el-climatisation-condenseur',  sectionId: 'sec-climatisation', elementLibelle: 'Condenseur', rang: 2 },
  { elementId: 'el-climatisation-tuyauterie',  sectionId: 'sec-climatisation', elementLibelle: 'Tuyauterie', rang: 3 },

  // TOLERIE (6)
  { elementId: 'el-tolerie-carrosserie', sectionId: 'sec-tolerie', elementLibelle: 'Carrosserie (Portières, capot, Hayon, Ailes)', rang: 1 },
  { elementId: 'el-tolerie-pare-choc',   sectionId: 'sec-tolerie', elementLibelle: 'Pares choc', rang: 2 },
  { elementId: 'el-tolerie-chassis',     sectionId: 'sec-tolerie', elementLibelle: 'Châssis', rang: 3 },
  { elementId: 'el-tolerie-longeron',    sectionId: 'sec-tolerie', elementLibelle: 'Longeron', rang: 4 },
  { elementId: 'el-tolerie-berceau',     sectionId: 'sec-tolerie', elementLibelle: 'Berceau', rang: 5 },
  { elementId: 'el-tolerie-bas-caisse',  sectionId: 'sec-tolerie', elementLibelle: 'Bas de caisse / Passage roues', rang: 6 },

  // CAPITONNAGE (4)
  { elementId: 'el-capitonnage-sieges',    sectionId: 'sec-capitonnage', elementLibelle: 'Sièges', rang: 1 },
  { elementId: 'el-capitonnage-interieur', sectionId: 'sec-capitonnage', elementLibelle: 'Capitonnage intérieur', rang: 2 },
  { elementId: 'el-capitonnage-console',   sectionId: 'sec-capitonnage', elementLibelle: 'Console de bord', rang: 3 },
  { elementId: 'el-capitonnage-serrures',  sectionId: 'sec-capitonnage', elementLibelle: 'Serrures', rang: 4 },

  // VITRERIE (5)
  { elementId: 'el-vitrerie-pare-brise',  sectionId: 'sec-vitrerie', elementLibelle: 'Pare-brise', rang: 1 },
  { elementId: 'el-vitrerie-lunette',     sectionId: 'sec-vitrerie', elementLibelle: 'Lunette arrière', rang: 2 },
  { elementId: 'el-vitrerie-vitres',      sectionId: 'sec-vitrerie', elementLibelle: 'Vitres portières', rang: 3 },
  { elementId: 'el-vitrerie-custode',     sectionId: 'sec-vitrerie', elementLibelle: 'Custode G/D', rang: 4 },
  { elementId: 'el-vitrerie-retroviseurs', sectionId: 'sec-vitrerie', elementLibelle: 'Retro viseurs', rang: 5 },

  // OPTIQUES (3)
  { elementId: 'el-optiques-globes',     sectionId: 'sec-optiques', elementLibelle: 'Globes G/D', rang: 1 },
  { elementId: 'el-optiques-clignotant', sectionId: 'sec-optiques', elementLibelle: 'Clignotant AVG/AVD', rang: 2 },
  { elementId: 'el-optiques-feux-arr',   sectionId: 'sec-optiques', elementLibelle: 'Feux arrières G/D', rang: 3 },

  // FIBRES PLASTIQUES (4)
  { elementId: 'el-fibres-elargisseurs', sectionId: 'sec-fibres-plastiques', elementLibelle: 'Elargisseurs', rang: 1 },
  { elementId: 'el-fibres-pare-choc',    sectionId: 'sec-fibres-plastiques', elementLibelle: 'Pare choc', rang: 2 },
  { elementId: 'el-fibres-baguettes',    sectionId: 'sec-fibres-plastiques', elementLibelle: 'Baguettes', rang: 3 },
  { elementId: 'el-fibres-calendres',    sectionId: 'sec-fibres-plastiques', elementLibelle: 'Calendres', rang: 4 },

  // PEINTURES (1)
  { elementId: 'el-peintures-ext-int', sectionId: 'sec-peintures', elementLibelle: 'Extérieure et Intérieure', rang: 1 },

  // PNEUMATIQUE (4) — traitement spécial % dans l'écran (pas conforme/non-conforme)
  { elementId: 'el-pneumatique-avg', sectionId: 'sec-pneumatique', elementLibelle: 'AVG', rang: 1 },
  { elementId: 'el-pneumatique-avd', sectionId: 'sec-pneumatique', elementLibelle: 'AVD', rang: 2 },
  { elementId: 'el-pneumatique-arg', sectionId: 'sec-pneumatique', elementLibelle: 'ARG', rang: 3 },
  { elementId: 'el-pneumatique-ard', sectionId: 'sec-pneumatique', elementLibelle: 'ARD', rang: 4 },

  // REGLAGES (3)
  { elementId: 'el-reglages-equilibrage',   sectionId: 'sec-reglages', elementLibelle: 'Equilibrage', rang: 1 },
  { elementId: 'el-reglages-carrossage',    sectionId: 'sec-reglages', elementLibelle: 'Carrossage', rang: 2 },
  { elementId: 'el-reglages-parallelisme',  sectionId: 'sec-reglages', elementLibelle: 'Parallélisme', rang: 3 },
];

export const typesLivretFixtures: TypeLivret[] = [
  { typeLivretCode: 'SA',       libelle: 'Livret SA' },
  { typeLivretCode: 'GSS',      libelle: 'Livret GSS' },
  { typeLivretCode: 'PARCOURS', libelle: 'Livret Parcours' },
];
