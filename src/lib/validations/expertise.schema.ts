import { z } from 'zod';

export const expertiseSchema = z.object({
  vehiculeId:         z.string().min(1, 'Véhicule requis'),
  typeExpertise:      z.enum(['EXP', 'CONTRE_EXP']),
  dateAccident:       z.string().min(1, 'Date requise'),
  lieuAccident:       z.string().min(1, 'Lieu requis'),
  vehiculePriveImmat: z.string().optional().default(''),
  rapport:            z.string().optional().default(''),
  montantEstime:      z.coerce.number().min(0),
});

export type ExpertiseFormData = z.infer<typeof expertiseSchema>;
