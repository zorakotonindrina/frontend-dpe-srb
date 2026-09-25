import { z } from 'zod';

export const receptionTechniqueSchema = z.object({
  vehiculeId:     z.string().min(1, 'Véhicule requis'),
  visaBcId:       z.string().min(1, 'Visa bon de commande requis'),
  dateReception:  z.string().min(1, 'Date requise'),
  heureReception: z.string().min(1, 'Heure requise'),
  minSoa:         z.string().min(1, 'Ministère / SOA requis'),
  serviceFaitGac: z.boolean(),
  expertNom:      z.string().min(1, 'Expert requis'),
  responsableNom: z.string().optional().default(''),
  avis:           z.enum(['FAVORABLE', 'DEFAVORABLE']).nullable(),
});

export type ReceptionTechniqueFormData = z.infer<typeof receptionTechniqueSchema>;
