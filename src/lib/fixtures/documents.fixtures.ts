/** document_siigpe.document_genere (Script.sql) */
export type DocumentStatut = 'BROUILLON' | 'VALIDE' | 'ANNULE' | 'REMPLACE';

export interface DocumentGenere {
  documentId:     string;
  referenceActe:  string;
  modeleCode:     string;
  numeroDocument: string;
  statut:         DocumentStatut;
  genereLe:       string;
}

export const documentsFixtures: DocumentGenere[] = [
  { documentId: 'doc-1', referenceActe: 'REC072026001', modeleCode: 'QUITUS_RECENSEMENT', numeroDocument: 'QT-2026-0001', statut: 'VALIDE', genereLe: '2026-01-25' },
  { documentId: 'doc-2', referenceActe: 'VBC072026003', modeleCode: 'BC_VISE', numeroDocument: 'BC-2026-0014', statut: 'BROUILLON', genereLe: '2026-03-11' },
  { documentId: 'doc-3', referenceActe: 'LOC072026006', modeleCode: 'AUTORISATION_LOCATION', numeroDocument: 'AL-2026-0007', statut: 'VALIDE', genereLe: '2026-06-05' },
  { documentId: 'doc-4', referenceActe: 'TCH072026010', modeleCode: 'RESULTAT_TEST_CHAUFFEUR', numeroDocument: 'RTC-2026-0001', statut: 'VALIDE', genereLe: '2026-06-16' },
];
