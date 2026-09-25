import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Search, AlertCircle } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/buttons/Button';

const meta: Meta<typeof EmptyState> = {
  title:     'Feedback/EmptyState',
  component: EmptyState,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-md mx-auto border rounded-lg"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  name: 'Table vide',
};

export const RechercheVide: Story = {
  name: 'Aucun résultat de recherche',
  args: {
    icon:        <Search className="h-8 w-8" />,
    title:       'Aucun résultat',
    description: 'Aucun agent ne correspond à vos critères de recherche. Essayez de modifier vos filtres.',
  },
};

export const Erreur500: Story = {
  name: 'Erreur serveur (500)',
  args: {
    icon:        <AlertCircle className="h-8 w-8" />,
    title:       'Une erreur est survenue',
    description: 'Impossible de charger les données. Veuillez réessayer ou contacter le support.',
    action: (
      <Button onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    ),
  },
};

export const AvecAction: Story = {
  name: 'Avec bouton d\'action',
  args: {
    title:       'Aucun agent trouvé',
    description: 'Commencez par créer votre premier agent.',
    action: <Button>Nouvel agent</Button>,
  },
};
