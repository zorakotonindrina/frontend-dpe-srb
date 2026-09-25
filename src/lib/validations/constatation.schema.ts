import { z } from 'zod';

export const constatationSchema = z.object({
  vehiculeId:    z.string().min(1, 'Véhicule requis'),
  numeroConstat: z.string().min(1, 'Numéro de constat requis'),
  dateConstat:   z.string().min(1, 'Date requise'),
  heureConstat:  z.string().min(1, 'Heure requise'),
  lieu:          z.string().min(1, 'Lieu requis'),
  expertNom:     z.string().min(1, 'Expert requis'),
  soa:           z.string().optional().default(''),
  equipementVerif: z.string().optional().default(''),
  kilometrage:   z.coerce.number().min(0),
  nomChauffeur:  z.string().min(1, 'Chauffeur requis'),
  chauffeurContact: z.string().optional().default(''),
  detenteur:     z.string().optional().default(''),
  etatGeneral:   z.string().min(1, 'État général requis'),
  constats:      z.string().optional().default(''),
});

export type ConstatationFormData = z.infer<typeof constatationSchema>;
