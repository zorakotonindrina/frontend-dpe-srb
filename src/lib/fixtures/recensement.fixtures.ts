/** bscva.recensement + bscva.recensement_ligne (Script.sql) */
export interface Recensement {
  recensementId:       string;
  referenceActe:       string;
  minCode:              string;
  /** Retiré du formulaire d'en-tête (retour terrain BSCVA — le canevas papier affiche le SOA par
   *  ligne de véhicule, pas au niveau du dossier) : reste optionnel côté type pour ne pas casser la
   *  lecture de dossiers historiques qui en portaient un, mais n'est plus jamais saisi ni envoyé
   *  depuis le formulaire de création. */
  soaCode?:             string;
  /** Type Centrale/Régionale — `niveau` a repris son intention documentée d'origine
   *  (`Script.sql` : `-- Central / Régional`). STD/CTD ont migré vers la ligne (voir
   *  `RecensementLigne.stdCtd`) — retour métier : cas rare, propre au véhicule, pas au dossier. */
  niveauType:           string;
  /** Libellé libre associé, ex. "District d'Antananarivo VI". */
  niveauLibelle:        string;
  pointFocalNom:        string;
  pointFocalFonction:   string;
  pointFocalTel:        string;
  pointFocalEmail:      string;
  dateSaisie:           string;
  statut:               string;
}

export interface RecensementLigne {
  recensementLigneId: string;
  recensementId:      string;
  vehiculeId:         string;
  detenteurEffectif:  string;
  carteGriseDispo:    boolean;
  livretsDispo:       boolean;
  /** Code '1'..'4' — échelle propre au recensement (1 marche / 2 panne / 3 calle / 4 epave), jamais copiée de vehicule.etatVehicule */
  etatGeneral:        string;
  /** Code '1'..'3' — 1 représentation / 2 fonction / 3 service (bscva.recensement_ligne.categorie_utilisation) */
  categorieUtilisation: string;
  /** Type du véhicule saisi librement pour ce recensement — propre à la ligne, jamais pré-rempli depuis la fiche véhicule. */
  type: string;
  /** SOA (« Structure ») de rattachement de ce véhicule pour CE recensement — propre à la ligne, pas
   *  au dossier ni au véhicule (peut changer d'une campagne à l'autre). */
  soaCode: string;
  /** STD/CTD fusionnés en un champ libre optionnel, propre au véhicule pour cette campagne. */
  stdCtd: string;
}

export const recensementsFixtures: Recensement[] = [
  {
    recensementId: 'rec-1', referenceActe: 'REC072026001', minCode: 'MIN-FIN', soaCode: 'SRB-ALA',
    niveauType: 'REGIONALE', niveauLibelle: 'District d\'Antananarivo VI',
    pointFocalNom: 'RABE Voahangy', pointFocalFonction: 'Agent BSCVA',
    pointFocalTel: '034 12 345 67', pointFocalEmail: 'rabe.voahangy@bscva.mg',
    dateSaisie: '2026-01-15', statut: 'VALIDE',
  },
];

export const recensementLignesFixtures: RecensementLigne[] = [
  { recensementLigneId: 'rl-1', recensementId: 'rec-1', vehiculeId: 'veh-0001', detenteurEffectif: 'RASOA Nirina', carteGriseDispo: true, livretsDispo: true, etatGeneral: '1', categorieUtilisation: '2', type: 'Véhicule de fonction', soaCode: 'SRB-ALA', stdCtd: '' },
  { recensementLigneId: 'rl-2', recensementId: 'rec-1', vehiculeId: 'veh-0002', detenteurEffectif: 'RAKOTOVAO Faniry', carteGriseDispo: true, livretsDispo: true, etatGeneral: '2', categorieUtilisation: '3', type: 'Véhicule de service', soaCode: 'SRB-ALA', stdCtd: '' },
];
