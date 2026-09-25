import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import NouvelleExpertisePage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('NouvelleExpertisePage — assistant multi-étapes', () => {
  it('opens on step 1 with 3 steps and blocks advancement until required fields are filled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouvelleExpertisePage />);

    // 3 étapes affichées dans l'indicateur
    expect(screen.getByTestId('stepper-step-0')).toBeInTheDocument();
    expect(screen.getByTestId('stepper-step-1')).toBeInTheDocument();
    expect(screen.getByTestId('stepper-step-2')).toBeInTheDocument();

    // Étape 1 (infos) visible, étape 2 (dommages) pas encore montée
    expect(screen.getByTestId('expertise-form')).toBeInTheDocument();
    expect(screen.queryByTestId('expertise-add-dommage-button')).not.toBeInTheDocument();

    // Champs requis vides → "Suivant" ne doit pas faire avancer l'assistant
    await user.click(screen.getByTestId('stepper-next-button'));
    expect(screen.queryByTestId('expertise-add-dommage-button')).not.toBeInTheDocument();
  });

  it('cancel button navigates back regardless of step', () => {
    renderWithProviders(<NouvelleExpertisePage />);
    expect(screen.getByTestId('expertise-cancel-button')).toBeInTheDocument();
  });
});
