import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import type { Dossier } from '@/lib/api/dossiers';
import ListeDossiersProcessusPage from './page';

const push = vi.fn();
let processus: string | null = 'VA_CONDAMN';
let vue: string | null = null;
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams({ ...(processus ? { processus } : {}), ...(vue ? { vue } : {}) }),
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
    vue = null;
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

  it('vue « en cours » : tous processus, sans les dossiers clos, en consultation', async () => {
    processus = null;
    vue = 'en-cours';
    useDossiers.mockReturnValue({
      data: [
        dossier('CDN092026001', 'VA_CONDAMN', 'EN_VALIDATION'),
        dossier('REC092026004', 'VA_RECENS', 'EN_CONTROLE'),
        dossier('CST092026002', 'VA_CONSTAT', 'CLOTURE'),
      ],
      isLoading: false,
    });
    renderWithProviders(<ListeDossiersProcessusPage />);

    expect(useDossiers).toHaveBeenCalledWith({});
    expect(screen.getByText('Dossiers en cours — tous processus')).toBeInTheDocument();
    expect(screen.getByText('CDN092026001')).toBeInTheDocument();
    expect(screen.getByText('REC092026004')).toBeInTheDocument();
    expect(screen.queryByText('CST092026002')).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByText('REC092026004'));
    expect(push).toHaveBeenCalledWith('/dossiers/detail?reference=REC092026004&mode=consultation');
  });
});
