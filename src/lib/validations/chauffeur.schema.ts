import { z } from 'zod';

export const chauffeurSchema = z.object({
  nom:       z.string().min(1, 'Nom requis'),
  matricule: z.string().regex(/^[0-3]\d{5}$/, 'Matricule : 6 chiffres, valeur inférieure à 400000'),
  cin:       z.string().min(1, 'CIN requis'),
  permis:    z.string().min(1, 'Numéro de permis requis'),
  minCode:   z.string().min(1, 'Ministère requis'),
  soaCode:   z.string().min(1, 'SOA requis'),
});

export type ChauffeurFormData = z.infer<typeof chauffeurSchema>;
