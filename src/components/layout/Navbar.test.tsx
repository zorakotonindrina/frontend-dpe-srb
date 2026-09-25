import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { Navbar } from './Navbar';

const mockPathname = vi.hoisted(() => ({ value: '/' }));
const mockLogout = vi.hoisted(() => vi.fn());
const mockRouterPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname.value,
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: () => ({
    user: {
      id:    '391618',
      name:  'RINDRAMANANAA PARSONA',
      login: 'agent',
      role:  'ADMIN',
    },
    isAuthenticated: true,
    isLoading:       false,
    logout:          mockLogout,
  }),
}));

vi.mock('@/hooks/useWorkflow', () => ({
  useWorkflowMesTaches: () => ({ data: [], isLoading: false }),
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.value = '/';
  });

  it('connects the session user to the user badge dropdown', async () => {
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByTestId('navbar-user-menu'));

    expect(await screen.findByText('RINDRAMANANAA PARSONA (391618)')).toBeInTheDocument();
    expect(screen.getByTestId('navbar-menu-administration')).toBeInTheDocument();
  });

  it('signs out from the user dropdown', async () => {
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByTestId('navbar-user-menu'));
    await userEvent.click(await screen.findByTestId('navbar-menu-logout'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });
});
