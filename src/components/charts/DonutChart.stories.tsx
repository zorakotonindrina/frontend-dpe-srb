import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DonutChart } from './DonutChart';

const meta: Meta<typeof DonutChart> = {
  title:     'Charts/DonutChart',
  component: DonutChart,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof DonutChart>;

const gradeData = [
  { name: 'Grade A', value: 320 },
  { name: 'Grade B', value: 450 },
  { name: 'Grade C', value: 280 },
  { name: 'Grade D', value: 197 },
];

export const AvecMetrique: Story = {
  name: 'Avec métrique centrale',
  args: {
    title:       'Répartition par grade',
    subtitle:    'Effectifs totaux',
    data:        gradeData,
    centerLabel: 'Agents',
    centerValue: (320 + 450 + 280 + 197).toLocaleString('fr-FR'),
  },
};

export const SansMetrique: Story = {
  name: 'Sans métrique centrale',
  args: {
    title:    'Répartition par grade',
    subtitle: 'Effectifs totaux',
    data:     gradeData,
  },
};

export const Loading: Story = {
  name: 'Chargement',
  args: {
    title:   'Répartition par grade',
    data:    [],
    loading: true,
  },
};
