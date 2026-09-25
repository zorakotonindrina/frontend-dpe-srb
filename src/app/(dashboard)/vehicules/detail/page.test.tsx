import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { vehiculesFixtures } from '@/lib/fixtures/vehicules.fixtures';
import { mouvementsVehiculeFixtures } from '@/lib/fixtures/vehiculeMouvements.fixtures';
import VehiculeDetailPage from './page';

/* ------------------------------------------------------------------ */
/* Mocks hoistés — on isole cette page du réseau réel (vehiculesApi,   */
/* dossiersApi, referentielsApi, et désormais vehiculeMouvementsApi    */
/* appellent tous un vrai backend HTTP) pour ne tester que le rendu du */
/* nouvel onglet Historique, en mockant chaque hook comme les autres   */
/* hooks déjà réels de ce fichier.                                     */
/* ------------------------------------------------------------------ */

const mockSearchParams = vi.hoisted(() => vi.fn(() => new URLSearchParams('id=veh-0005')));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => mockSearchParams(),
}));

vi.mock('@/hooks/useVehicules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useVehicules')>();
  return {
    ...actual,
    useVehicule: () => ({ data: vehiculesFixtures[4], isLoading: false }),
    useDeleteVehicule: () => ({ mutate: vi.fn(), isPending: false }),
    useVehiculeHistorique: (vehiculeId: string) => ({
      data: mouvementsVehiculeFixtures
        .filter((m) => m.vehiculeId === vehiculeId)
        .sort((a, b) => b.dateMouvement.localeCompare(a.dateMouvement)), // même tri que l'API réelle
    }),
  };
});

vi.mock('@/hooks/useDossiers', () => ({
  useDossiers: () => ({ data: [] }),
}));

vi.mock('@/hooks/useReferentiels', () => ({
  useMinisteres: () => ({ data: [{ minCode: 'MIN-BUD', libelle: 'Ministère du Budget et des Comptes Publics' }] }),
  useEtatsVehicule: () => ({ data: [{ etatVehicule: 'MOYEN', libelle: 'Moyen état' }, { etatVehicule: 'HS', libelle: 'Hors service' }] }),
  useEtatsGeneralConstate: () => ({ data: [{ etatGeneralCode: '1', libelle: 'En marche' }, { etatGeneralCode: '2', libelle: 'En panne' }] }),
}));

describe('VehiculeDetailPage — onglet Historique', () => {
  it('affiche la frise des mouvements du véhicule (le plus récent en premier)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VehiculeDetailPage />);

    await user.click(await screen.findByTestId('vehicule-tab-historique'));
    const panel = await screen.findByTestId('vehicule-historique-panel');
    expect(panel).toBeInTheDocument();

    // veh-0005 (données de seed) a 4 mouvements : AFFECTATION, RECENSEMENT, CHANGEMENT_ETAT, CONDAMNATION
    expect(await screen.findByTestId('vehicule-mouvement-mvt-0009')).toBeInTheDocument();
    expect(screen.getByTestId('vehicule-mouvement-mvt-0012')).toBeInTheDocument();
    expect(screen.getByTestId('vehicule-mouvement-mvt-0010')).toBeInTheDocument();
    expect(screen.getByTestId('vehicule-mouvement-mvt-0011')).toBeInTheDocument();

    // Tri du plus récent au plus ancien : la Condamnation (2026-01-20) apparaît avant l'Affectation (2008-07-01)
    const rows = panel.querySelectorAll('li');
    expect(rows[0]).toHaveAttribute('data-testid', 'vehicule-mouvement-mvt-0011');
    expect(rows[rows.length - 1]).toHaveAttribute('data-testid', 'vehicule-mouvement-mvt-0009');

    expect(screen.getByText('Condamnation')).toBeInTheDocument();
  });

  it('affiche le recensement (STRUCTURE, détenteur, état général) et les états en toutes lettres', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VehiculeDetailPage />);

    await user.click(await screen.findByTestId('vehicule-tab-historique'));

    const recensement = await screen.findByTestId('vehicule-mouvement-mvt-0012');
    expect(recensement).toHaveTextContent('Recensement');
    expect(recensement).toHaveTextContent('Recensé pour 2025');
    expect(recensement).toHaveTextContent('STRUCTURE 3-100-200 — DRPE Analamanga');
    expect(recensement).toHaveTextContent('Détenteur : RAZAFY Mamy');
    expect(recensement).toHaveTextContent('État général : En marche');
    expect(recensement).toHaveTextContent('Catégorie : Service');

    // Changement d'état du véhicule : libellés du référentiel, plus les codes bruts « MOYEN → HS »
    expect(screen.getByTestId('vehicule-mouvement-mvt-0010')).toHaveTextContent('Moyen état → Hors service');
  });

  it("affiche le message d'état vide pour un véhicule sans mouvement enregistré", async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('id=veh-9999-sans-historique'));
    const user = userEvent.setup();
    renderWithProviders(<VehiculeDetailPage />);

    // useVehicule est mocké pour renvoyer toujours veh-0005 (le composant ne dépend que de `vehicule`
    // pour ne pas afficher "Véhicule introuvable." ici) ; seul l'id de useVehiculeHistorique change.
    await user.click(await screen.findByTestId('vehicule-tab-historique'));
    const panel = await screen.findByTestId('vehicule-historique-panel');
    expect(panel).toHaveTextContent('Aucun mouvement enregistré pour ce véhicule.');
  });
});
