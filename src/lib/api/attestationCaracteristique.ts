import type { AttestationCaracteristique } from '@/lib/fixtures/attestationCaracteristique.fixtures';
import { api } from './client';

export type AttestationCaracteristiqueInput = Omit<AttestationCaracteristique, 'attestationId' | 'referenceActe' | 'statut'>;

export const attestationCaracteristiqueApi = {
  list: () => api.get<AttestationCaracteristique[]>('/api-attestationcaracteristiques/api/attestations-caracteristiques'),

  async getByReference(referenceActe: string): Promise<AttestationCaracteristique | null> {
    const items = await attestationCaracteristiqueApi.list();
    return items.find((a) => a.referenceActe === referenceActe) ?? null;
  },

  /** POST /api/attestations-caracteristiques — le DTO réel attend `ministereCode` (pas `minCode`,
   *  seul ce module l'appelle ainsi). */
  create: (input: AttestationCaracteristiqueInput) =>
    api.post<{ referenceActe: string; attestationId: string }>(
      '/api-attestationcaracteristiques/api/attestations-caracteristiques',
      { ...input, ministereCode: input.minCode },
    ),

  /** PATCH .../valider — statut → 'V' + upsert du référentiel réduit
   *  (referentiel_siigpe.rsi_attestation_caracteristique). Appelé depuis la génération du
   *  document, même patron que recensement/valider. */
  valider: (attestationId: string) => api.patch<{ attestationId: string; statut: string }>(
    `/api-attestationcaracteristiques/api/attestations-caracteristiques/${encodeURIComponent(attestationId)}/valider`, {}),
};

export type { AttestationCaracteristique };
