/** bscva.reception_va_neuf + reception_neuf_ligne (Script.sql) */
export interface ReceptionVaNeuf {
  receptionNeufId:    string;
  referenceActe:      string;
  budgetCode:         string;
  chapitre:            string;
  article:             string;
  compte:              string;
  financement:         string;
  commune:             string;
  typeAcquisition:     string;
  referenceMarche:     string;
  fournisseurNom:      string;
  fournisseurAdresse:  string;
  fournisseurStat:     string;
  fournisseurNif:      string;
  depositaireNom:      string;
  nomFinancement:      string;
  fournisseurAnneeCarteFiscale: string;
  commissionMembresEntite: string;
  commissionMembresDpe: string;
  soaCode:             string;
  heurePv:             string;
  datePv:              string;
  statut:              string;
}

export type ReceptionNeufLigneDecision = 'SANS_CHANGEMENT' | 'REDUCTION' | 'REBUTEE';

export interface ReceptionNeufLigne {
  id:                 string;
  receptionNeufId:    string;
  designation:        string;
  immatriculation:    string;
  genre:              string;
  typeVeh:             string;
  marque:             string;
  numeroSerie:        string;
  carrosserie:        string;
  numeroMoteur:       string;
  puissance:          string;
  sourceEnergie:      string;
  nombrePlace:        number;
  datePremiereMise:   string;
  quantiteFacturee:   number;
  quantiteReconnue:   number;
  decision:           ReceptionNeufLigneDecision;
  rang:               number;
  kilometrage:        number | null;
  valeur:             number | null;
  observation:        string;
}

export const receptionsNeufFixtures: ReceptionVaNeuf[] = [
  {
    receptionNeufId: 'rne-1', referenceActe: 'RNE072026005', budgetCode: '2172', chapitre: '61',
    article: '15', compte: '2182', financement: 'CONVENTION', commune: 'Commune Rurale Sadabe',
    typeAcquisition: 'ACHAT', referenceMarche: '04/AFF/CP/CR-SAD/25', nomFinancement: 'RPI',
    fournisseurNom: 'RAKOTOARIVELO Marie Angeles', fournisseurAdresse: 'Sadabe, Analamanga',
    fournisseurStat: '4001234567', fournisseurNif: '4009876543', depositaireNom: 'RASOA Nirina',
    fournisseurAnneeCarteFiscale: '2026', soaCode: '', heurePv: '09:00',
    commissionMembresEntite: 'RANDRASANA Raheliarison Josaphat, Président',
    commissionMembresDpe: "RAKOTONIRAINY Rondronavalona, Chef de Division Régionale du Patrimoine de l'Etat",
    datePv: '2026-02-20', statut: 'DEPOSE',
  },
];

export const receptionNeufLignesFixtures: ReceptionNeufLigne[] = [
  {
    id: 'rnel-1', receptionNeufId: 'rne-1', designation: 'VOITURE', immatriculation: '',
    genre: 'VP', typeVeh: 'Berline', marque: 'TOYOTA', numeroSerie: 'JT123456789',
    carrosserie: 'Berline', numeroMoteur: 'M-987654', puissance: '7', sourceEnergie: 'ESSENCE',
    nombrePlace: 5, datePremiereMise: '2026-01-15', quantiteFacturee: 1, quantiteReconnue: 1,
    decision: 'SANS_CHANGEMENT', rang: 1, kilometrage: null, valeur: null, observation: '',
  },
];
