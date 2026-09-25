'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { evaluationFicheApi, type FicheEvaluation } from '@/lib/api/evaluationFiche';

const cle = (referenceActe: string) => ['evaluation-fiches', referenceActe] as const;

export function useFichesEvaluation(referenceActe: string, enabled = true) {
  return useQuery({
    queryKey: cle(referenceActe),
    queryFn: () => evaluationFicheApi.list(referenceActe),
    enabled: enabled && Boolean(referenceActe),
  });
}

export function useSaveFichesEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceActe, fiches }: { referenceActe: string; fiches: FicheEvaluation[] }) =>
      evaluationFicheApi.save(referenceActe, fiches),
    onSuccess: (_data, { referenceActe }) => queryClient.invalidateQueries({ queryKey: cle(referenceActe) }),
  });
}

/** Enregistre les fiches juste après la création du dossier ; l'étape est non bloquante — en cas
 *  d'échec le dossier reste créé et la fiche est re-saisissable depuis l'onglet du dossier. */
export async function enregistrerFichesApresCreation(
  save: (args: { referenceActe: string; fiches: FicheEvaluation[] }) => Promise<unknown>,
  referenceActe: string,
  fiches: FicheEvaluation[],
): Promise<void> {
  if (fiches.length === 0) return;
  try {
    await save({ referenceActe, fiches });
  } catch {
    toast.error("Le dossier est créé, mais la fiche d'évaluation n'a pas pu être enregistrée. Ressaisissez-la depuis le dossier.");
  }
}
