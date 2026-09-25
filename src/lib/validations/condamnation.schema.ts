import { z } from 'zod';

/** Deux jeux de grille de mise à prix (référentiel modifiable en administration) : chaque catégorie a son
 *  propre document (« MISE A PRIX D'UN VEHICULE » / « D'UNE MOTOCYCLETTE A EVALUER »). */
export const CATEGORIES_MISE_PRIX = ['VEHICULE', 'MOTOCYCLE'] as const;
export const ETATS_ACTUELS = ['BON_ETAT', 'MOYEN_ETAT', 'MAUVAIS_ETAT'] as const;

/**
 * Les prix par composant (grille) sont saisis à l'étape suivante et gardés hors de RHF (état local du
 * wizard) ; `valeurEstimee` (somme) et `valeurEnAr` (après dépréciation) sont calculées, jamais saisies.
 */
export const condamnationSchema = z.object({
  vehiculeId:        z.string().min(1, 'Véhicule requis'),
  typeMiseAPrix:     z.enum(CATEGORIES_MISE_PRIX),
  typeVeh:           z.string().optional().default(''),
  etatActuel:        z.enum(ETATS_ACTUELS),
  depreciationPct:   z.coerce.number().min(0, 'Entre 0 et 100').max(100, 'Entre 0 et 100'),
  motifCondamnation: z.string().min(1, 'Motif requis'),
  soaCode:           z.string().min(1, 'Structure requise'),
  ministereBeneficiaireCode: z.string().optional().default(''),
  datePv:            z.string().min(1, 'Date du PV requise'),
  heurePv:           z.string().optional().default(''),
  commissionMembresEntite: z.string().optional().default(''),
  commissionMembresDpe:    z.string().optional().default(''),
});

export type CondamnationFormData = z.infer<typeof condamnationSchema>;
