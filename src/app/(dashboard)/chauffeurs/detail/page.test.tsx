import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import ChauffeurDetailPage from './page';

/* ------------------------------------------------------------------ */
/* Mocks hoistés — contrairement à l'historique véhicule (module 1),   */
/* chauffeursApi/chauffeurTestApi tapent tous les deux un vrai backend */
/* HTTP : on mocke donc les trois hooks de données pour isoler ce test */
/* du réseau, plutôt que de laisser tourner un mock store local.       */
/* ------------------------------------------------------------------ */

const mockSearchParams = vi.hoisted(() => vi.fn(() => new URLSearchParams('id=ch-1')));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => mockSearchParams(),
}));

vi.mock('@/hooks/useChauffeurs', () => ({
  useChauffeurs: () => ({
    data: [
      { chauffeurId: 'ch-1', nom: 'RAKOTOVAO Faniry', matricule: '000002', cin: '101012345678', permis: 'PC-2019-4521', minCode: 'MIN-FIN', soaCode: 'SRB-ALA' },
      { chauffeurId: 'ch-2', nom: 'ANDRIA Tojo', matricule: '000003', cin: '101023456789', permis: 'PC-2021-8890', minCode: 'MIN-FIN', soaCode: 'BSCVA' },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useChauffeurTest', () => ({
  useChauffeurTests: () => ({
    data: [
      {
        testId: 'tch-1', referenceActe: 'TCH072026010', chauffeurId: 'ch-1', vehiculeId: 'veh-0004',
        dateTest: '2026-06-15', examinateurNom: 'RAKOTO Herimanana', observations: 'RAS',
        resultat: 'APTE', statut: 'LIVRABLE_GENERE',
      },
    ],
  }),
}));

vi.mock('@/hooks/useReferentiels', () => ({
  useMinisteres: () => ({ data: [{ minCode: 'MIN-FIN', libelle: "Ministère de l'Économie et des Finances" }] }),
}));

describe('ChauffeurDetailPage — onglet Tests', () => {
  it('affiche la liste des tests du chauffeur, avec le résultat', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChauffeurDetailPage />);

    await user.click(await screen.findByTestId('chauffeur-tab-tests'));
    const panel = await screen.findByTestId('chauffeur-tests-panel');
    expect(panel).toBeInTheDocument();
    expect(await screen.findByTestId('chauffeur-test-tch-1')).toBeInTheDocument();
    expect(screen.getByText('Apte')).toBeInTheDocument();
  });

  it("affiche le message d'état vide pour un chauffeur sans test enregistré", async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('id=ch-2'));
    const user = userEvent.setup();
    renderWithProviders(<ChauffeurDetailPage />);

    await user.click(await screen.findByTestId('chauffeur-tab-tests'));
    const panel = await screen.findByTestId('chauffeur-tests-panel');
    expect(panel).toHaveTextContent('Aucun test enregistré pour ce chauffeur.');
  });
});
