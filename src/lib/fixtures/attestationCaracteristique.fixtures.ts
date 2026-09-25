/**
 * bscva.attestation_caracteristique (Script.sql). Les caractéristiques techniques sont figées sur
 * l'attestation elle-même au moment de la délivrance (pré-remplies depuis le véhicule choisi, puis
 * modifiables) — l'attestation ne doit jamais être relue en direct depuis `Vehicule` par la suite.
 */
export interface AttestationCaracteristique {
  attestationId:       string;
  referenceActe:       string;
  vehiculeId:          string;
  minCode:             string;
  soaLibelle:          string;
  immatriculation:     string;
  marque:              string;
  genre:               string;
  carrosserie:         string;
  typeVeh:             string;
  numeroSerieType:     string;
  numeroMoteur:        string;
  nombrePlace:         number;
  sourceEnergie:       string;
  puissanceAdmin:      number;
  poidsVide:           number;
  chargeUtile:         number;
  ptac:                number;
  anneePremiereMise:   number;
  motifPerte:          string;
  /** Enregistrée en base uniquement — jamais imprimée sur le livrable. */
  observation?:        string | null;
  statut:              string;
}

export const attestationsCaracteristiqueFixtures: AttestationCaracteristique[] = [
  {
    attestationId: 'car-1', referenceActe: 'CAR072026005', vehiculeId: 'veh-0005', minCode: 'MIN-BUD',
    soaLibelle: 'DRPE Analamanga', immatriculation: '0087 GVA', marque: 'MERCEDES', genre: 'VU',
    carrosserie: 'PLATEAU', typeVeh: '', numeroSerieType: 'WDB9066631R123987', numeroMoteur: 'OM646-778001',
    nombrePlace: 3, sourceEnergie: 'GASOIL', puissanceAdmin: 16, poidsVide: 3200, chargeUtile: 2500,
    ptac: 5700, anneePremiereMise: 2008,
    motifPerte: 'Carte grise perdue lors du sinistre du véhicule', statut: 'A_COMPLETER',
  },
];
