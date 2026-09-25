import { z } from 'zod';

export const attestationCaracteristiqueSchema = z.object({
  vehiculeId:         z.string().min(1, 'Véhicule requis'),
  minCode:            z.string().min(1, 'Ministère requis'),
  soaLibelle:         z.string().min(1, 'SOA requis'),
  immatriculation:    z.string().min(1, 'Immatriculation requise'),
  marque:             z.string().min(1, 'Marque requise'),
  genre:              z.string().min(1, 'Genre requis'),
  carrosserie:        z.string().min(1, 'Carrosserie requise'),
  typeVeh:            z.string().min(1, 'Type requis'),
  numeroSerieType:    z.string().min(1, 'N° dans la série de type requis'),
  numeroMoteur:       z.string().min(1, 'N° moteur requis'),
  nombrePlace:        z.coerce.number().min(0),
  sourceEnergie:      z.string().min(1, 'Source d\'énergie requise'),
  puissanceAdmin:     z.coerce.number().min(0),
  poidsVide:          z.coerce.number().min(0),
  chargeUtile:        z.coerce.number().min(0),
  ptac:               z.coerce.number().min(0),
  anneePremiereMise:  z.coerce.number().min(0),
  motifPerte:         z.string().min(1, 'Motif requis'),
  observation:        z.string().optional().default(''),
});

export type AttestationCaracteristiqueFormData = z.infer<typeof attestationCaracteristiqueSchema>;
