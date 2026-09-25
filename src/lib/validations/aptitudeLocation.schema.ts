import { z } from 'zod';

export const aptitudeLocationSchema = z.object({
  vehiculeId:         z.string().min(1, 'Véhicule requis'),
  objetMission:       z.string().min(1, 'Objet de mission requis'),
  itineraire:         z.string().optional().default(''),
  dateDebut:          z.string().min(1, 'Date de début requise'),
  dateFin:            z.string().min(1, 'Date de fin requise'),
  contratLocation:    z.string().min(1, 'Numéro de contrat de location requis'),
  fournisseurNifStat: z.string().optional().default(''),
  avisAptitude:       z.enum(['APTE', 'NON_APTE']).nullable(),
});

export type AptitudeLocationFormData = z.infer<typeof aptitudeLocationSchema>;
