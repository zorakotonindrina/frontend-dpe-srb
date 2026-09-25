import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { NotificationsDropdown } from './NotificationsDropdown';
import type { WfProcessusActiviteTache } from '@/types/workflow.types';

const mockPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function tache(referenceActe: string, rang: number): WfProcessusActiviteTache {
  return {
    processusCode: 'VA_RECENS',
    activiteCode: 'ACT_1',
    tacheAFaire: 'TRAITEMENT_TECHNIQUE',
    dateDebut: '2026-06-01',
    dateFin: null,
    referenceActe,
    detenteur: null,
    rang,
  };
}

describe('NotificationsDropdown', () => {
  it("affiche l'état vide quand aucune tâche n'est en attente", async () => {
    renderWithProviders(<NotificationsDropdown taches={[]} />);

    await userEvent.click(screen.getByTestId('navbar-notifications-button'));

    expect(await screen.findByTestId('navbar-notifications-empty')).toBeInTheDocument();
  });

  it('affiche les tâches en attente avec le badge de processus et la date', async () => {
    const taches = [tache('REC072026001', 1), tache('REC072026002', 1)];
    renderWithProviders(<NotificationsDropdown taches={taches} />);

    await userEvent.click(screen.getByTestId('navbar-notifications-button'));

    expect(await screen.findByTestId('navbar-notification-REC072026001-1')).toBeInTheDocument();
    expect(screen.getByTestId('navbar-notification-REC072026002-1')).toBeInTheDocument();
    expect(screen.getAllByText('Recensement').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Traitement technique').length).toBe(2);
    expect(screen.queryByTestId('navbar-notifications-view-all')).not.toBeInTheDocument();
  });

  it('plafonne la liste à 5 éléments et affiche le lien "voir tout" au-delà', async () => {
    const taches = Array.from({ length: 7 }, (_, i) => tache(`REC07202600${i}`, 1));
    renderWithProviders(<NotificationsDropdown taches={taches} />);

    await userEvent.click(screen.getByTestId('navbar-notifications-button'));

    expect(await screen.findByTestId('navbar-notification-REC072026000-1')).toBeInTheDocument();
    expect(screen.getByTestId('navbar-notification-REC072026004-1')).toBeInTheDocument();
    expect(screen.queryByTestId('navbar-notification-REC072026005-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('navbar-notifications-view-all')).toBeInTheDocument();
  });

  it('navigue vers le dossier au clic sur une tâche', async () => {
    renderWithProviders(<NotificationsDropdown taches={[tache('REC072026001', 1)]} />);

    await userEvent.click(screen.getByTestId('navbar-notifications-button'));
    await userEvent.click(await screen.findByTestId('navbar-notification-REC072026001-1'));

    expect(mockPush).toHaveBeenCalledWith('/dossiers/detail?reference=REC072026001');
  });

  it('affiche le badge de comptage avec le nombre total de tâches (plafonné à 9+)', () => {
    const taches = Array.from({ length: 12 }, (_, i) => tache(`REC07202600${i}`, 1));
    renderWithProviders(<NotificationsDropdown taches={taches} />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });
});
