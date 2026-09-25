export type CategorieMisePrix = 'VEHICULE' | 'MOTOCYCLE';
export type EtatActuel = 'BON_ETAT' | 'MOYEN_ETAT' | 'MAUVAIS_ETAT';

/** traitement_siigpe.tsi_evaluation_prix — prix saisi pour un élément de la grille de mise à prix. */
export interface EvaluationPrix {
  elementId: string;
  prix:      number | null;
}

/** bscva.evaluation_condamnation (Script.sql) — PV d'évaluation + mise à prix (Script.sql §18.19) :
 *  `valeurEstimee` = somme des prix de la grille, `valeurEnAr` = valeur estimée après dépréciation
 *  (les deux calculées côté serveur). `ministereCode` = ministère de la structure bénéficiaire. */
export interface EvaluationCondamnation {
  evaluationId:       string;
  referenceActe:      string;
  vehiculeId:         string;
  valeurEstimee:      number;
  miseAPrix:          number;
  ficheTechnique:     string;
  motifCondamnation:  string;
  statut:             string;
  typeMiseAPrix?:     CategorieMisePrix | null;
  typeVeh?:           string | null;
  etatActuel?:        EtatActuel | null;
  depreciationPct?:   number | null;
  valeurEnAr?:        number | null;
  datePv?:            string | null;
  heurePv?:           string | null;
  commissionMembresEntite?: string | null;
  commissionMembresDpe?:    string | null;
  soaCode?:           string | null;
  ministereCode?:     string | null;
  /** Renvoyés par GET /{id} uniquement (pas par la liste). */
  prix?:              EvaluationPrix[];
}

export const evaluationsCondamnationFixtures: EvaluationCondamnation[] = [
  {
    evaluationId: 'cdn-1', referenceActe: 'CDN072026009', vehiculeId: 'veh-0005',
    valeurEstimee: 3200000, miseAPrix: 950000,
    ficheTechnique: "Véhicule immobilisé depuis plus de 12 mois, moteur hors d'usage, carrosserie fortement corrodée. Réparation jugée non rentable au regard de la valeur résiduelle.",
    motifCondamnation: 'Coût de remise en état supérieur à la valeur vénale du véhicule',
    statut: 'EN_TRAITEMENT_TECHNIQUE',
  },
];
