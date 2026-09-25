'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aptitudeLocationApi, type AptitudeLocationInput } from '@/lib/api/aptitudeLocation';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useControlesAptitude() {
  return useQuery({ queryKey: QUERY_KEYS.aptitudeLocation.all, queryFn: aptitudeLocationApi.list });
}

export function useAptitudeLocationByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.aptitudeLocation.all, 'by-reference', referenceActe],
    queryFn: () => aptitudeLocationApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useCreateAptitudeLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AptitudeLocationInput) => aptitudeLocationApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aptitudeLocation.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Contrôle aptitude créé avec succès', data.referenceActe);
    },
  });
}

export function useUpdateAptitudeAvis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ aptitudeId, avisAptitude, observation }: { aptitudeId: string; avisAptitude: 'APTE' | 'NON_APTE'; observation: string }) =>
      aptitudeLocationApi.updateAvis(aptitudeId, avisAptitude, observation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aptitudeLocation.all });
      toast.success('Avis d\'aptitude enregistré');
    },
  });
}

export function useGenererAutorisationLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aptitudeId: string) => aptitudeLocationApi.genererAutorisationLocation(aptitudeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aptitudeLocation.all }),
  });
}
