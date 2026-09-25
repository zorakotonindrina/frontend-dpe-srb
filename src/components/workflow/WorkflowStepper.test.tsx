import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { WorkflowStepper } from './WorkflowStepper';

describe('WorkflowStepper', () => {
  it('renders the 6 generic step labels and the container testid', () => {
    renderWithProviders(<WorkflowStepper etapeCode="TRAITEMENT_TECHNIQUE" />);
    expect(screen.getByTestId('workflow-stepper')).toBeInTheDocument();
    expect(screen.getAllByText('Dépôt du dossier').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contrôle des pièces').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Traitement technique').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Visa / Validation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Édition du livrable').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Archivage').length).toBeGreaterThan(0);
  });

  it.each([
    [null, undefined, 'workflow-stepper-step-DEPOT_DOSSIER', 'terminée'],
    ['DEPOT_DOSSIER', undefined, 'workflow-stepper-step-DEPOT_DOSSIER', 'en cours'],
    ['CONTROLE_PIECES', undefined, 'workflow-stepper-step-DEPOT_DOSSIER', 'terminée'],
    ['CONTROLE_PIECES', undefined, 'workflow-stepper-step-CONTROLE_PIECES', 'en cours'],
    ['CONTROLE_PIECES', 'Pièce manquante', 'workflow-stepper-step-CONTROLE_PIECES', 'retournée pour complément'],
    ['ARCHIVAGE', undefined, 'workflow-stepper-step-ARCHIVAGE', 'en cours'],
    [null, undefined, 'workflow-stepper-step-ARCHIVAGE', 'terminée'],
  ] as const)('etapeCode=%s motifRejet=%s → %s a un aria-label contenant "%s"', (etapeCode, motifRejet, testId, suffix) => {
    renderWithProviders(<WorkflowStepper etapeCode={etapeCode} motifRejet={motifRejet} />);
    const node = screen.getByTestId(testId).querySelector('[aria-label]');
    expect(node).toHaveAttribute('aria-label', expect.stringContaining(suffix));
  });
});
