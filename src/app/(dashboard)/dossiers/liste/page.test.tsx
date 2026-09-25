import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import type { Dossier } from '@/lib/api/dossiers';
import ListeDossiersProcessusPage from './page';

const push = vi.fn();
let processus: string | null = 'VA_CONDAMN';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(processus ? { processus } : {}),
}));

const dossier = (referenceActe: string, processusCode: string, statut: Dossier['statut']): Dossier => ({
  idDossier: referenceActe, referenceActe, typeActe: 'CDN', processusCode, ministereCode: '21',
  dossierDateDepot: '2026-09-15', dossierMotif: 'Test', statut, etapeCode: null,
});
const useDossiers = vi.fn();
vi.mock('@/hooks/useDossiers', () => ({ useDossiers: (params?: unknown) => useDossiers(params) }));
vi.mock('@/hooks/useReferentiels', () => ({ useMinisteres: () => ({ data: [{ minCode: '21', libelle: 'Ministère des Finances' }] }) }));

describe('ListeDossiersProcessusPage', () => {
  beforeEach(() => {
    push.mockReset();
    useDossiers.mockReset();
    processus = 'VA_CONDAMN';
    useDossiers.mockReturnValue({ data: [dossier('CDN092026001', 'VA_CONDAMN', 'EN_VALIDATION')], isLoading: false });
  });

  it('demande les dossiers du processus et les affiche avec leur statut', () => {
    renderWithProviders(<ListeDossiersProcessusPage />);
    expect(useDossiers).toHaveBeenCalledWith({ processusCode: 'VA_CONDAMN' });
    expect(screen.getByText('CDN092026001')).toBeInTheDocument();
    expect(screen.getByText('En validation')).toBeInTheDocument();
    expect(screen.getByTestId('liste-dossiers-retour-button')).toBeInTheDocument();
  });

  it('ouvre le dossier en mode consultation au clic sur une ligne', async () => {
    renderWithProviders(<ListeDossiersProcessusPage />);
    await userEvent.setup().click(screen.getByText('CDN092026001'));
    expect(push).toHaveBeenCalledWith('/dossiers/detail?reference=CDN092026001&mode=consultation');
  });

  it('signale un processus inconnu sans interroger la liste complète comme un processus', () => {
    processus = 'INCONNU';
    useDossiers.mockReturnValue({ data: [], isLoading: false });
    renderWithProviders(<ListeDossiersProcessusPage />);
    expect(screen.getByTestId('liste-dossiers-processus-inconnu')).toBeInTheDocument();
  });
});
