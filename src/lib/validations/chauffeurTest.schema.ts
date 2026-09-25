import { z } from 'zod';

export const chauffeurTestSchema = z.object({
  chauffeurId:     z.string().min(1, 'Chauffeur requis'),
  vehiculeId:      z.string().optional().default(''),
  dateTest:        z.string()
    .min(1, 'Date du test requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format attendu : aaaa-mm-jj)')
    .refine((v) => !Number.isNaN(new Date(v).getTime()), 'Date invalide'),
  examinateurNom:  z.string().min(1, 'Examinateur requis'),
  noteTheorique:   z.coerce.number().min(0).max(20),
  notePratique:    z.coerce.number().min(0).max(20),
  resultat:        z.enum(['APTE', 'NON_APTE']).nullable(),
});

export type ChauffeurTestFormData = z.infer<typeof chauffeurTestSchema>;
