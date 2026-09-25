/**
 * Branché sur le vrai backend depuis GET /api-vehicules/api/vehicules/{id}/mouvements (voir
 * lib/api/vehiculeMouvements.ts) — dérivé côté serveur des endpoints existants + des
 * condamnations validées, sans table dédiée. Le tableau ci-dessous n'est plus consommé par un
 * store mock : il sert uniquement de jeu de données réaliste pour les tests (même convention
 * que vehiculesFixtures, toujours exporté bien que vehiculesApi soit réel depuis le début).
 */
export interface MouvementVehicule {
  mouvementId: string;
  vehiculeId: string;
  /** ISO yyyy-mm-dd */
  dateMouvement: string;
  typeMouvement:
    | 'AFFECTATION'           // première affectation à un détenteur/service
    | 'TRANSFERT'             // changement de ministère/SOA dépositaire
    | 'CHANGEMENT_DETENTEUR'  // changement du détenteur effectif, ministère/SOA inchangés
    | 'CHANGEMENT_ETAT'       // évolution de etatVehicule (BON/MOYEN/MAUVAIS/HS)
    | 'REFORME'               // passage statut -> REFORME
    | 'CONDAMNATION'          // passage statut -> CONDAMNE
    | 'RECENSEMENT';          // recensement validé (une ligne de rsi_vehicule_etat) : STRUCTURE, détenteur, état général
  minCodeOrigine?: string;
  minCodeDestination?: string;
  /** Texte libre, comme Vehicule.soaDepositaire (même limite de modélisation, pas de FK vers Soa.soaCode). */
  soaOrigine?: string;
  soaDestination?: string;
  detenteurOrigine?: string;
  detenteurDestination?: string;
  etatOrigine?: string;
  etatDestination?: string;
  /** RECENSEMENT uniquement — année de validation du recensement. */
  exercice?: string;
  /** RECENSEMENT — STRUCTURE (SOA) où le véhicule a été recensé : code + libellé (rh_soa). */
  structureCode?: string;
  structureLibelle?: string;
  /** RECENSEMENT — détenteur effectif déclaré, catégorie d'utilisation (1/2/3) et état général constaté (1 à 4). */
  detenteur?: string;
  categorieUtilisation?: string;
  etatGeneral?: string;
  /** RECENSEMENT — état général du recensement précédent, présent seulement s'il a changé. */
  etatGeneralOrigine?: string;
  motif?: string;
  /** Référence d'un dossier BSCVA lié, si applicable (ex. dossier de condamnation). */
  referenceActe?: string;
  auteur?: string;
}

export const mouvementsVehiculeFixtures: MouvementVehicule[] = [
  // veh-0001 — 4521 WWB : affectation initiale puis changement de détenteur effectif
  {
    mouvementId: 'mvt-0001', vehiculeId: 'veh-0001', dateMouvement: '2019-04-02',
    typeMouvement: 'AFFECTATION', minCodeOrigine: undefined, minCodeDestination: 'MIN-FIN',
    soaDestination: 'SRB Analamanga', detenteurDestination: 'ANDRIANARIVO Tojo',
    auteur: 'BSCVA',
  },
  {
    mouvementId: 'mvt-0002', vehiculeId: 'veh-0001', dateMouvement: '2022-09-18',
    typeMouvement: 'CHANGEMENT_DETENTEUR', minCodeOrigine: 'MIN-FIN', minCodeDestination: 'MIN-FIN',
    soaOrigine: 'SRB Analamanga', soaDestination: 'SRB Analamanga',
    detenteurOrigine: 'ANDRIANARIVO Tojo', detenteurDestination: 'RASOA Nirina',
    motif: 'Mutation du détenteur précédent', auteur: 'BSCVA',
  },

  // veh-0002 — 7788 TBA : affectation initiale puis transfert de SOA dépositaire
  {
    mouvementId: 'mvt-0003', vehiculeId: 'veh-0002', dateMouvement: '2016-08-30',
    typeMouvement: 'AFFECTATION', minCodeDestination: 'MIN-FIN',
    soaDestination: 'SRB Analamanga', detenteurDestination: 'RAKOTOVAO Faniry',
    auteur: 'BSCVA',
  },
  {
    mouvementId: 'mvt-0004', vehiculeId: 'veh-0002', dateMouvement: '2020-02-11',
    typeMouvement: 'TRANSFERT', minCodeOrigine: 'MIN-FIN', minCodeDestination: 'MIN-FIN',
    soaOrigine: 'SRB Analamanga', soaDestination: 'DRPE Analamanga',
    detenteurOrigine: 'RAKOTOVAO Faniry', detenteurDestination: 'RAKOTOVAO Faniry',
    motif: 'Réorganisation du parc régional', auteur: 'BSCVA',
  },

  // veh-0003 — 1290 SRB : affectation initiale puis dégradation de l'état constaté
  {
    mouvementId: 'mvt-0005', vehiculeId: 'veh-0003', dateMouvement: '2012-02-05',
    typeMouvement: 'AFFECTATION', minCodeDestination: 'MIN-BUD',
    soaDestination: 'SRB Analamanga', detenteurDestination: 'RANDRIA Solofo',
    auteur: 'BSCVA',
  },
  {
    mouvementId: 'mvt-0006', vehiculeId: 'veh-0003', dateMouvement: '2024-07-22',
    typeMouvement: 'CHANGEMENT_ETAT', etatOrigine: 'MOYEN', etatDestination: 'MAUVAIS',
    motif: 'Constatation technique défavorable', auteur: 'BSCVA',
  },

  // veh-0004 — 3005 HRA : affectation initiale puis transfert vers le BSCVA
  {
    mouvementId: 'mvt-0007', vehiculeId: 'veh-0004', dateMouvement: '2021-11-20',
    typeMouvement: 'AFFECTATION', minCodeDestination: 'MIN-FIN',
    soaDestination: 'SRB Analamanga', detenteurDestination: 'ANDRIAMBOLA Lova',
    auteur: 'BSCVA',
  },
  {
    mouvementId: 'mvt-0008', vehiculeId: 'veh-0004', dateMouvement: '2023-05-09',
    typeMouvement: 'TRANSFERT', minCodeOrigine: 'MIN-FIN', minCodeDestination: 'MIN-FIN',
    soaOrigine: 'SRB Analamanga', soaDestination: 'BSCVA',
    detenteurOrigine: 'ANDRIAMBOLA Lova', detenteurDestination: 'ANDRIAMBOLA Lova',
    motif: 'Rattachement au parc de service du BSCVA', auteur: 'BSCVA',
  },

  // veh-0005 — 0087 GVA : chaîne complète affectation -> dégradation -> condamnation
  {
    mouvementId: 'mvt-0009', vehiculeId: 'veh-0005', dateMouvement: '2008-07-01',
    typeMouvement: 'AFFECTATION', minCodeDestination: 'MIN-BUD',
    soaDestination: 'DRPE Analamanga', detenteurDestination: 'RAZAFY Mamy',
    auteur: 'BSCVA',
  },
  {
    mouvementId: 'mvt-0010', vehiculeId: 'veh-0005', dateMouvement: '2025-03-14',
    typeMouvement: 'CHANGEMENT_ETAT', etatOrigine: 'MOYEN', etatDestination: 'HS',
    motif: "Véhicule immobilisé depuis plus de 12 mois, moteur hors d'usage", auteur: 'BSCVA',
  },
  {
    mouvementId: 'mvt-0012', vehiculeId: 'veh-0005', dateMouvement: '2025-02-10',
    typeMouvement: 'RECENSEMENT', exercice: '2025', structureCode: '3-100-200', structureLibelle: 'DRPE Analamanga',
    detenteur: 'RAZAFY Mamy', categorieUtilisation: '3', etatGeneral: '1', referenceActe: 'REC022025001', auteur: 'BSCVA',
  },
  {
    mouvementId: 'mvt-0011', vehiculeId: 'veh-0005', dateMouvement: '2026-01-20',
    typeMouvement: 'CONDAMNATION', etatOrigine: 'HS', etatDestination: 'HS',
    motif: 'Coût de remise en état supérieur à la valeur vénale du véhicule',
    referenceActe: 'CDN072026009', auteur: 'BSCVA',
  },
];
