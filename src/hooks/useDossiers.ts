'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  dossiersApi, type AddPieceInput, type AttachPieceFileInput, type DossiersParams, type PieceStatut,
} from '@/lib/api/dossiers';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useDossiers(params?: DossiersParams) {
  return useQuery({
    queryKey: QUERY_KEYS.dossiers.list(params),
    queryFn: () => dossiersApi.list(params),
  });
}

export function useDossier(referenceActe: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dossiers.detail(referenceActe),
    queryFn: () => dossiersApi.get(referenceActe),
    enabled: Boolean(referenceActe),
  });
}

export function useDossierPieces(referenceActe: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.dossiers.detail(referenceActe), 'pieces'],
    queryFn: () => dossiersApi.pieces(referenceActe),
    enabled: Boolean(referenceActe),
  });
}

export function useAddDossierPiece() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referenceActe, ...input }: { referenceActe: string } & AddPieceInput) =>
      dossiersApi.addPiece(referenceActe, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.dossiers.detail(variables.referenceActe), 'pieces'] });
      toast.success('Pièce ajoutée avec succès');
    },
  });
}

export function useAttachPieceFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dossierPieceId, ...input }: { dossierPieceId: string } & AttachPieceFileInput) =>
      dossiersApi.attachPieceFile(dossierPieceId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.dossiers.detail(data.referenceActe), 'pieces'] });
      toast.success('Pièce jointe enregistrée');
    },
  });
}

export function useUpdateDossierPieceStatut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dossierPieceId, ...patch }: { dossierPieceId: string; statutPiece?: PieceStatut; observation?: string }) =>
      dossiersApi.updateStatut(dossierPieceId, patch),
    // PUT .../pieces/{id}/statut ne renvoie pas la referenceActe (non nécessaire à l'appel
    // lui-même, contrairement à l'upload) — invalidation large plutôt que ciblée par dossier.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      toast.success('Pièce mise à jour');
    },
  });
}

/** Historique réel du dossier — lignes `wf_processus_activite_tache` ordonnées par rang. */
export function useDossierHistorique(referenceActe: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.dossiers.detail(referenceActe), 'historique'],
    queryFn: () => dossiersApi.historique(referenceActe),
    enabled: Boolean(referenceActe),
  });
}

/** Télécharge le fichier réel d'une pièce (déclenche un téléchargement navigateur classique —
 *  contrairement au PDF de document généré, pas de prévisualisation intégrée nécessaire ici). */
export function useTelechargerPieceFichier() {
  return useMutation({
    mutationFn: async ({ dossierPieceId, nomOriginal }: { dossierPieceId: string; nomOriginal?: string }) => {
      const blob = await dossiersApi.telechargerPieceFichier(dossierPieceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomOriginal ?? 'piece.pdf';
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error('Échec du téléchargement du fichier');
    },
  });
}

export function useSupprimerPieceFichier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dossierPieceId: string) => dossiersApi.supprimerPieceFichier(dossierPieceId),
    // DELETE ne renvoie pas referenceActe (même limite qu'updateStatut ci-dessus) — invalidation large.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossiers.all });
      toast.success('Fichier supprimé');
    },
  });
}
