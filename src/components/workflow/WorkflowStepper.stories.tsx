import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WorkflowStepper } from './WorkflowStepper';

const meta: Meta<typeof WorkflowStepper> = {
  title: 'Workflow/WorkflowStepper',
  component: WorkflowStepper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof WorkflowStepper>;

export const DepotDossier: Story = { name: 'Dépôt du dossier', args: { etapeCode: 'DEPOT_DOSSIER' } };
export const ControlePieces: Story = { name: 'Contrôle des pièces', args: { etapeCode: 'CONTROLE_PIECES' } };
export const ControlePiecesRetourne: Story = {
  name: 'Contrôle des pièces — retour pour complément',
  args: { etapeCode: 'CONTROLE_PIECES', motifRejet: 'Pièce manquante' },
};
export const TraitementTechnique: Story = { name: 'Traitement technique', args: { etapeCode: 'TRAITEMENT_TECHNIQUE' } };
export const VisaValidation: Story = { name: 'Visa / Validation', args: { etapeCode: 'VISA_VALIDATION' } };
export const VisaValidationRetourne: Story = {
  name: 'Visa / Validation — refus (ressaisie)',
  args: { etapeCode: 'VISA_VALIDATION', motifRejet: 'Devis non conforme' },
};
export const EditionLivrable: Story = { name: 'Édition du livrable', args: { etapeCode: 'EDITION_LIVRABLE' } };
export const Archivage: Story = { name: 'Archivage', args: { etapeCode: 'ARCHIVAGE' } };
export const CircuitTermine: Story = { name: 'Circuit terminé', args: { etapeCode: null } };
