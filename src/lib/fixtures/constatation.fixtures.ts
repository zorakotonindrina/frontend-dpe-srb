/** bscva.constatation_technique + éléments/pièces/réparations (Script.sql) */
export interface ConstatationTechnique {
  constatationId: string;
  referenceActe:  string;
  vehiculeId:     string;
  numeroConstat:  string;
  dateConstat:    string;
  heureConstat:   string;
  lieu:           string;
  expertNom:      string;
  /** SOA du véhicule constaté, pré-rempli depuis vehicule.soaDepositaire. */
  soa:            string;
  /** bscva.constatation_technique.equipement_verif */
  equipementVerif?: string;
  kilometrage:    number;
  nomChauffeur:   string;
  /** Ajouté sur demande utilisateurs plateforme (retour BSCVA) — optionnel, saisi à côté du nom. */
  chauffeurContact?: string;
  /** Détenteur effectif du véhicule au moment de la constatation, pré-rempli depuis vehicule.detenteurEffectif. */
  detenteur:      string;
  etatGeneral:    string;
  constats:       string;
  statut:         string;
}

export interface ConstatationElement {
  constatationElementId: string;
  constatationId:        string;
  elementId:             string;
  /** Absent pour les éléments de la section PNEUMATIQUE (voir pneuPourcentage) */
  conforme?:              'C' | 'N';
  observation?:           string;
  /** bscva.constatation_element.ordre_priorite — renseigné seulement si non conforme */
  ordrePriorite?:         number;
  /** bscva.constatation_element.pneu_pourcentage — uniquement pour la section PNEUMATIQUE (AVG/AVD/ARG/ARD) */
  pneuPourcentage?:       number;
}

export interface ConstatationPieceRemplacer {
  id:             string;
  constatationId: string;
  libelle:        string;
}

export interface ConstatationReparation {
  id:             string;
  constatationId: string;
  libelle:        string;
}

export interface ConstatationAccessoire {
  id:             string;
  constatationId: string;
  libelle:        string;
}

export const constatationsFixtures: ConstatationTechnique[] = [
  {
    constatationId: 'cst-1', referenceActe: 'CST072026002', vehiculeId: 'veh-0002', numeroConstat: 'CST-2026-014',
    dateConstat: '2026-03-02', heureConstat: '09:30', lieu: 'Garage administratif BSCVA',
    expertNom: 'RAZAFY Mamy', soa: 'SRB Analamanga', equipementVerif: 'Valise diagnostic OBD',
    kilometrage: 84200, nomChauffeur: 'RAKOTOVAO Faniry', detenteur: 'RAKOTOVAO Faniry',
    etatGeneral: '2', constats: 'Fuite moteur constatée, freinage à vérifier.', statut: 'EN_TRAITEMENT_TECHNIQUE',
  },
];

export const constatationElementsFixtures: ConstatationElement[] = [
  { constatationElementId: 'ce-1', constatationId: 'cst-1', elementId: 'el-moteur-culasse', conforme: 'N', observation: 'Joint de culasse fuit', ordrePriorite: 1 },
  { constatationElementId: 'ce-2', constatationId: 'cst-1', elementId: 'el-freinage-disques', conforme: 'N', observation: 'Disques usés', ordrePriorite: 2 },
  { constatationElementId: 'ce-3', constatationId: 'cst-1', elementId: 'el-suspension-ressorts', conforme: 'C' },
  { constatationElementId: 'ce-4', constatationId: 'cst-1', elementId: 'el-pneumatique-avg', pneuPourcentage: 40 },
  { constatationElementId: 'ce-5', constatationId: 'cst-1', elementId: 'el-pneumatique-avd', pneuPourcentage: 55 },
];

export const constatationPiecesRemplacerFixtures: ConstatationPieceRemplacer[] = [
  { id: 'cpr-1', constatationId: 'cst-1', libelle: 'Joint de culasse' },
  { id: 'cpr-2', constatationId: 'cst-1', libelle: 'Disques de frein avant' },
];

export const constatationReparationsFixtures: ConstatationReparation[] = [
  { id: 'crp-1', constatationId: 'cst-1', libelle: 'Remplacement joint de culasse' },
  { id: 'crp-2', constatationId: 'cst-1', libelle: 'Remplacement disques et plaquettes avant' },
];

export const constatationAccessoiresFixtures: ConstatationAccessoire[] = [];
