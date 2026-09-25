export type PieceStatut = 'ATTENDUE' | 'RECUE' | 'ABSENTE' | 'NON_CONFORME' | 'REMPLACEE' | 'VALIDEE';

/** traitement_siigpe.tsi_dossier_piece, tel que renvoyé par le hub — voir dossiersApi.pieces(). */
export interface DossierPiece {
  dossierPieceId: string;
  referenceActe:  string;
  pieceId?:       string;
  pieceLibelle:   string;
  obligatoire:    boolean;
  statutPiece:    PieceStatut;
  dateSaisie:     string;
  version:        number;
  nomOriginal?:    string;
  mimeType?:       string;
  tailleOctets?:   number;
  /** bscva.dossier_piece.observation — remplit/complète le statut quand la pièce n'est pas déposée sous forme de fichier (ex. remise en main propre). */
  observation?:    string;
}
