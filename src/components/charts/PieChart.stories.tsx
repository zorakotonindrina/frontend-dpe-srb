import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PieChart } from './PieChart';

const meta: Meta<typeof PieChart> = {
  title:     'Charts/PieChart',
  component: PieChart,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof PieChart>;

const gradeData = [
  { name: 'Grade A', value: 320 },
  { name: 'Grade B', value: 450 },
  { name: 'Grade C', value: 280 },
  { name: 'Grade D', value: 197 },
];

export const Simple: Story = {
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
