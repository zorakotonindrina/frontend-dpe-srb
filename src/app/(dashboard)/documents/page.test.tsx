import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import DocumentsPage, { computeDocumentVersions } from './page';

/* ------------------------------------------------------------------ */
/* Mock — documentsApi tape un vrai backend, on isole donc ce test du  */
/* réseau en mockant le hook, comme pour les modules précédents.       */
/* doc-1/doc-5/doc-6 partagent (referenceActe, modeleCode) : famille à */
/* 3 versions pour exercer le regroupement, les 3 autres restent des   */
/* familles à 1 membre (non-régression).                               */
/* ------------------------------------------------------------------ */

const mockTelechargerReel = vi.hoisted(() => vi.fn().mockResolvedValue(new Blob(['pdf'])));

vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: () => ({
    data: [
      { documentId: 'doc-1', referenceActe: 'REC072026001', modeleCode: 'QUITUS_RECENSEMENT', numeroDocument: 'QT-2026-0001', statut: 'VALIDE', genereLe: '2026-01-25' },
      { documentId: 'doc-2', referenceActe: 'VBC072026003', modeleCode: 'BC_VISE', numeroDocument: 'BC-2026-0014', statut: 'BROUILLON', genereLe: '2026-03-11' },
      { documentId: 'doc-3', referenceActe: 'LOC072026006', modeleCode: 'AUTORISATION_LOCATION', numeroDocument: 'AL-2026-0007', statut: 'VALIDE', genereLe: '2026-06-05' },
      { documentId: 'doc-4', referenceActe: 'TCH072026010', modeleCode: 'RESULTAT_TEST_CHAUFFEUR', numeroDocument: 'RTC-2026-0001', statut: 'VALIDE', genereLe: '2026-06-16' },
      { documentId: 'doc-5', referenceActe: 'REC072026001', modeleCode: 'QUITUS_RECENSEMENT', numeroDocument: 'QT-2025-0098', statut: 'ANNULE', genereLe: '2026-01-10' },
      { documentId: 'doc-6', referenceActe: 'REC072026001', modeleCode: 'QUITUS_RECENSEMENT', numeroDocument: 'QT-2025-0099', statut: 'ANNULE', genereLe: '2026-01-18' },
    ],
    isLoading: false,
  }),
  useDownloadDocument: () => ({
    mutate: (input: { documentId: string; numeroDocument?: string }) => mockTelechargerReel(input.documentId),
    isPending: false,
  }),
}));

describe('DocumentsPage — recherche et filtres', () => {
  it('affiche les 4 documents par défaut', async () => {
    renderWithProviders(<DocumentsPage />);
    expect(await screen.findByText('QT-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('BC-2026-0014')).toBeInTheDocument();
    expect(screen.getByText('AL-2026-0007')).toBeInTheDocument();
    expect(screen.getByText('RTC-2026-0001')).toBeInTheDocument();
  });

  it('affiche le libellé traduit du type d\'acte plutôt que le code brut', async () => {
    renderWithProviders(<DocumentsPage />);
    expect((await screen.findAllByText('Quitus de recensement')).length).toBeGreaterThan(0);
    expect(screen.queryByText('QUITUS_RECENSEMENT')).not.toBeInTheDocument();
  });

  it('affiche le bouton de filtre "Type d\'acte"', async () => {
    renderWithProviders(<DocumentsPage />);
    expect(await screen.findByRole('button', { name: /type d'acte/i })).toBeInTheDocument();
  });

  it('restreint les lignes à la plage de dates sélectionnée', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DocumentsPage />);

    await screen.findByText('QT-2026-0001');
    await user.type(screen.getByTestId('documents-date-from-input'), '2026-02-01');
    await user.type(screen.getByTestId('documents-date-to-input'), '2026-06-10');

    expect(screen.queryByText('QT-2026-0001')).not.toBeInTheDocument();
    expect(screen.getByText('BC-2026-0014')).toBeInTheDocument();
    expect(screen.getByText('AL-2026-0007')).toBeInTheDocument();
    expect(screen.queryByText('RTC-2026-0001')).not.toBeInTheDocument();
  });

  it('la recherche globale existante filtre toujours par numéro (non-régression)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DocumentsPage />);

    await screen.findByText('QT-2026-0001');
    await user.type(screen.getByTestId('datatable-search-input'), 'BC-2026');

    expect(screen.getByText('BC-2026-0014')).toBeInTheDocument();
    expect(screen.queryByText('QT-2026-0001')).not.toBeInTheDocument();
  });
});

describe('DocumentsPage — versioning des documents', () => {
  it('affiche le badge de version uniquement sur la famille à plusieurs versions', async () => {
    renderWithProviders(<DocumentsPage />);

    // doc-1/doc-5/doc-6 partagent (referenceActe, modeleCode) : 3 versions, doc-1 la plus récente.
    expect(await screen.findByTestId('document-version-badge-doc-1')).toHaveTextContent('v3/3');
    // Familles à 1 membre : pas de badge.
    expect(screen.queryByTestId('document-version-badge-doc-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('document-version-badge-doc-3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('document-version-badge-doc-4')).not.toBeInTheDocument();
  });

  it('n\'affiche le bouton "Voir les versions" que pour les familles à plusieurs versions', async () => {
    renderWithProviders(<DocumentsPage />);

    expect(await screen.findByTestId('document-versions-button-doc-1')).toBeInTheDocument();
    expect(screen.queryByTestId('document-versions-button-doc-2')).not.toBeInTheDocument();
  });

  it('ouvre le dialog et affiche les 3 versions de la famille', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DocumentsPage />);

    await user.click(await screen.findByTestId('document-versions-button-doc-1'));

    expect(await screen.findByTestId('document-version-row-doc-1')).toBeInTheDocument();
    expect(screen.getByTestId('document-version-row-doc-5')).toBeInTheDocument();
    expect(screen.getByTestId('document-version-row-doc-6')).toBeInTheDocument();
    expect(screen.getByText('Version actuelle')).toBeInTheDocument();
  });

  it('le clic sur "Télécharger" dans le dialog déclenche le téléchargement du bon document', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DocumentsPage />);

    await user.click(await screen.findByTestId('document-versions-button-doc-1'));
    await user.click(await screen.findByTestId('document-version-download-doc-5'));

    expect(mockTelechargerReel).toHaveBeenCalledWith('doc-5');
  });
});

describe('computeDocumentVersions', () => {
  it('numérote les versions par ordre chronologique et marque la plus récente', () => {
    const result = computeDocumentVersions([
      { documentId: 'a', referenceActe: 'REF1', modeleCode: 'X', numeroDocument: 'N1', statut: 'ANNULE', genereLe: '2026-01-10' },
      { documentId: 'b', referenceActe: 'REF1', modeleCode: 'X', numeroDocument: 'N1', statut: 'VALIDE', genereLe: '2026-02-01' },
      { documentId: 'c', referenceActe: 'REF2', modeleCode: 'Y', numeroDocument: 'N2', statut: 'VALIDE', genereLe: '2026-01-01' },
    ]);

    expect(result.get('a')).toEqual({ versionIndex: 1, versionCount: 2, isLatest: false });
    expect(result.get('b')).toEqual({ versionIndex: 2, versionCount: 2, isLatest: true });
    expect(result.get('c')).toEqual({ versionIndex: 1, versionCount: 1, isLatest: true });
  });

  it('départage les dates identiques par ordre d\'origine dans le tableau', () => {
    const result = computeDocumentVersions([
      { documentId: 'a', referenceActe: 'REF1', modeleCode: 'X', numeroDocument: 'N1', statut: 'VALIDE', genereLe: '2026-01-10' },
      { documentId: 'b', referenceActe: 'REF1', modeleCode: 'X', numeroDocument: 'N1', statut: 'VALIDE', genereLe: '2026-01-10' },
    ]);

    expect(result.get('a')).toEqual({ versionIndex: 1, versionCount: 2, isLatest: false });
    expect(result.get('b')).toEqual({ versionIndex: 2, versionCount: 2, isLatest: true });
  });
});
