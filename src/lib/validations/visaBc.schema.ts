import { z } from 'zod';

export const visaBcSchema = z.object({
  vehiculeId:          z.string().min(1, 'Véhicule requis'),
  numeroBc:            z.string().min(1, 'Numéro de BC requis'),
  dateBc:              z.string().min(1, 'Date requise'),
  fournisseur:         z.string().min(1, 'Fournisseur requis'),
  adresseFournisseur:  z.string().optional().default(''),
  nif:                 z.string().min(1, 'NIF requis'),
  stat:                z.string().min(1, 'STAT requis'),
  anneeCarteFiscale:   z.string().optional().default(''),
  referencePvConstat:  z.string().optional().default(''),
  grandsTravaux:       z.boolean(),
  decision:            z.enum(['VISA', 'REFUS']).nullable(),
  motifRefus:          z.string().optional().default(''),
});

export type VisaBcFormData = z.infer<typeof visaBcSchema>;
