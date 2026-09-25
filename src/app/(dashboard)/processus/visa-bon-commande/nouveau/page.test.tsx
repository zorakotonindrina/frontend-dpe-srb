import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
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
  // Les lignes ne sont proposées qu'une fois la constatation choisie (identifiant non vide).
  useConstatationPiecesRemplacer: (constatationId: string) => ({
    data: constatationId ? [{ id: 'cpr-1', constatationId, libelle: 'Joint de culasse' }] : [],
  }),
  useConstatationReparations: (constatationId: string) => ({
    data: constatationId ? [{ id: 'crp-1', constatationId, libelle: 'Remplacement disques et plaquettes avant' }] : [],
  }),
  useConstatationAccessoires: () => ({ data: [] }),
}));

vi.mock('@/hooks/useVisaBc', () => ({
  useCreateVisaBc: () => ({ mutateAsync: vi.fn() }),
}));

async function remplirEtape1(user: ReturnType<typeof userEvent.setup>, avecConstatation = true) {
  // Les labels des champs requis portent un "*" additionnel (span aria-hidden) inclus dans leur
  // textContent — matcher en regex partiel plutôt qu'une chaîne exacte.
  await user.click(await screen.findByLabelText(/^Véhicule/));
  await user.click(await screen.findByRole('option', { name: '7788 TBA' }));

  await user.type(screen.getByLabelText(/^Numéro de BC/), 'BC-2026-099');
  await user.type(screen.getByLabelText(/^Date du BC/), '2026-06-01');
  await user.type(screen.getByLabelText(/^Fournisseur/), 'Garage Test');
  await user.type(screen.getByLabelText(/^NIF/), '1234567890');
  await user.type(screen.getByLabelText(/^STAT/), '2019 11 12345');

  if (avecConstatation) {
    await user.click(screen.getByLabelText(/^Référence PV constatation/));
    await user.click(await screen.findByRole('option', { name: /CST072026002/ }));
  }

  await user.click(screen.getByRole('button', { name: 'Suivant' }));
}

async function ajouterLigne(user: ReturnType<typeof userEvent.setup>, libelle: string) {
  await user.click(await screen.findByTestId('visa-bc-designation-select'));
  await user.click(await screen.findByRole('option', { name: libelle }));
  await user.click(screen.getByTestId('visa-bc-add-piece-button'));
}

describe('NouveauVisaBcPage — lignes du BC issues de la constatation liée', () => {
  it('propose en liste déroulante les pièces et réparations de la constatation choisie', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouveauVisaBcPage />);

    await remplirEtape1(user);
    await user.click(await screen.findByTestId('visa-bc-designation-select'));

    expect(await screen.findByRole('option', { name: 'Joint de culasse' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Remplacement disques et plaquettes avant' })).toBeInTheDocument();
  });

  it('ajoute la ligne choisie avec quantité 1 et prix unitaire 0, puis ne la propose plus', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouveauVisaBcPage />);

    await remplirEtape1(user);
    await ajouterLigne(user, 'Joint de culasse');

    const table = within(await screen.findByTestId('visa-bc-pieces-table'));
    expect(table.getByText('Joint de culasse')).toBeInTheDocument();
    expect(table.getByTestId('visa-bc-piece-prix-0')).toHaveValue(0);

    await user.click(screen.getByTestId('visa-bc-designation-select'));
    expect(await screen.findByRole('option', { name: 'Remplacement disques et plaquettes avant' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Joint de culasse' })).not.toBeInTheDocument();
  });

  it('recalcule le montant total quand on saisit le prix unitaire dans le tableau', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouveauVisaBcPage />);

    await remplirEtape1(user);
    await ajouterLigne(user, 'Joint de culasse');

    const prix = await screen.findByTestId('visa-bc-piece-prix-0');
    await user.clear(prix);
    await user.type(prix, '150000');

    expect(screen.getByText(/Montant : 150\s000/)).toBeInTheDocument();
  });

  it('désactive la liste tant qu’aucune constatation n’est liée', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouveauVisaBcPage />);

    await remplirEtape1(user, false);

    expect(await screen.findByTestId('visa-bc-designation-select')).toBeDisabled();
    expect(screen.getByText('Aucune pièce disponible depuis la constatation liée.')).toBeInTheDocument();
    expect(screen.getByTestId('visa-bc-add-piece-button')).toBeDisabled();
  });
});
