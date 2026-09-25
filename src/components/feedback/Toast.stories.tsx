import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Toaster } from 'sonner';
import { showToast } from './Toast';

const meta: Meta = {
  title:     'Feedback/Toast',
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <>
        <Toaster position="top-right" richColors closeButton />
        <Story />
      </>
    ),
  ],
};
export default meta;
type Story = StoryObj;

const triggerButton = (label: string, onClick: () => void) => (
  <button
    onClick={onClick}
    className="rounded px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 border border-gray-300"
  >
    {label}
  </button>
);

export const Success: Story = {
  name: 'Succès',
  render: () => triggerButton(
    'Afficher toast succès',
    () => showToast.success('Agent créé avec succès.', 'Opération réussie'),
  ),
};

export const Error: Story = {
  name: 'Erreur',
  render: () => triggerButton(
    'Afficher toast erreur',
    () => showToast.error('Les identifiants saisis sont incorrects.', 'Erreur de connexion'),
  ),
};

export const Warning: Story = {
  name: 'Avertissement',
  render: () => triggerButton(
    'Afficher toast avertissement',
    () => showToast.warning('Cette action est irréversible.', 'Attention'),
  ),
};

export const Info: Story = {
  render: () => triggerButton(
    'Afficher toast info',
    () => showToast.info('Le module sera disponible prochainement.'),
  ),
};

export const AllVariants: Story = {
  name: 'Tous les variants',
  render: () => (
    <div className="flex flex-wrap gap-3">
      {triggerButton('Succès',      () => showToast.success('Opération réussie.'))}
      {triggerButton('Erreur',      () => showToast.error('Une erreur est survenue.'))}
      {triggerButton('Avertissement', () => showToast.warning('Attention, action irréversible.'))}
      {triggerButton('Info',        () => showToast.info('Information à consulter.'))}
    </div>
  ),
};
