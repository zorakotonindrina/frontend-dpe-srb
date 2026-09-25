import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AlertBanner } from './AlertBanner';

const meta: Meta<typeof AlertBanner> = {
  title:     'Feedback/AlertBanner',
  component: AlertBanner,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Success: Story = {
  args: {
    variant:  'success',
    title:    'Opération réussie',
    children: 'L\'agent a été créé avec succès.',
  },
};

export const Error: Story = {
  name: 'Erreur',
  args: {
    variant:  'error',
    title:    'Erreur de validation',
    children: 'Les identifiants saisis sont incorrects. Veuillez réessayer.',
  },
};

export const Warning: Story = {
  name: 'Avertissement',
  args: {
    variant:  'warning',
    title:    'Attention',
    children: 'Cette action est irréversible. Assurez-vous de vouloir continuer.',
  },
};

export const Info: Story = {
  args: {
    variant:  'info',
    children: 'Le module de gestion des absences sera disponible prochainement.',
  },
};

export const Dismissible: Story = {
  name: 'Fermable',
  args: {
    variant:     'info',
    title:       'Information',
    children:    'Cliquez sur la croix pour fermer cette notification.',
    dismissible: true,
  },
};

export const AllVariants: Story = {
  name: 'Tous les variants',
  render: () => (
    <div className="space-y-3 max-w-xl">
      <AlertBanner variant="success" title="Succès">Agent créé avec succès.</AlertBanner>
      <AlertBanner variant="error"   title="Erreur">Identifiants incorrects.</AlertBanner>
      <AlertBanner variant="warning" title="Attention">Action irréversible.</AlertBanner>
      <AlertBanner variant="info">Module bientôt disponible.</AlertBanner>
    </div>
  ),
};
