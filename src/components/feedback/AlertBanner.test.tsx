import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { AlertBanner } from './AlertBanner';

describe('AlertBanner', () => {
  it('renders children content', () => {
    renderWithProviders(<AlertBanner variant="info">Message de test</AlertBanner>);
    expect(screen.getByText('Message de test')).toBeInTheDocument();
    expect(screen.getByTestId('alert-banner')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    renderWithProviders(
      <AlertBanner variant="success" title="Succès !">
        Opération réussie.
      </AlertBanner>,
    );
    expect(screen.getByText('Succès !')).toBeInTheDocument();
    expect(screen.getByText('Opération réussie.')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    renderWithProviders(<AlertBanner>Alerte</AlertBanner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not show dismiss button when dismissible is false', () => {
    renderWithProviders(<AlertBanner>Test</AlertBanner>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows dismiss button when dismissible is true', () => {
    renderWithProviders(<AlertBanner dismissible>Test</AlertBanner>);
    expect(screen.getByRole('button', { name: /fermer/i })).toBeInTheDocument();
  });

  it('hides banner after dismiss click', async () => {
    renderWithProviders(<AlertBanner dismissible>Test visible</AlertBanner>);
    expect(screen.getByTestId('alert-banner')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /fermer/i }));
    expect(screen.queryByTestId('alert-banner')).not.toBeInTheDocument();
  });

  it('calls onDismiss callback when dismissed', async () => {
    const onDismiss = vi.fn();
    renderWithProviders(
      <AlertBanner dismissible onDismiss={onDismiss}>Test</AlertBanner>,
    );
    await userEvent.click(screen.getByRole('button', { name: /fermer/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it.each(['success', 'error', 'warning', 'info'] as const)(
    'renders variant %s without error',
    (variant) => {
      renderWithProviders(<AlertBanner variant={variant}>Message</AlertBanner>);
      expect(screen.getByTestId('alert-banner')).toBeInTheDocument();
    },
  );
});
