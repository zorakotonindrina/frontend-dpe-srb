import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Users, Briefcase, ArrowRight } from 'lucide-react';
import { StatCard, StatCardSkeleton } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title:     'Stats/StatCard',
  component: StatCard,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    slug:  'agents',
    title: 'Total agents',
    value: 1247,
  },
};
export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  name: 'Valeur seule',
};

export const WithIcon: Story = {
  name: 'Avec icône',
  args: {
    icon: <Users className="h-5 w-5" />,
  },
};

export const TrendPositif: Story = {
  name: 'Tendance positive',
  args: {
    icon:  <Users className="h-5 w-5" />,
    trend: { value: 12, unit: '%', label: 'vs mois dernier' },
  },
};

export const TrendNegatif: Story = {
  name: 'Tendance négative',
  args: {
    title: 'Postes vacants',
    value: 34,
    slug:  'postes-vacants',
    icon:  <Briefcase className="h-5 w-5" />,
    trend: { value: -8, unit: '%', label: 'vs mois dernier' },
  },
};

export const TrendNeutre: Story = {
  name: 'Tendance neutre',
  args: {
    icon:  <Users className="h-5 w-5" />,
    trend: { value: 0, unit: '%', label: 'stable' },
  },
};

export const Cliquable: Story = {
  name: 'Carte cliquable',
  args: {
    icon: <Users className="h-5 w-5" />,
    href: '/agents',
    trend: { value: 5, unit: '%', label: 'vs mois dernier' },
  },
};

export const Skeleton: Story = {
  name: 'Chargement (skeleton)',
  render: () => <div className="w-72"><StatCardSkeleton /></div>,
};
