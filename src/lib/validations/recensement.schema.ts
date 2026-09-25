import { z } from 'zod';

export const recensementSchema = z.object({
  minCode:            z.string().min(1, 'Ministère requis'),
  niveauType:         z.enum(['CENTRALE', 'REGIONALE'], { message: 'Niveau requis' }),
  niveauLibelle:      z.string().min(1, 'Libellé requis (ex. District d\'Antananarivo VI)'),
  pointFocalNom:      z.string().min(1, 'Nom du point focal requis'),
  pointFocalFonction: z.string().min(1, 'Fonction requise'),
  pointFocalTel:      z.string().min(1, 'Téléphone requis'),
  pointFocalEmail:    z.string().email('Email invalide'),
});

export type RecensementFormData = z.infer<typeof recensementSchema>;
