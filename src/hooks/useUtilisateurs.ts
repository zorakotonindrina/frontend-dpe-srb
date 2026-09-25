'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { utilisateursApi, type UtilisateurInput } from '@/lib/api/utilisateurs';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useUtilisateurs() {
  return useQuery({
    queryKey: QUERY_KEYS.administration.utilisateurs.all,
    queryFn: () => utilisateursApi.list(),
  });
}

export function useUtilisateur(matricule: string) {
  return useQuery({
    queryKey: QUERY_KEYS.administration.utilisateurs.detail(matricule),
    queryFn: () => utilisateursApi.get(matricule),
    enabled: Boolean(matricule),
  });
}

export function useCreateUtilisateur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UtilisateurInput) => utilisateursApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.administration.utilisateurs.all });
      toast.success('Utilisateur créé avec succès');
    },
  });
}

export function useUpdateUtilisateur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matricule, patch }: { matricule: string; patch: Partial<UtilisateurInput> }) =>
      utilisateursApi.update(matricule, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.administration.utilisateurs.all });
      toast.success('Utilisateur modifié avec succès');
    },
  });
}
