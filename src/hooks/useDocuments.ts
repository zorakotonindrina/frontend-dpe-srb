'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { documentsApi } from '@/lib/api/documents';
import type { DocumentStatut } from '@/lib/fixtures/documents.fixtures';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useDocuments() {
  return useQuery({
    queryKey: QUERY_KEYS.documents.all,
    queryFn: documentsApi.list,
  });
}

/** Télécharge le PDF réel d'un document déjà généré (n'importe quelle version) — déclenche un
 *  téléchargement navigateur classique, calqué sur useTelechargerPieceFichier (useDossiers.ts). */
export function useDownloadDocument() {
  return useMutation({
    mutationFn: async ({ documentId, numeroDocument }: { documentId: string; numeroDocument?: string }) => {
      const blob = await documentsApi.telechargerReel(documentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = numeroDocument ? `${numeroDocument}.pdf` : `document-${documentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error('Échec du téléchargement du document');
    },
  });
}

export function useUpdateDocumentStatut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: DocumentStatut }) => documentsApi.updateStatut(id, statut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
      toast.success('Document mis à jour');
    },
  });
}

/**
 * Rendu Jasper réel — génère puis récupère immédiatement le PDF (blob), affiché en aperçu intégré
 * sur la page courante (`previewUrl`, à consommer par une boîte de dialogue avec <iframe>) plutôt
 * que dans un nouvel onglet — l'app ne perd jamais le contexte du dossier en cours. Invalide
 * `documents` en succès : c'est désormais la seule source de création (plus de mock `createDocument`
 * en parallèle), les onglets/dialogues qui lisent `documents` doivent voir la ligne réelle tout de
 * suite (numéro de document émis par le serveur, pas un numéro calculé côté client).
 */
export function useGenererDocumentReel() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ referenceActe, modeleCode }: { referenceActe: string; modeleCode: string }) => {
      const { documentId } = await documentsApi.genererReel(referenceActe, modeleCode);
      const blob = await documentsApi.telechargerReel(documentId);
      setPreviewUrl(URL.createObjectURL(blob));
      return documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
    },
    onError: () => {
      toast.error('Échec de la génération du PDF réel');
    },
  });

  const closePreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  return { ...mutation, previewUrl, closePreview };
}
