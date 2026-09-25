'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  constatationApi, type ConstatationInput, type ElementInput, type LibelleInput,
} from '@/lib/api/constatation';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { notifyDossierCreated } from '@/lib/utils/notify-dossier-created';

export function useConstatations() {
  return useQuery({ queryKey: QUERY_KEYS.constatationTechnique.all, queryFn: constatationApi.list });
}

export function useConstatation(id: string) {
  return useQuery({ queryKey: QUERY_KEYS.constatationTechnique.detail(id), queryFn: () => constatationApi.get(id), enabled: Boolean(id) });
}

export function useConstatationByReference(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.constatationTechnique.all, 'by-reference', referenceActe],
    queryFn: () => constatationApi.getByReference(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useConstatationElements(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.constatationTechnique.detail(id), 'elements'],
    queryFn: () => constatationApi.elements(id),
    enabled: Boolean(id),
  });
}

export function useConstatationPiecesRemplacer(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.constatationTechnique.detail(id), 'pieces-remplacer'],
    queryFn: () => constatationApi.piecesRemplacer(id),
    enabled: Boolean(id),
  });
}

export function useConstatationReparations(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.constatationTechnique.detail(id), 'reparations'],
    queryFn: () => constatationApi.reparations(id),
    enabled: Boolean(id),
  });
}

export function useConstatationAccessoires(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.constatationTechnique.detail(id), 'accessoires'],
    queryFn: () => constatationApi.accessoires(id),
    enabled: Boolean(id),
  });
}

export function useValiderConstatation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (constatationId: string) => constatationApi.valider(constatationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.constatationTechnique.all }),
  });
}

export function useCreateConstatation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, elements, pieces, reparations, accessoires }: {
      input: ConstatationInput; elements: ElementInput[]; pieces: LibelleInput[]; reparations: LibelleInput[]; accessoires: LibelleInput[];
    }) => constatationApi.create(input, elements, pieces, reparations, accessoires),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.constatationTechnique.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      notifyDossierCreated('Constatation technique créée avec succès', data.referenceActe);
    },
  });
}
