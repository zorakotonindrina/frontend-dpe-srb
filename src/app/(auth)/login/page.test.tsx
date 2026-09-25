import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import LoginPage from './page';

/* ------------------------------------------------------------------ */
/* Mocks hoistés (vi.mock est hoisted — les variables doivent l'être  */
/* aussi via vi.hoisted pour être accessibles dans les factories)      */
/* ------------------------------------------------------------------ */

const mockPush         = vi.hoisted(() => vi.fn());
const mockSearchParams = vi.hoisted(() => vi.fn(() => new URLSearchParams()));
const mockLogin        = vi.hoisted(() => vi.fn());
const mockShowToast    = vi.hoisted(() => ({
  success: vi.fn(),
  error:   vi.fn(),
  warning: vi.fn(),
  info:    vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter:       () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams(),
}));

vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: () => ({ login: (...args: unknown[]) => mockLogin(...args) }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={String(href)} {...props}>{children}</a>
  ),
}));

vi.mock('@/components/feedback/Toast', () => ({
  showToast: mockShowToast,
}));

vi.mock('@/lib/api/generic-query', () => ({
  postGenericQueryFree: vi.fn().mockResolvedValue([]),
}));

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.mockReturnValue(new URLSearchParams());
    mockLogin.mockReturnValue({ ok: true });
  });

  it('renders the login form with all interactive elements', async () => {
    renderWithProviders(<LoginPage />);

    expect(await screen.findByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('login-forgot-password-link')).toBeInTheDocument();
  });

  it('shows required error when login field is empty on submit', async () => {
    renderWithProviders(<LoginPage />);
    await screen.findByTestId('login-form');

    await userEvent.click(screen.getByTestId('login-submit-button'));

    expect(await screen.findByText('login.required')).toBeInTheDocument();
  });

  it('shows required error when password field is empty on submit', async () => {
    renderWithProviders(<LoginPage />);
    await screen.findByTestId('login-form');

    await userEvent.type(screen.getByTestId('login-email-input'), 'testuser');
    await userEvent.click(screen.getByTestId('login-submit-button'));

    expect(await screen.findByText('password.required')).toBeInTheDocument();
  });

  it('calls auth.login with credentials when form is valid', async () => {
    renderWithProviders(<LoginPage />);
    await screen.findByTestId('login-form');

    await userEvent.type(screen.getByTestId('login-email-input'), 'testuser');
    await userEvent.type(screen.getByTestId('login-password-input'), 'password123');
    await userEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('shows error toast for invalid credentials', async () => {
    mockLogin.mockReturnValue({ ok: false, code: 'INVALID_CREDENTIALS' });
    renderWithProviders(<LoginPage />);
    await screen.findByTestId('login-form');

    await userEvent.type(screen.getByTestId('login-email-input'), 'testuser');
    await userEvent.type(screen.getByTestId('login-password-input'), 'wrongpassword');
    await userEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith('errorCredentials');
    });
  });

  it('shows warning toast for disabled account', async () => {
    mockLogin.mockReturnValue({ ok: false, code: 'ACCOUNT_DISABLED' });
    renderWithProviders(<LoginPage />);
    await screen.findByTestId('login-form');

    await userEvent.type(screen.getByTestId('login-email-input'), 'testuser');
    await userEvent.type(screen.getByTestId('login-password-input'), 'password123');
    await userEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockShowToast.warning).toHaveBeenCalledWith('errorLoginDisabled');
    });
  });

  it('redirects to dashboard (ROUTES.DASHBOARD) on successful login', async () => {
    renderWithProviders(<LoginPage />);
    await screen.findByTestId('login-form');

    await userEvent.type(screen.getByTestId('login-email-input'), 'testuser');
    await userEvent.type(screen.getByTestId('login-password-input'), 'password123');
    await userEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('redirects to callbackUrl from search params on successful login', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('callbackUrl=/agents'));
    renderWithProviders(<LoginPage />);
    await screen.findByTestId('login-form');

    await userEvent.type(screen.getByTestId('login-email-input'), 'testuser');
    await userEvent.type(screen.getByTestId('login-password-input'), 'password123');
    await userEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/agents');
    });
  });
});
