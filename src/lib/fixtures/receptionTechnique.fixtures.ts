/** bscva.reception_technique (Script.sql) */
export interface ReceptionTechnique {
  receptionId:      string;
  referenceActe:    string;
  vehiculeId:       string;
  visaBcId:         string;
  dateReception:    string;
  heureReception:   string;
  minSoa:           string;
  serviceFaitGac:   boolean;
  expertNom:        string;
  responsableNom:   string;
  avis:             'FAVORABLE' | 'DEFAVORABLE' | null;
  statut:           string;
}

export const receptionsTechniquesFixtures: ReceptionTechnique[] = [
  {
    receptionId: 'rct-1', referenceActe: 'RCT072026004', vehiculeId: 'veh-0001', visaBcId: 'vbc-1',
    dateReception: '2026-04-01', heureReception: '10:00', minSoa: 'MIN-FIN / SRB Analamanga',
    serviceFaitGac: true, expertNom: 'RAZAFY Mamy', responsableNom: 'RASOA Nirina',
    avis: null, statut: 'DEPOSE',
  },
];

/** bscva.reception_constat — une ligne de constat par réception (texte libre, ex. pièces remplacées vérifiées) */
export interface ReceptionConstat {
  id:          string;
  receptionId: string;
  libelle:     string;
  rang:        number;
}

export const receptionConstatsFixtures: ReceptionConstat[] = [
  { id: 'rctc-1', receptionId: 'rct-1', libelle: 'Kit d’embrayage complet remplacé, conforme', rang: 1 },
  { id: 'rctc-2', receptionId: 'rct-1', libelle: 'Ferodo arrière remplacé, essai routier concluant', rang: 2 },
];
