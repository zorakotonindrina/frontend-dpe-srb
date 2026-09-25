import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Plus } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Button } from '@/components/buttons/Button';

const meta: Meta<typeof PageHeader> = {
  title:     'Common/PageHeader',
  component: PageHeader,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Simple: Story = {
  args: { title: 'Liste des agents' },
};

export const WithDescription: Story = {
  name: 'Avec description',
  args: {
    title:       'Liste des agents',
    description: 'Gérez les agents de la fonction publique',
  },
};

export const WithBreadcrumb: Story = {
  name: 'Avec fil d\'Ariane',
  args: {
    title:       'Détail agent',
    description: 'Fiche individuelle',
    breadcrumbs: [
      { label: 'Tableau de bord', href: '/' },
      { label: 'Agents',          href: '/agents' },
      { label: 'Marie Dupont' },
    ],
  },
};

export const WithAction: Story = {
  name: 'Avec bouton d\'action',
  args: {
    title:       'Agents',
    description: 'Liste des agents de la fonction publique',
    breadcrumbs: [
      { label: 'Tableau de bord', href: '/' },
      { label: 'Agents' },
    ],
    actions: (
      <Button leadingIcon={<Plus className="h-4 w-4" />}>
        Nouvel agent
      </Button>
    ),
  },
};
