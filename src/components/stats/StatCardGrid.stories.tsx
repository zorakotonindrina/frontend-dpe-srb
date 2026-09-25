import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Users, Briefcase, TrendingUp, BarChart3 } from 'lucide-react';
import { StatCardGrid } from './StatCardGrid';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCardGrid> = {
  title:     'Stats/StatCardGrid',
  component: StatCardGrid,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof StatCardGrid>;

const cards = [
  { slug: 'effectifs',      title: 'Effectifs totaux',   value: 1247, icon: <Users className="h-5 w-5" />,     trend: { value: 3.2, unit: '%', label: 'vs N-1' } },
  { slug: 'postes-vacants', title: 'Postes vacants',      value: 34,   icon: <Briefcase className="h-5 w-5" />, trend: { value: -5,  unit: '%', label: 'vs N-1' } },
  { slug: 'mouvements',     title: 'Mouvements/mois',     value: 18,   icon: <TrendingUp className="h-5 w-5" /> },
  { slug: 'taux',           title: 'Taux d\'occupation',  value: 97,   unit: '%', icon: <BarChart3 className="h-5 w-5" />, trend: { value: 1.5, unit: 'pt', label: 'vs mois dernier' } },
];

export const QuatreColonnes: Story = {
  name: '4 colonnes',
  render: () => (
    <StatCardGrid columns={4}>
      {cards.map((c) => <StatCard key={c.slug} {...c} />)}
    </StatCardGrid>
  ),
};

export const TroisColonnes: Story = {
  name: '3 colonnes',
  render: () => (
    <StatCardGrid columns={3}>
      {cards.slice(0, 3).map((c) => <StatCard key={c.slug} {...c} />)}
    </StatCardGrid>
  ),
};

export const DeuxColonnes: Story = {
  name: '2 colonnes',
  render: () => (
    <StatCardGrid columns={2}>
      {cards.slice(0, 2).map((c) => <StatCard key={c.slug} {...c} />)}
    </StatCardGrid>
  ),
};

export const Loading: Story = {
  name: 'Chargement',
  render: () => <StatCardGrid columns={4} loading>{null}</StatCardGrid>,
};
