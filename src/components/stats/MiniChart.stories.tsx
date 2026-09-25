import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Users } from 'lucide-react';
import { MiniChart } from './MiniChart';
import { StatCard } from './StatCard';

const meta: Meta<typeof MiniChart> = {
  title:     'Stats/MiniChart',
  component: MiniChart,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-64 p-4 border rounded-lg bg-card">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof MiniChart>;

const data = [
  { label: 'Jan', value: 120 },
  { label: 'Fév', value: 135 },
  { label: 'Mar', value: 128 },
  { label: 'Avr', value: 142 },
  { label: 'Mai', value: 155 },
  { label: 'Jun', value: 148 },
];

export const Default: Story = {
  args: { data },
};

export const CustomColor: Story = {
  name: 'Couleur personnalisée',
  args: {
    data,
    color: 'var(--color-feedback-success)',
  },
};

export const InStatCard: Story = {
  name: 'Dans une StatCard',
  render: () => (
    <div className="w-72">
      <StatCard
        slug="effectifs"
        title="Effectifs"
        value={1247}
        icon={<Users className="h-5 w-5" />}
        trend={{ value: 3.2, unit: '%', label: 'vs N-1' }}
      >
        <MiniChart data={data} />
      </StatCard>
    </div>
  ),
};
