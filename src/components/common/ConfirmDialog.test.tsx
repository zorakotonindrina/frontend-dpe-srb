import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '@/components/buttons/Button';

const defaultProps = {
  open:         true,
  onOpenChange: vi.fn(),
  title:        'Confirmer la suppression',
  onConfirm:    vi.fn(),
};

describe('ConfirmDialog', () => {
  it('renders title and data-testid', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    renderWithProviders(
      <ConfirmDialog {...defaultProps} description="Cette action est irréversible." />,
    );
    expect(screen.getByText('Cette action est irréversible.')).toBeInTheDocument();
  });

  it('renders custom content and footer', () => {
    renderWithProviders(
      <ConfirmDialog
        {...defaultProps}
        testId="custom-confirm-dialog"
        footer={<Button>Valider</Button>}
      >
        <p>Contenu configurable</p>
      </ConfirmDialog>,
    );

    expect(screen.getByTestId('custom-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByText('Contenu configurable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Valider' })).toBeInTheDocument();
  });

  it('can hide the default footer with footer=null', () => {
    renderWithProviders(
      <ConfirmDialog
        {...defaultProps}
        footer={null}
      >
        <p>Sans footer</p>
      </ConfirmDialog>,
    );

    expect(screen.getByText('Sans footer')).toBeInTheDocument();
    expect(screen.queryByTestId('confirm-dialog-confirm-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('confirm-dialog-cancel-button')).not.toBeInTheDocument();
  });

  it('renders confirm and cancel buttons with data-testid', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByTestId('confirm-dialog-confirm-button')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-dialog-cancel-button')).toBeInTheDocument();
  });

  it('uses custom label for confirm button', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} confirmLabel="Supprimer" />);
    expect(screen.getByTestId('confirm-dialog-confirm-button')).toHaveTextContent('Supprimer');
  });

  it.each(['default', 'success', 'warning', 'destructive'] as const)(
    'renders the %s variant',
    (variant) => {
      renderWithProviders(
        <ConfirmDialog
          {...defaultProps}
          variant={variant}
          testId={`dialog-${variant}`}
        />,
      );

      expect(screen.getByTestId(`dialog-${variant}`)).toBeInTheDocument();
    },
  );

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByTestId('confirm-dialog-confirm-button'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onOpenChange(false) when cancel button is clicked', async () => {
    const onOpenChange = vi.fn();
    renderWithProviders(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByTestId('confirm-dialog-cancel-button'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keeps explicit footer close actions working when staticBackdrop=true', async () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Fond statique"
        staticBackdrop
        footer={(
          <Button onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
        )}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on outside click when staticBackdrop=true', async () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Fond statique"
        staticBackdrop
      />,
    );

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toBeInTheDocument();
    await userEvent.click(overlay as Element);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not render when open=false', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('disables buttons when loading=true', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} loading={true} />);
    expect(screen.getByTestId('confirm-dialog-confirm-button')).toBeDisabled();
    expect(screen.getByTestId('confirm-dialog-cancel-button')).toBeDisabled();
  });
});
