import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import NouveauTestChauffeurPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/useChauffeurs', () => ({
  useChauffeurs: () => ({
    data: [{ chauffeurId: 'ch-1', nom: 'RAKOTOVAO Faniry', matricule: '000002', cin: '101012345678', permis: 'PC-2019-4521', minCode: 'MIN-FIN', soaCode: 'SRB-ALA' }],
  }),
}));

vi.mock('@/hooks/useVehicules', () => ({
  useVehicules: () => ({ data: [{ vehiculeId: 'veh-0004', vehiculeImmatriculation: '3005 HRA' }] }),
}));

const mockMutateAsync = vi.hoisted(() => vi.fn().mockResolvedValue({ referenceActe: 'TCH072026099', testId: 'tch-99' }));

vi.mock('@/hooks/useChauffeurTest', () => ({
  useCreateChauffeurTest: () => ({ mutateAsync: mockMutateAsync }),
}));

describe('NouveauTestChauffeurPage — notes théorique/pratique', () => {
  it('affiche les champs note théorique et note pratique, et pas de champ observation', async () => {
    renderWithProviders(<NouveauTestChauffeurPage />);

    expect(await screen.findByLabelText(/^Note théorique/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Note pratique/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Observations/)).not.toBeInTheDocument();
  });

  it('soumet le formulaire avec les notes renseignées', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NouveauTestChauffeurPage />);

    await user.click(await screen.findByLabelText(/^Chauffeur/));
    await user.click(await screen.findByRole('option', { name: 'RAKOTOVAO Faniry' }));
    await user.type(screen.getByLabelText(/^Date du test/), '2026-06-20');
    await user.type(screen.getByLabelText(/^Examinateur/), 'RAKOTO Herimanana');

    const noteTheorique = screen.getByLabelText(/^Note théorique/);
    await user.clear(noteTheorique);
    await user.type(noteTheorique, '16');
    const notePratique = screen.getByLabelText(/^Note pratique/);
    await user.clear(notePratique);
    await user.type(notePratique, '15');

    await user.click(screen.getByRole('button', { name: 'Suivant' }));
    await user.click(await screen.findByRole('button', { name: 'Enregistrer' }));

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ noteTheorique: 16, notePratique: 15 }),
    );
  });
});
