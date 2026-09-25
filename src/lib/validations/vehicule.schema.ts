import { z } from 'zod';

export const vehiculeSchema = z.object({
  vehiculeImmatriculation: z.string().min(3, 'Immatriculation requise'),
  minCode:                 z.string().min(1, 'Ministère requis'),
  soaDepositaire:           z.string().min(1, 'SOA dépositaire requis'),
  marqueCode:               z.string().min(1, 'Marque requise'),
  genreCode:                z.string().min(1, 'Genre requis'),
  carrosserieCode:          z.string().min(1, 'Carrosserie requise'),
  categorieVehicule:        z.string().min(1, 'Catégorie requise'),
  sourceEnergie:             z.string().min(1, "Source d'énergie requise"),
  etatVehicule:              z.string().min(1, 'État requis'),
  numeroMoteur:             z.string().min(1, 'Numéro moteur requis'),
  vin:                       z.string().min(1, 'Numéro de châssis requis'),
  puissanceAdministrative:   z.coerce.number().min(0),
  pls:                       z.coerce.number().min(0),
  pv:                        z.coerce.number().min(0),
  cu:                        z.coerce.number().min(0),
  pt:                        z.coerce.number().min(0),
  valeurEstimative:          z.coerce.number().min(0).optional().default(0),
  datePremierMiseCirculation: z.date(),
  carteGrise:                z.boolean(),
  livretsDisponibles:        z.boolean(),
  detenteurEffectif:         z.string().min(1, 'Détenteur effectif requis'),
  regionCode:                z.string().min(1, 'Région requise'),
  districtCode:              z.string().min(1, 'District requis'),
  communeCode:               z.string().min(1, 'Commune requise'),
  statut:                    z.enum(['ACTIF', 'REFORME', 'CONDAMNE']),
});

export type VehiculeFormData = z.infer<typeof vehiculeSchema>;
