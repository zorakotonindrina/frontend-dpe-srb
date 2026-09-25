/** bscva.chauffeur (Script.sql) — référentiel chauffeurs (identité, hors dossier) */
export interface Chauffeur {
  chauffeurId: string;
  nom:         string;
  matricule:   string;
  cin:         string;
  permis:      string;
  minCode:     string;
  soaCode:     string;
}

export const chauffeursFixtures: Chauffeur[] = [
  { chauffeurId: 'ch-1', nom: 'RAKOTOVAO Faniry', matricule: '000002', cin: '101012345678', permis: 'PC-2019-4521', minCode: 'MIN-FIN', soaCode: 'SRB-ALA' },
  { chauffeurId: 'ch-2', nom: 'ANDRIA Tojo', matricule: '000003', cin: '101023456789', permis: 'PC-2021-8890', minCode: 'MIN-FIN', soaCode: 'BSCVA' },
];
