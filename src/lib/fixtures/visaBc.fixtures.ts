/** bscva.visa_bon_commande + visa_bc_piece (Script.sql) */
export interface VisaBonCommande {
  visaBcId:            string;
  referenceActe:       string;
  vehiculeId:          string;
  numeroBc:            string;
  dateBc:              string;
  fournisseur:         string;
  adresseFournisseur:  string;
  nif:                 string;
  stat:                string;
  /** bscva.visa_bon_commande.annee_carte_fiscale — purement informatif, confronté à l'année en
   *  cours côté formulaire (non bloquant). */
  anneeCarteFiscale?:  string;
  montant:             number;
  referencePvConstat:  string;
  grandsTravaux:       boolean;
  decision:            'VISA' | 'REFUS' | null;
  motifRefus:          string;
  /** bscva.visa_bon_commande.numero_visa — renseigné au moment de la décision */
  numeroVisa?:         string;
  /** bscva.visa_bon_commande.date_visa */
  dateVisa?:           string;
  statut:              string;
}

/** bscva.visa_bc_piece — une ligne par pièce/prestation commandée (désignation, quantité, prix unitaire) */
export interface VisaBcPiece {
  id:            string;
  visaBcId:      string;
  designation:   string;
  quantite:      number;
  prixUnitaire:  number;
}

export const visasBcFixtures: VisaBonCommande[] = [
  {
    visaBcId: 'vbc-1', referenceActe: 'VBC072026003', vehiculeId: 'veh-0002', numeroBc: 'BC-2026-014',
    dateBc: '2026-03-10', fournisseur: 'Garage Andrianina', adresseFournisseur: 'Lot II M 45 Ankorondrano, Antananarivo',
    nif: '4001234567', stat: '2019 11 12345', anneeCarteFiscale: '2026',
    montant: 1250000, referencePvConstat: 'CST072026002', grandsTravaux: true,
    decision: null, motifRefus: '', statut: 'EN_VALIDATION',
  },
];

export const visaBcPiecesFixtures: VisaBcPiece[] = [
  { id: 'vbcp-1', visaBcId: 'vbc-1', designation: 'Kit d’embrayage complet', quantite: 1, prixUnitaire: 1100000 },
  { id: 'vbcp-2', visaBcId: 'vbc-1', designation: 'Ferodo arrière', quantite: 1, prixUnitaire: 150000 },
];
