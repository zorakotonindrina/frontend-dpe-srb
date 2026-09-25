import type { DossierStatut, EtapeCode } from '@/lib/constants/workflow-etapes';
import type { DossierPiece, PieceStatut } from '@/lib/fixtures/dossiers.fixtures';
import { auditApi } from './audit';
import { api, ApiError, buildQS, getBlob } from './client';
import type { WfProcessusActiviteTache } from '@/types/workflow.types';

/** workflow.wf_dossier (Script.sql) — le `statut` est dérivé, jamais stocké (voir workflow-etapes.ts). */
export interface Dossier {
  idDossier:        string;
  referenceActe:    string;
  typeActe:         string;
  processusCode:    string;
  ministereCode:    string;
  dossierDateDepot: string;
  dossierMotif:     string;
  statut:           DossierStatut;
  /** Code de la tâche `wf_processus_activite_tache` réellement ouverte, `null` si circuit terminé. */
  etapeCode:        EtapeCode | null;
  motifRejet?:      string;
  /**
   * Véhicule lié (page `vehicules/[id]`) — TODO : `wf_dossier` n'a pas de colonne `vehicule_id`
   * (voir Script.sql) ; le lien réel passe par `bscva.dossier_vehicule_ligne`. Non peuplé pour
   * l'instant (hors périmètre du moteur de workflow).
   */
  vehiculeId?:      string;
}

export interface AddPieceInput {
  pieceLibelle: string;
  file:         File;
}

export interface AttachPieceFileInput {
  /** Requis par l'URL réelle (POST /api/dossiers/{referenceActe}/pieces/upload). */
  referenceActe: string;
  file:          File;
}

export interface DossiersParams {
  search?:        string;
  typeActe?:      string;
  statut?:        DossierStatut;
  processusCode?: string;
  /** Borne inférieure inclusive sur `dossierDateDepot`, format ISO yyyy-mm-dd */
  dateFrom?:      string;
  /** Borne supérieure inclusive sur `dossierDateDepot`, format ISO yyyy-mm-dd */
  dateTo?:        string;
}

export const dossiersApi = {
  /** Branché sur le vrai backend (GET /api-workflow/api/dossiers) — le hub calcule déjà
   *  `etapeCode`/`statut` pour chaque ligne (DossierService.enrichirStatuts). `statut` reste
   *  filtré côté client : c'est une valeur dérivée, jamais stockée, donc jamais un paramètre SQL. */
  async list(params?: DossiersParams): Promise<Dossier[]> {
    const rows = await api.get<Array<{
      idDossier: string; referenceActe: string; typeActe: string; processusCode: string;
      ministereCode: string; dossierDateDepot: string; dossierMotif: string;
      motifRejet: string | null; etapeCode: EtapeCode | null; statut: DossierStatut;
    }>>(`/api-workflow/api/dossiers${buildQS({
      search: params?.search, typeActe: params?.typeActe, processusCode: params?.processusCode,
      dateFrom: params?.dateFrom, dateTo: params?.dateTo,
    })}`);

    let items: Dossier[] = rows.map((r) => ({
      idDossier:        r.idDossier,
      referenceActe:    r.referenceActe,
      typeActe:         r.typeActe,
      processusCode:    r.processusCode,
      ministereCode:    r.ministereCode,
      dossierDateDepot: r.dossierDateDepot,
      dossierMotif:     r.dossierMotif,
      motifRejet:       r.motifRejet ?? undefined,
      etapeCode:        r.etapeCode,
      statut:           r.statut,
    }));

    if (params?.statut) items = items.filter((d) => d.statut === params.statut);
    return items.sort((a, b) => b.dossierDateDepot.localeCompare(a.dossierDateDepot));
  },

  /** Branché sur le vrai backend (GET /api-workflow/api/dossiers/{ref}) — le hub calcule déjà
   *  `etapeCode`/`statut` (DossierService.getDossier), miroir exact de deriveDossierStatut. */
  async get(referenceActe: string): Promise<Dossier | null> {
    try {
      const raw = await api.get<{
        idDossier: string; referenceActe: string; typeActe: string; processusCode: string;
        ministereCode: string; dossierDateDepot: string; dossierMotif: string;
        motifRejet: string | null; etapeCode: EtapeCode | null; statut: DossierStatut;
      }>(`/api-workflow/api/dossiers/${encodeURIComponent(referenceActe)}`);
      return {
        idDossier:        raw.idDossier,
        referenceActe:    raw.referenceActe,
        typeActe:         raw.typeActe,
        processusCode:    raw.processusCode,
        ministereCode:    raw.ministereCode,
        dossierDateDepot: raw.dossierDateDepot,
        dossierMotif:     raw.dossierMotif,
        motifRejet:       raw.motifRejet ?? undefined,
        etapeCode:        raw.etapeCode,
        statut:           raw.statut,
      };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  /** Pièces jointes du dossier — branché sur GET /api-workflow/api/dossiers/{ref}/pieces (les
   *  actions d'écriture ci-dessous — addPiece/attachPieceFile/updateStatut/téléchargement/
   *  suppression de fichier — sont elles aussi réelles). */
  async pieces(referenceActe: string): Promise<DossierPiece[]> {
    const rows = await api.get<Array<{
      dossierPieceId: string; referenceActe: string; pieceId?: string; libelleLibre?: string;
      pieceLibelle?: string; obligatoire?: number | boolean | null; statutPiece: PieceStatut;
      dateSaisie: string; version: number; nomOriginal?: string; mimeType?: string;
      tailleOctets?: number; observation?: string;
    }>>(`/api-workflow/api/dossiers/${encodeURIComponent(referenceActe)}/pieces`);
    return rows.map((r) => ({
      dossierPieceId: r.dossierPieceId,
      referenceActe:  r.referenceActe,
      pieceId:        r.pieceId,
      pieceLibelle:   r.pieceLibelle ?? r.libelleLibre ?? '',
      obligatoire:    Boolean(Number(r.obligatoire ?? 0)),
      statutPiece:    r.statutPiece,
      dateSaisie:     r.dateSaisie,
      version:        r.version,
      nomOriginal:    r.nomOriginal,
      mimeType:       r.mimeType,
      tailleOctets:   r.tailleOctets,
      observation:    r.observation,
    }));
  },

  /** Ajoute une pièce jointe libre (libellé + fichier) à un dossier existant, hors référentiel
   *  piece_dossier — POST .../pieces/upload sans dossierPieceId (PieceController.uploader crée
   *  une pièce libre). Image convertie en PDF côté backend (iText), PDF copié tel quel. */
  async addPiece(referenceActe: string, input: AddPieceInput): Promise<DossierPiece> {
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('pieceLibelle', input.pieceLibelle);
    const res = await api.upload<{ dossierPieceId: string }>(
      `/api-workflow/api/dossiers/${encodeURIComponent(referenceActe)}/pieces/upload`, formData);
    auditApi.log('PIECE_JOINTE', `Pièce "${input.pieceLibelle}" ajoutée — ${input.file.name}`, { referenceActe });
    return {
      dossierPieceId: res.dossierPieceId,
      referenceActe,
      pieceLibelle:   input.pieceLibelle,
      obligatoire:    false,
      statutPiece:    'RECUE',
      dateSaisie:     new Date().toISOString().slice(0, 10),
      version:        1,
      nomOriginal:    input.file.name,
      mimeType:       input.file.type,
      tailleOctets:   input.file.size,
    };
  },

  /** Joint (ou remplace) le fichier d'une pièce déjà existante (référentielle ou libre) — POST
   *  .../pieces/upload avec dossierPieceId (PieceController.uploader met à jour la ligne
   *  existante). Recharge la pièce depuis le backend pour refléter le statut/version réels
   *  (aucun endpoint "1 pièce par id" exposé, on relit la liste et on filtre). */
  async attachPieceFile(dossierPieceId: string, input: AttachPieceFileInput): Promise<DossierPiece> {
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('dossierPieceId', dossierPieceId);
    await api.upload(`/api-workflow/api/dossiers/${encodeURIComponent(input.referenceActe)}/pieces/upload`, formData);
    auditApi.log('PIECE_JOINTE', `Fichier joint — ${input.file.name}`, { referenceActe: input.referenceActe });
    const pieces = await dossiersApi.pieces(input.referenceActe);
    const updated = pieces.find((p) => p.dossierPieceId === dossierPieceId);
    if (!updated) throw new Error('Pièce introuvable après upload');
    return updated;
  },

  /** Change le statut (et/ou le motif de non-conformité, réutilisé ici comme "observation" libre —
   *  seul champ texte modifiable exposé par PUT .../statut) d'une pièce — PieceController.changerStatut. */
  async updateStatut(dossierPieceId: string, patch: { statutPiece?: PieceStatut; observation?: string }): Promise<{ dossierPieceId: string }> {
    await api.put(`/api-workflow/api/pieces/${encodeURIComponent(dossierPieceId)}/statut`, {
      statutPiece: patch.statutPiece,
      motifNonConformite: patch.observation,
    });
    auditApi.log('PIECE_STATUT_MAJ', 'Statut de la pièce mis à jour', {});
    return { dossierPieceId };
  },

  /** Historique réel du dossier : les lignes de tâches (closes et ouverte), ordonnées par rang —
   *  GET /api-workflow/api/dossiers/{ref}/historique (déjà trié par rang côté backend). */
  historique: (referenceActe: string): Promise<WfProcessusActiviteTache[]> =>
    api.get<WfProcessusActiviteTache[]>(`/api-workflow/api/dossiers/${encodeURIComponent(referenceActe)}/historique`),

  /** Fichier stocké d'une pièce (PDF, éventuellement converti depuis une image) — GET nécessite le
   *  Bearer token de la gateway, d'où getBlob() plutôt qu'un simple <a href>. */
  telechargerPieceFichier: (dossierPieceId: string): Promise<Blob> =>
    getBlob(`/api-workflow/api/pieces/${encodeURIComponent(dossierPieceId)}/fichier`),

  /** Supprime le fichier disque d'une pièce et vide ses colonnes fichier (PieceController.
   *  supprimerFichier) — ne touche pas statutPiece, laissé à updateStatut(). */
  async supprimerPieceFichier(dossierPieceId: string): Promise<void> {
    await api.delete(`/api-workflow/api/pieces/${encodeURIComponent(dossierPieceId)}/fichier`);
    auditApi.log('PIECE_FICHIER_SUPPRIME', 'Fichier de la pièce supprimé', {});
  },
};

export type { DossierPiece, PieceStatut } from '@/lib/fixtures/dossiers.fixtures';
export type { DossierStatut } from '@/lib/constants/workflow-etapes';
