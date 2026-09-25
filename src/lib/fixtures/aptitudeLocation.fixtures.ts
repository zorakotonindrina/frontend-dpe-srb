/** bscva.controle_aptitude (Script.sql) */
export interface ControleAptitude {
  aptitudeId:          string;
  referenceActe:       string;
  vehiculeId:          string;
  objetMission:        string;
  itineraire:          string;
  dateDebut:           string;
  dateFin:             string;
  contratLocation:     string;
  fournisseurNifStat:  string;
  avisAptitude:        'APTE' | 'NON_APTE' | null;
  observation:         string;
  statut:              string;
}

export const controlesAptitudeFixtures: ControleAptitude[] = [
  {
    aptitudeId: 'apt-1', referenceActe: 'LOC072026006', vehiculeId: 'veh-0004', objetMission: 'Location véhicule de service',
    itineraire: 'Antananarivo — Antsirabe', dateDebut: '2026-06-01', dateFin: '2026-06-30',
    contratLocation: 'CTR-2026-0012', fournisseurNifStat: '4009988776', avisAptitude: 'APTE', observation: 'RAS', statut: 'LIVRABLE_GENERE',
  },
];
