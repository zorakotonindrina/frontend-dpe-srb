import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import NouveauVisaBcPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/useVehicules', () => ({
  useVehicules: () => ({
    data: [{ vehiculeId: 'veh-0002', vehiculeImmatriculation: '7788 TBA' }],
  }),
}));

vi.mock('@/hooks/useConstatation', () => ({
  useConstatations: () => ({
    data: [{
      constatationId: 'cst-1', referenceActe: 'CST072026002', vehiculeId: 'veh-0002',
      numeroConstat: 'CT-2026-002', dateConstat: `${new Date().getFullYear()}-03-01`,
    }],
  }),
  useConstatationPiecesRemplacer: () => ({
    data: [{ id: 'cpr-1', constatationId: 'cst-1', libelle: 'Joint de culasse' }],
  }),
  useConstatationReparations: () => ({
    data: [{ id: 'crp-1', constatationId: 'cst-1', libelle: 'Remplacement disques et plaquettes avant' }],
  }),
  useConstatationAccessoires: () => ({ data: [] }),
}));

vi.mock('@/hooks/useVisaBc', () => ({
  useCreateVisaBc: () => ({ mutateAsync: vi.fn() }),
}));

async function goToPiecesStep(user: ReturnType<typeof userEvent.setup>) {
  // Les labels des champs requis portent un "*" additionnel (span aria-hidden) inclus dans leur
  // textContent — matcher en regex partiel plutôt qu'une chaîne exacte.
  await user.click(await screen.findByLabelText(/^Véhicule/));
  await user.click(await screen.findByRole('option', { name: '7788 TBA' }));

  // Les autres champs requis de l'étape 1 doivent être remplis pour que le Stepper valide le
  // passage à l'étape suivante.
  await user.type(screen.getByLabelText(/^Numéro de BC/), 'BC-2026-099');
  await user.type(screen.getByLabelText(/^Date du BC/), '2026-06-01');
  await user.type(screen.getByLabelText(/^Fournisseur/), 'Garage Test');
  await user.type(screen.getByLabelText(/^NIF/), '1234567890');
  await user.type(screen.getByLabelText(/^STAT/), '2019 11 12345');

  await user.click(screen.getByLabelText(/^Référence PV constatation/));
  await user.click(await screen.findByRole('option', { name: /CST072026002/ }));

  await user.click(screen.getByRole('button', { name: 'Suivant' }));
}

describe('NouveauVisaBcPage — import des pièces de la constatation', () => {
  it('affiche le bouton d\'import avec le nombre de lignes disponibles une fois la constatation choisie', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouveauVisaBcPage />);

    await goToPiecesStep(user);

    const button = await screen.findByTestId('visa-bc-import-pieces-button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('2 ligne(s) disponible(s) depuis la constatation liée')).toBeInTheDocument();
  });

  it('importe les lignes de la constatation avec quantité 1 et prix unitaire 0', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouveauVisaBcPage />);

    await goToPiecesStep(user);
    await user.click(await screen.findByTestId('visa-bc-import-pieces-button'));

    expect(await screen.findByText(/Joint de culasse — 1 × 0/)).toBeInTheDocument();
    expect(screen.getByText(/Remplacement disques et plaquettes avant — 1 × 0/)).toBeInTheDocument();
  });

  it('un second import ne duplique pas les lignes déjà importées', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouveauVisaBcPage />);

    await goToPiecesStep(user);
    const importButton = await screen.findByTestId('visa-bc-import-pieces-button');
    await user.click(importButton);
    await user.click(importButton);

    expect(screen.getAllByText(/Joint de culasse/).length).toBe(1);
  });

  it('conserve une ligne ajoutée manuellement après un import', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouveauVisaBcPage />);

    await goToPiecesStep(user);
    await user.type(screen.getByTestId('visa-bc-designation-input'), 'Ligne manuelle');
    await user.click(screen.getByTestId('visa-bc-add-piece-button'));
    await user.click(await screen.findByTestId('visa-bc-import-pieces-button'));

    expect(screen.getByText(/Ligne manuelle/)).toBeInTheDocument();
    expect(screen.getByText(/Joint de culasse/)).toBeInTheDocument();
  });
});
