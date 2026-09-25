/** bscva.expertise_accident + expertise_dommage (Script.sql) */
export interface ExpertiseAccident {
  expertiseId:        string;
  referenceActe:      string;
  vehiculeId:         string;
  typeExpertise:      'EXP' | 'CONTRE_EXP';
  dateAccident:       string;
  lieuAccident:       string;
  vehiculePriveImmat: string;
  rapport:            string;
  montantEstime:      number;
  statut:             string;
}

export interface ExpertiseDommage {
  id:          string;
  expertiseId: string;
  libelle:     string;
  coutEstime:  number;
}

export const expertisesFixtures: ExpertiseAccident[] = [
  {
    expertiseId: 'exp-1', referenceActe: 'EXP072026008', vehiculeId: 'veh-0004', typeExpertise: 'EXP',
    dateAccident: '2026-07-05', lieuAccident: 'RN7, Antsirabe', vehiculePriveImmat: '',
    rapport: "Collision arrière lors d'un freinage d'urgence. Choc modéré, dégâts localisés à l'arrière du véhicule. Aucun blessé signalé.",
    montantEstime: 630000, statut: 'VALIDE',
  },
];

export const expertiseDommagesFixtures: ExpertiseDommage[] = [
  { id: 'expd-1', expertiseId: 'exp-1', libelle: 'Pare-chocs arrière', coutEstime: 450000 },
  { id: 'expd-2', expertiseId: 'exp-1', libelle: 'Feu arrière droit', coutEstime: 180000 },
];
