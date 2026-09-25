import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { Stepper } from './Stepper';
import { StepperIndicator } from './StepperIndicator';
import { StepperStep } from './StepperStep';
import { StepperNav } from './StepperNav';
import type { StepConfig } from './stepper.types';

/* ------------------------------------------------------------------ */
/* Fixtures                                                             */
/* ------------------------------------------------------------------ */

const STEPS: StepConfig[] = [
  { id: 'identite',    title: 'Identité',    description: 'Infos personnelles' },
  { id: 'affectation', title: 'Affectation', description: 'Poste et direction' },
  { id: 'confirmation',title: 'Confirmation' },
];

function TestStepper({
  onComplete = vi.fn(),
  initialStep = 0,
}: {
  onComplete?: () => void;
  initialStep?: number;
}) {
  return (
    <Stepper steps={STEPS} onComplete={onComplete} initialStep={initialStep}>
      <StepperIndicator />
      <StepperStep stepIndex={0}>
        <p>Contenu étape 1</p>
      </StepperStep>
      <StepperStep stepIndex={1}>
        <p>Contenu étape 2</p>
      </StepperStep>
      <StepperStep stepIndex={2}>
        <p>Contenu étape 3</p>
      </StepperStep>
      <StepperNav />
    </Stepper>
  );
}

/* ================================================================
   Rendu des étapes
   ================================================================ */
describe('Stepper — rendu', () => {
  it('affiche le contenu de la première étape', () => {
    renderWithProviders(<TestStepper />);
    expect(screen.getByText('Contenu étape 1')).toBeInTheDocument();
    expect(screen.queryByText('Contenu étape 2')).not.toBeInTheDocument();
  });

  it("affiche l'indicateur de progression", () => {
    renderWithProviders(<TestStepper />);
    expect(screen.getByTestId('stepper-indicator')).toBeInTheDocument();
  });

  it('affiche tous les data-testid stepper-step-N', () => {
    renderWithProviders(<TestStepper />);
    expect(screen.getByTestId('stepper-step-0')).toBeInTheDocument();
    expect(screen.getByTestId('stepper-step-1')).toBeInTheDocument();
    expect(screen.getByTestId('stepper-step-2')).toBeInTheDocument();
  });

  it('désactive le bouton Précédent à la première étape', () => {
    renderWithProviders(<TestStepper />);
    expect(screen.getByTestId('stepper-prev-button')).toBeDisabled();
  });

  it('affiche le bouton Suivant à la première étape', () => {
    renderWithProviders(<TestStepper />);
    expect(screen.getByTestId('stepper-next-button')).toBeInTheDocument();
  });

  it('affiche le bouton Soumettre à la dernière étape', () => {
    renderWithProviders(<TestStepper initialStep={2} />);
    expect(screen.getByTestId('stepper-submit-button')).toBeInTheDocument();
    expect(screen.queryByTestId('stepper-next-button')).not.toBeInTheDocument();
  });
});

/* ================================================================
   Navigation
   ================================================================ */
describe('Stepper — navigation', () => {
  it("avance à l'étape suivante en cliquant Suivant", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestStepper />);

    await user.click(screen.getByTestId('stepper-next-button'));

    expect(screen.getByText('Contenu étape 2')).toBeInTheDocument();
    expect(screen.queryByText('Contenu étape 1')).not.toBeInTheDocument();
  });

  it("revient à l'étape précédente en cliquant Précédent", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestStepper />);

    await user.click(screen.getByTestId('stepper-next-button'));
    await user.click(screen.getByTestId('stepper-prev-button'));

    expect(screen.getByText('Contenu étape 1')).toBeInTheDocument();
  });

  it('appelle onComplete en cliquant Soumettre', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithProviders(<TestStepper initialStep={2} onComplete={onComplete} />);

    await user.click(screen.getByTestId('stepper-submit-button'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledOnce();
    });
  });

  it("navigue jusqu'à la dernière étape et soumet", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithProviders(<TestStepper onComplete={onComplete} />);

    await user.click(screen.getByTestId('stepper-next-button'));
    await user.click(screen.getByTestId('stepper-next-button'));

    expect(screen.getByTestId('stepper-submit-button')).toBeInTheDocument();
    await user.click(screen.getByTestId('stepper-submit-button'));
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  });
});

/* ================================================================
   StepperIndicator — aria-current
   ================================================================ */
describe('StepperIndicator', () => {
  it('marque l\'étape courante avec aria-current="step"', () => {
    renderWithProviders(<TestStepper />);
    const step0Btn = screen.getByTestId('stepper-step-0').querySelector('button');
    expect(step0Btn).toHaveAttribute('aria-current', 'step');
  });

  it("n'a pas aria-current sur les étapes non courantes", () => {
    renderWithProviders(<TestStepper />);
    const step1Btn = screen.getByTestId('stepper-step-1').querySelector('button');
    expect(step1Btn).not.toHaveAttribute('aria-current', 'step');
  });
});
