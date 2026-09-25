'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attestationCaracteristiqueApi, type AttestationCaracteristiqueInput } from '@/lib/api/attestationCaracteristique';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useAttestationsCaracteristique() {
  return useQuery({ queryKey: QUERY_KEYS.attestationCaracteristique.all, queryFn: attestationCaracteristiqueApi.list });
}

export function useAttestationCaracteristiqueByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.attestationCaracteristique.all, 'by-reference', referenceActe],
    queryFn: () => attestationCaracteristiqueApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useCreateAttestationCaracteristique() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AttestationCaracteristiqueInput) => attestationCaracteristiqueApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.attestationCaracteristique.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Attestation de caractéristiques créée avec succès', data.referenceActe);
    },
  });
}

/** PATCH .../valider — appelé à la génération du document (dossiers/detail/page.tsx), même
 *  patron que useValiderRecensement. */
export function useValiderAttestationCaracteristique() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attestationId: string) => attestationCaracteristiqueApi.valider(attestationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.attestationCaracteristique.all });
    },
  });
}
