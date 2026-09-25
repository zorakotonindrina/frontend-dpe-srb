import type { ControleAptitude } from '@/lib/fixtures/aptitudeLocation.fixtures';
import { api } from './client';

export type AptitudeLocationInput = Omit<ControleAptitude, 'aptitudeId' | 'referenceActe' | 'statut' | 'observation'>;

export const aptitudeLocationApi = {
  list: () => api.get<ControleAptitude[]>('/api-aptitudelocation/api/locations'),

  get: (aptitudeId: string) => api.get<ControleAptitude>(`/api-aptitudelocation/api/locations/${encodeURIComponent(aptitudeId)}`),

  async getByReference(referenceActe: string): Promise<ControleAptitude | null> {
    const items = await aptitudeLocationApi.list();
    return items.find((a) => a.referenceActe === referenceActe) ?? null;
  },

  /** POST /api/locations/aptitude — ministereCode obligatoire côté DTO réel, absent du
   *  formulaire — code MEF/BSCVA réel '21' (referentiel_rh.rh_ministere) en attendant un vrai
   *  sélecteur. */
  create: (input: AptitudeLocationInput) =>
    api.post<{ referenceActe: string; aptitudeId: string }>('/api-aptitudelocation/api/locations/aptitude', {
      ...input,
      ministereCode: '21',
      dossierMotif: `Aptitude / Location — ${input.objetMission}`,
    }),

  /** PATCH .../avis — le backend génère lui-même ATTESTATION_APTITUDE dès l'avis posé
   *  (AptitudeService.appliquerAvis) ; observation n'est pas persistée côté réel (pas de
   *  colonne sur ts_controle_aptitude, cf. Script.sql), acceptée pour compat DTO uniquement. */
  updateAvis: (aptitudeId: string, avisAptitude: 'APTE' | 'NON_APTE', observation: string) =>
    api.patch<{ aptitudeId: string; avisAptitude: string }>(
      `/api-aptitudelocation/api/locations/${encodeURIComponent(aptitudeId)}/avis`, { avisAptitude, observation }),

  /** POST .../autorisation-location — le backend refuse (400) si l'avis n'est pas APTE et
   *  génère lui-même AUTORISATION_LOCATION (AptitudeService.genererAutorisationLocation). */
  genererAutorisationLocation: (aptitudeId: string) =>
    api.post<{ status: string }>(`/api-aptitudelocation/api/locations/${encodeURIComponent(aptitudeId)}/autorisation-location`, {}),
};

export type { ControleAptitude };
