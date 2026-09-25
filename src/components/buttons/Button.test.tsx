import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plus } from 'lucide-react';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { Button }  from './Button';
import { LoadingButton } from './LoadingButton';
import { IconButton }    from './IconButton';
import { ToggleButton }  from './ToggleButton';
import { EnvoyerButton, LoginButton } from './AuthButton';

/* ================================================================
   Button
   ================================================================ */
describe('Button', () => {
  it('renders children', () => {
    renderWithProviders(<Button>Enregistrer</Button>);
    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
  });

  it('forwards data-testid', () => {
    renderWithProviders(<Button testId="action-btn">OK</Button>);
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    renderWithProviders(<Button disabled>Désactivé</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    renderWithProviders(<Button onClick={onClick}>Cliquer</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    renderWithProviders(<Button disabled onClick={onClick}>Désactivé</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders leadingIcon', () => {
    renderWithProviders(
      <Button leadingIcon={<Plus data-testid="icon" />}>Ajouter</Button>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders trailingIcon', () => {
    renderWithProviders(
      <Button trailingIcon={<Plus data-testid="trailing-icon" />}>Voir</Button>,
    );
    expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
  });
});

/* ================================================================
   LoadingButton
   ================================================================ */
describe('LoadingButton', () => {
  it('renders normally when not loading', () => {
    renderWithProviders(<LoadingButton loading={false}>Sauvegarder</LoadingButton>);
    const btn = screen.getByRole('button');
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveTextContent('Sauvegarder');
    expect(btn).toHaveAttribute('aria-busy', 'false');
  });

  it('is disabled and shows spinner when loading', () => {
    renderWithProviders(<LoadingButton loading={true}>Sauvegarder</LoadingButton>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('shows loadingText when loading and loadingText is set', () => {
    renderWithProviders(
      <LoadingButton loading={true} loadingText="Envoi…">Envoyer</LoadingButton>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('Envoi…');
  });

  it('shows children text when loading and no loadingText', () => {
    renderWithProviders(<LoadingButton loading={true}>Envoyer</LoadingButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Envoyer');
  });
});

/* ================================================================
   AuthButton
   ================================================================ */
describe('AuthButton', () => {
  it('keeps its background color while loading', () => {
    renderWithProviders(
      <LoginButton loading>Connexion en cours</LoginButton>,
    );

    const btn = screen.getByRole('button', { name: /connexion en cours/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveStyle({ backgroundColor: '#1e3461' });
    expect(btn).toHaveClass('text-white');
  });

  it('keeps envoyer button readable while loading', () => {
    renderWithProviders(
      <EnvoyerButton loading>Envoi en cours...</EnvoyerButton>,
    );

    const btn = screen.getByRole('button', { name: /envoi en cours/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveStyle({ backgroundColor: '#17a589' });
    expect(btn).toHaveClass('text-white');
  });
});

/* ================================================================
   IconButton
   ================================================================ */
describe('IconButton', () => {
  it('renders with aria-label', () => {
    renderWithProviders(
      <IconButton icon={<Plus />} aria-label="Ajouter un agent" />,
    );
    expect(screen.getByRole('button', { name: /ajouter un agent/i })).toBeInTheDocument();
  });

  it('forwards data-testid', () => {
    renderWithProviders(
      <IconButton icon={<Plus />} aria-label="Ajouter" testId="icon-btn" />,
    );
    expect(screen.getByTestId('icon-btn')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    renderWithProviders(
      <IconButton icon={<Plus />} aria-label="Ajouter" disabled />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('title defaults to aria-label', () => {
    renderWithProviders(
      <IconButton icon={<Plus />} aria-label="Modifier l'agent" />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Modifier l\'agent');
  });
});

/* ================================================================
   ToggleButton
   ================================================================ */
describe('ToggleButton', () => {
  it('renders with aria-pressed=false when not pressed', () => {
    renderWithProviders(
      <ToggleButton pressed={false} onPressedChange={() => {}}>Filtre</ToggleButton>,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders with aria-pressed=true when pressed', () => {
    renderWithProviders(
      <ToggleButton pressed={true} onPressedChange={() => {}}>Filtre actif</ToggleButton>,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onPressedChange with toggled value on click', async () => {
    const onPressedChange = vi.fn();
    renderWithProviders(
      <ToggleButton pressed={false} onPressedChange={onPressedChange}>Toggle</ToggleButton>,
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it('does not call onPressedChange when disabled', async () => {
    const onPressedChange = vi.fn();
    renderWithProviders(
      <ToggleButton pressed={false} onPressedChange={onPressedChange} disabled>
        Désactivé
      </ToggleButton>,
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(onPressedChange).not.toHaveBeenCalled();
  });
});
