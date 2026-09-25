import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import type { Dossier, DossiersParams } from '@/lib/api/dossiers';
import TraitementDossierPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Les API appellent le vrai backend : on simule les hooks (données de test) plutôt qu'un serveur HTTP.
const dossier = (referenceActe: string, processusCode: string, dossierDateDepot: string, etapeCode: Dossier['etapeCode']): Dossier => ({
  idDossier: referenceActe, referenceActe, typeActe: referenceActe.slice(0, 3), processusCode, ministereCode: '21',
  dossierDateDepot, dossierMotif: 'Test', statut: etapeCode ? 'EN_TRAITEMENT_TECHNIQUE' : 'CLOTURE', etapeCode,
});
const DOSSIERS: Dossier[] = [
  dossier('VBC072026007', 'VA_VISA_BC', '2026-06-18', 'CONTROLE_PIECES'),
  dossier('CST072026002', 'VA_CONSTAT', '2026-06-10', 'TRAITEMENT_TECHNIQUE'),
  dossier('REC072026001', 'VA_RECENS', '2026-06-01', null),
];

vi.mock('@/hooks/useDossiers', () => ({
  useDossiers: (params?: DossiersParams) => ({
    data: params?.search ? DOSSIERS.filter((d) => d.referenceActe.includes(params.search!)) : DOSSIERS,
    isLoading: false,
  }),
  useDossier: (reference: string) => ({ data: DOSSIERS.find((d) => d.referenceActe === reference), isLoading: false }),
}));
vi.mock('@/hooks/useVehicules', () => ({ useVehicules: () => ({ data: [] }) }));
vi.mock('@/hooks/useReferentiels', () => ({ useMinisteres: () => ({ data: [{ minCode: '21', libelle: 'Ministère des Finances' }] }) }));

describe('TraitementDossierPage — recherche avancée (liste)', () => {
  it('search panel is closed by default and toggles open', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TraitementDossierPage />);

    expect(screen.queryByTestId('dossiers-search-form')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('dossiers-search-toggle-button'));
    expect(screen.getByTestId('dossiers-search-form')).toBeInTheDocument();
  });

  it('narrows results by reference and reset restores the full list', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TraitementDossierPage />);

    await waitFor(() => expect(screen.getByText('VBC072026007')).toBeInTheDocument());

    await user.click(screen.getByTestId('dossiers-search-toggle-button'));
    await user.type(screen.getByTestId('form-field-reference-input'), 'REC072026001');
    await user.click(screen.getByTestId('dossiers-search-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('REC072026001')).toBeInTheDocument();
      expect(screen.queryByText('VBC072026007')).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId('dossiers-search-reset-button'));

    await waitFor(() => expect(screen.getByText('VBC072026007')).toBeInTheDocument());
  });
});

describe('TraitementDossierPage — recherche par référence unique', () => {
  it('shows a not-found message for an unknown reference', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TraitementDossierPage />);

    await user.type(screen.getByTestId('traitement-dossier-search-input'), 'INCONNU0000');
    await user.click(screen.getByTestId('traitement-dossier-search-button'));

    await waitFor(() => expect(screen.getByTestId('traitement-dossier-not-found')).toBeInTheDocument());
  });

  it('shows the dossier row and a Traiter button for a known reference', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TraitementDossierPage />);

    await user.type(screen.getByTestId('traitement-dossier-search-input'), 'CST072026002');
    await user.click(screen.getByTestId('traitement-dossier-search-button'));

    await waitFor(() => expect(screen.getByTestId('traitement-dossier-result-row')).toBeInTheDocument());
    expect(screen.getByTestId('traitement-dossier-traiter-button')).toBeInTheDocument();
  });

  it('shows no Traiter button once the circuit is finished', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TraitementDossierPage />);

    await user.type(screen.getByTestId('traitement-dossier-search-input'), 'REC072026001');
    await user.click(screen.getByTestId('traitement-dossier-search-button'));

    await waitFor(() => expect(screen.getByTestId('traitement-dossier-result-row')).toBeInTheDocument());
    expect(screen.queryByTestId('traitement-dossier-traiter-button')).not.toBeInTheDocument();
  });
});
