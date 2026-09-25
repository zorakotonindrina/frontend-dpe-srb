'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expertiseApi, type ExpertiseInput, type DommageInput } from '@/lib/api/expertise';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useExpertises() {
  return useQuery({ queryKey: QUERY_KEYS.expertise.all, queryFn: expertiseApi.list });
}

export function useExpertiseByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.expertise.all, 'by-reference', referenceActe],
    queryFn: () => expertiseApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useExpertiseDommages(expertiseId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.expertise.detail(expertiseId), 'dommages'],
    queryFn: () => expertiseApi.dommages(expertiseId),
    enabled: Boolean(expertiseId),
  });
}

export function useCreateExpertise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, dommages }: { input: ExpertiseInput; dommages: DommageInput[] }) => expertiseApi.create(input, dommages),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expertise.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Expertise créée avec succès', data.referenceActe);
    },
  });
}

export function useValiderExpertise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expertiseId: string) => expertiseApi.valider(expertiseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expertise.all }),
  });
}
