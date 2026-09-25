import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/tests/renderWithProviders';
import DossiersPage from './page';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ hasPermission: () => true }) }));

describe('DossiersPage', () => {
  it('renders the processus creation hub and no dossier list/search', () => {
    renderWithProviders(<DossiersPage />);

    expect(screen.getByTestId('dossiers-page')).toBeInTheDocument();
    expect(screen.getByTestId('processus-creation-hub')).toBeInTheDocument();

    expect(screen.queryByTestId('dossiers-search-toggle-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dossiers-new-button')).not.toBeInTheDocument();
  });
});
