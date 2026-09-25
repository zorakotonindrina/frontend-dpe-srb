import { z } from 'zod';

export const arretageLivretSchema = z.object({
  vehiculeId:       z.string().min(1, 'Véhicule requis'),
  dateArretage:     z.string().min(1, 'Date requise'),
  dernierBc:        z.string().optional().default(''),
  vehiculeFonction: z.boolean(),
  // En-tête de la feuille « Carburants et lubrifiants » (texte, converti en nombre à l'envoi)
  typeCarburant:          z.string().optional().default(''),
  dotationMensuelle:      z.string().optional().default(''),
  dotationExceptionnelle: z.string().optional().default(''),
});

export type ArretageLivretFormData = z.infer<typeof arretageLivretSchema>;
