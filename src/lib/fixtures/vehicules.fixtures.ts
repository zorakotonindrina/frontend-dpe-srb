/** traitement_siigpe.tsi_entite_vehicule (Script.sql) */
export interface Vehicule {
  vehiculeId:                  string;
  vehiculeImmatriculation:     string;
  minCode:                     string;
  soaDepositaire:               string;
  marqueCode:                  string;
  /** Nom de la marque (jointure backend `marque_nom`) — absent des fixtures/formulaires. */
  marqueLibelle?:              string;
  /** Libellés de localisation (jointures backend) — absents des fixtures/formulaires. */
  regionLibelle?:              string;
  districtLibelle?:            string;
  communeLibelle?:             string;
  genreCode:                   string;
  carrosserieCode:             string;
  categorieVehicule:           string;
  sourceEnergie:                string;
  etatVehicule:                 string;
  numeroMoteur:                string;
  vin:                          string;
  puissanceAdministrative:      number;
  pls:                          number;
  pv:                           number;
  cu:                           number;
  pt:                           number;
  /** Extension additive au-delà de Script.sql (pas de colonne valeur sur entite_vehicule) —
   * champ patrimonial saisi/modifiable directement sur la fiche, cf. cahier des charges. */
  valeurEstimative:             number;
  datePremierMiseCirculation:   string;
  carteGrise:                   boolean;
  livretsDisponibles:           boolean;
  detenteurEffectif:            string;
  regionCode:                  string;
  districtCode:                string;
  communeCode:                  string;
  /** Dernier recensement connu (referentiel_siigpe.rsi_vehicule_etat, actif=1) — jointure en
   *  lecture seule, absent de `VehiculeInput`/`VehiculeForm.tsx` (jamais saisi ici, alimenté
   *  uniquement à la validation d'un recensement). Vide si jamais recensé. */
  soaCode?:                    string;
  exercice?:                   string;
  statut:                      'ACTIF' | 'REFORME' | 'CONDAMNE';
  isDeleted?:                   boolean;
  deletedAt?:                   string;
  motifSuppression?:            string;
}

export const vehiculesFixtures: Vehicule[] = [
  {
    vehiculeId: 'veh-0001', vehiculeImmatriculation: '4521 WWB', minCode: 'MIN-FIN', soaDepositaire: 'SRB Analamanga',
    marqueCode: 'TOYOTA', genreCode: 'VP', carrosserieCode: 'BERLINE', categorieVehicule: 'BERLINE',
    sourceEnergie: 'GASOIL', etatVehicule: 'BON', numeroMoteur: '1KD-7841203', vin: 'JTMHV05J704123456',
    puissanceAdministrative: 9, pls: 5, pv: 1350, cu: 450, pt: 1800, valeurEstimative: 45000000,
    datePremierMiseCirculation: '2019-03-14', carteGrise: true, livretsDisponibles: true,
    detenteurEffectif: 'RASOA Nirina', regionCode: 'REG-ALA', districtCode: 'DIST-ANTA', communeCode: 'COM-1ARR',
    statut: 'ACTIF',
  },
  {
    vehiculeId: 'veh-0002', vehiculeImmatriculation: '7788 TBA', minCode: 'MIN-FIN', soaDepositaire: 'DRPE Analamanga',
    marqueCode: 'NISSAN', genreCode: 'TCP', carrosserieCode: '4X4', categorieVehicule: '4X4',
    sourceEnergie: 'GASOIL', etatVehicule: 'MOYEN', numeroMoteur: 'YD25-559012', vin: 'JN1TANT31Z0009876',
    puissanceAdministrative: 11, pls: 7, pv: 1800, cu: 700, pt: 2500, valeurEstimative: 38000000,
    datePremierMiseCirculation: '2016-08-02', carteGrise: true, livretsDisponibles: true,
    detenteurEffectif: 'RAKOTOVAO Faniry', regionCode: 'REG-ALA', districtCode: 'DIST-AVAR', communeCode: 'COM-AMBO',
    statut: 'ACTIF',
  },
  {
    vehiculeId: 'veh-0003', vehiculeImmatriculation: '1290 SRB', minCode: 'MIN-BUD', soaDepositaire: 'SRB Analamanga',
    marqueCode: 'MITSUBISHI', genreCode: 'CTTE', carrosserieCode: 'PLATEAU', categorieVehicule: 'PICKUP',
    sourceEnergie: 'GASOIL', etatVehicule: 'MAUVAIS', numeroMoteur: '4D56-220087', vin: 'MMBJNKA40FH100234',
    puissanceAdministrative: 10, pls: 3, pv: 1600, cu: 1000, pt: 2600, valeurEstimative: 18000000,
    datePremierMiseCirculation: '2012-01-20', carteGrise: false, livretsDisponibles: true,
    detenteurEffectif: 'RANDRIA Solofo', regionCode: 'REG-ALA', districtCode: 'DIST-ANTA', communeCode: 'COM-4ARR',
    statut: 'ACTIF',
  },
  {
    vehiculeId: 'veh-0004', vehiculeImmatriculation: '3005 HRA', minCode: 'MIN-FIN', soaDepositaire: 'BSCVA',
    marqueCode: 'HYUNDAI', genreCode: 'VP', carrosserieCode: 'BREAK', categorieVehicule: 'BERLINE',
    sourceEnergie: 'ESSENCE', etatVehicule: 'BON', numeroMoteur: 'G4FC-990112', vin: 'KMHDH41CP8U112233',
    puissanceAdministrative: 7, pls: 5, pv: 1200, cu: 400, pt: 1600, valeurEstimative: 52000000,
    datePremierMiseCirculation: '2021-11-05', carteGrise: true, livretsDisponibles: true,
    detenteurEffectif: 'ANDRIAMBOLA Lova', regionCode: 'REG-VAK', districtCode: 'DIST-ANTS', communeCode: 'COM-ANTS',
    statut: 'ACTIF',
  },
  {
    vehiculeId: 'veh-0005', vehiculeImmatriculation: '0087 GVA', minCode: 'MIN-BUD', soaDepositaire: 'DRPE Analamanga',
    marqueCode: 'MERCEDES', genreCode: 'VU', carrosserieCode: 'PLATEAU', categorieVehicule: 'CAMION',
    sourceEnergie: 'GASOIL', etatVehicule: 'HS', numeroMoteur: 'OM646-778001', vin: 'WDB9066631R123987',
    puissanceAdministrative: 16, pls: 3, pv: 3200, cu: 2500, pt: 5700, valeurEstimative: 4500000,
    datePremierMiseCirculation: '2008-06-11', carteGrise: true, livretsDisponibles: false,
    detenteurEffectif: 'RAZAFY Mamy', regionCode: 'REG-ALA', districtCode: 'DIST-ANTA', communeCode: 'COM-1ARR',
    statut: 'CONDAMNE',
  },
];
