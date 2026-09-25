import { z } from 'zod';

/** Trois types d'acquisition (PV différent selon le type : Achat = Modèle n° 14, Transfert/Dotation =
 *  PV d'évaluation de matériels roulants). */
export const TYPES_ACQUISITION = ['DOTATION', 'TRANSFERT', 'ACHAT'] as const;
/** Deux types de financement (à côté du champ libre « Nom financement »). */
export const TYPES_FINANCEMENT = ['CONVENTION', 'MARCHE'] as const;

export const receptionNeufSchema = z.object({
  typeAcquisition:  z.string().min(1, "Type d'acquisition requis"),
  budgetCode:       z.string().optional().default(''),
  chapitre:         z.string().optional().default(''),
  article:          z.string().optional().default(''),
  compte:           z.string().optional().default(''),
  financement:      z.string().optional().default(''),
  nomFinancement:   z.string().optional().default(''),
  commune:          z.string().optional().default(''),
  referenceMarche:  z.string().optional().default(''),
  fournisseurNom:      z.string().optional().default(''),
  fournisseurAdresse:  z.string().optional().default(''),
  fournisseurStat:     z.string().optional().default(''),
  fournisseurNif:      z.string().optional().default(''),
  // Purement informatif, confronté à l'année du PV côté formulaire (non bloquant, comme visa BC)
  fournisseurAnneeCarteFiscale: z.string().optional().default(''),
  soaCode:             z.string().optional().default(''),
  depositaireNom:      z.string().min(1, 'Dépositaire requis'),
  commissionMembresEntite: z.string().optional().default(''),
  commissionMembresDpe:    z.string().optional().default(''),
  datePv:              z.string().min(1, 'Date du PV requise'),
  heurePv:             z.string().optional().default(''),
}).superRefine((data, ctx) => {
  const requis = (champ: keyof typeof data, message: string) => {
    if (!data[champ]) ctx.addIssue({ code: 'custom', path: [champ], message });
  };
  if (data.typeAcquisition === 'ACHAT') {
    requis('budgetCode', 'Code budgétaire requis');
    requis('financement', 'Financement requis');
    requis('referenceMarche', 'Référence marché requise');
    requis('fournisseurNom', 'Fournisseur requis');
  } else {
    requis('soaCode', 'Structure bénéficiaire requise');
  }
});

export type ReceptionNeufFormData = z.infer<typeof receptionNeufSchema>;
