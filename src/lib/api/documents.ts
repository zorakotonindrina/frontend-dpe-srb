import type { DocumentGenere, DocumentStatut } from '@/lib/fixtures/documents.fixtures';
import { auditApi } from './audit';
import { api, getBlob } from './client';

/** document_siigpe.document_genere, tel que renvoyé par le hub (camelCase des colonnes réelles) —
 *  modeleCode/modeleLibelle viennent d'une jointure sur document_siigpe.modele_document côté requête
 *  (document_genere n'a qu'un modele_id, pas de code en clair). */
interface RawDocumentGenere {
  documentId: string;
  referenceActe: string;
  numeroDocument: string;
  statut: DocumentStatut;
  genereLe: string;
  modeleCode: string | null;
}

function toDocumentGenere(raw: RawDocumentGenere): DocumentGenere {
  return {
    documentId: raw.documentId,
    referenceActe: raw.referenceActe,
    modeleCode: raw.modeleCode ?? '',
    numeroDocument: raw.numeroDocument,
    statut: raw.statut,
    genereLe: raw.genereLe?.slice(0, 10) ?? '',
  };
}

export const documentsApi = {
  /** GET /api-documents/api/documents — liste globale (tableau de bord, page /documents, et
   *  filtrage côté client par referenceActe dans dossiers/detail). */
  list: () => api.get<RawDocumentGenere[]>('/api-documents/api/documents').then((rows) => rows.map(toDocumentGenere)),

  /** Rendu réel (POST /api/dossiers/{ref}/documents/generer/{modeleCode}) — les 12 modeleCode ont
   *  désormais un vrai gabarit Jasper (DemoReportBuilder/JasperController). Crée directement la
   *  ligne document_siigpe.document_genere réelle côté serveur (statut BROUILLON) — c'est la seule source
   *  de vérité désormais, `documentsApi.create` (mock) a été retiré. */
  genererReel: (referenceActe: string, modeleCode: string) =>
    api.post<{ documentId: string; numeroDocument: string; statut: string }>(
      `/api-documents/api/dossiers/${encodeURIComponent(referenceActe)}/documents/generer/${encodeURIComponent(modeleCode)}`,
      {},
    ),

  telechargerReel: (documentId: string) =>
    getBlob(`/api-documents/api/documents/${encodeURIComponent(documentId)}/download`),

  /** Pas d'appelant actuel dans l'app (page /documents en lecture seule) — implémenté contre le
   *  vrai backend pour être utilisable tel quel si une action manuelle y est ajoutée plus tard. */
  async updateStatut(id: string, statut: DocumentStatut): Promise<void> {
    if (statut === 'VALIDE') {
      await api.post(`/api-documents/api/documents/${encodeURIComponent(id)}/valider`, {});
    } else if (statut === 'ANNULE') {
      await api.post(`/api-documents/api/documents/${encodeURIComponent(id)}/annuler`, {});
    } else {
      throw new Error(`Changement de statut non supporté : ${statut}`);
    }
    auditApi.log('DOCUMENT_STATUT_MODIFIE', `Document ${id} — statut changé en ${statut}`);
  },
};

export type { DocumentGenere, DocumentStatut };
