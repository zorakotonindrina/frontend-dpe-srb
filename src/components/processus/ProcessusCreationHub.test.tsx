import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { PROCESSUS_CODE_NEW_ROUTES } from '@/lib/constants/processus';
import { ROUTES } from '@/lib/constants/routes';
import { ProcessusCreationHub } from './ProcessusCreationHub';

const hasPermission = vi.fn<(permission: string) => boolean>();
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ hasPermission }) }));

describe('ProcessusCreationHub', () => {
  beforeEach(() => hasPermission.mockReset());

  it('mode création : une carte par processus vers son écran de création', () => {
    hasPermission.mockReturnValue(true);
    renderWithProviders(<ProcessusCreationHub />);
    expect(screen.getByTestId('processus-creation-hub')).toBeInTheDocument();
    expect(screen.getByText('Créer un nouveau dossier')).toBeInTheDocument();

    const entries = Object.entries(PROCESSUS_CODE_NEW_ROUTES);
    expect(entries.length).toBe(11);
    for (const [code, href] of entries) {
      expect(screen.getByTestId(`processus-card-${code}`)).toHaveAttribute('href', href);
    }
  });

  it('mode création : masqué sans droit d\'écriture', () => {
    hasPermission.mockReturnValue(false);
    renderWithProviders(<ProcessusCreationHub />);
    expect(screen.queryByTestId('processus-card-VA_CONDAMN')).not.toBeInTheDocument();
  });

  it('mode liste : « Liste des dossiers », chaque carte ouvre la liste du processus, même sans droit d\'écriture', () => {
    hasPermission.mockReturnValue(false);
    renderWithProviders(<ProcessusCreationHub mode="liste" />);
    expect(screen.getByText('Liste des dossiers')).toBeInTheDocument();
    expect(screen.queryByText('Créer un nouveau dossier')).not.toBeInTheDocument();

    const codes = Object.keys(PROCESSUS_CODE_NEW_ROUTES);
    for (const code of codes) {
      expect(screen.getByTestId(`processus-card-${code}`)).toHaveAttribute('href', ROUTES.DOSSIERS_LISTE(code));
    }
    expect(screen.getByTestId('processus-card-VA_CONDAMN')).toHaveAttribute('href', '/dossiers/liste?processus=VA_CONDAMN');
  });
});
