import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { UserBadgeDropdown } from './UserBadgeDropdown';
import type { UserRole } from '@/types/auth.types';

const sessionMock = vi.hoisted(() => ({ role: 'ADMIN' as UserRole | undefined }));

vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: () => ({ user: sessionMock.role ? { role: sessionMock.role } : null }),
}));

function renderDropdown(onLogout = vi.fn()) {
  renderWithProviders(
    <UserBadgeDropdown
      displayName="RINDRAMANANAA PARSONA"
      userCode="391618"
      onLogout={onLogout}
    />,
  );
}

describe('UserBadgeDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionMock.role = 'ADMIN';
  });

  it('opens from the user badge and shows the base menu entries', async () => {
    renderDropdown();

    await userEvent.click(screen.getByTestId('navbar-user-menu'));

    expect(await screen.findByText('RINDRAMANANAA PARSONA (391618)')).toBeInTheDocument();
    expect(screen.getByTestId('navbar-menu-profile')).toHaveTextContent('Profil');
    expect(screen.getByTestId('navbar-menu-contact')).toHaveTextContent('Contact');
    expect(screen.getByTestId('navbar-menu-logout')).toHaveTextContent('Se déconnecter');
  });

  it('shows the administration link for a role with administration:write', async () => {
    sessionMock.role = 'ADMIN';
    renderDropdown();

    await userEvent.click(screen.getByTestId('navbar-user-menu'));

    expect(await screen.findByTestId('navbar-menu-administration')).toBeInTheDocument();
  });

  it('hides the administration link for a role without administration:write', async () => {
    sessionMock.role = 'AGENT_SAISIE';
    renderDropdown();

    await userEvent.click(screen.getByTestId('navbar-user-menu'));

    await screen.findByTestId('navbar-menu-profile');
    expect(screen.queryByTestId('navbar-menu-administration')).not.toBeInTheDocument();
  });

  it('hides the administration link when the session has no role', async () => {
    sessionMock.role = undefined;
    renderDropdown();

    await userEvent.click(screen.getByTestId('navbar-user-menu'));

    await screen.findByTestId('navbar-menu-profile');
    expect(screen.queryByTestId('navbar-menu-administration')).not.toBeInTheDocument();
  });

  it('calls the injected logout callback', async () => {
    const onLogout = vi.fn();
    renderDropdown(onLogout);

    await userEvent.click(screen.getByTestId('navbar-user-menu'));
    await userEvent.click(await screen.findByTestId('navbar-menu-logout'));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
