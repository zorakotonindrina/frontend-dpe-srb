import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BarChart } from './BarChart';

const meta: Meta<typeof BarChart> = {
  title:     'Charts/BarChart',
  component: BarChart,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof BarChart>;

const directionData = [
  { direction: 'DRH',     Recrutements: 14, Départs: 8 },
  { direction: 'DSI',     Recrutements: 9,  Départs: 5 },
  { direction: 'DAF',     Recrutements: 7,  Départs: 6 },
  { direction: 'DJSEC',   Recrutements: 12, Départs: 4 },
  { direction: 'DGAAPEP', Recrutements: 5,  Départs: 3 },
];

export const Vertical: Story = {
  name: 'Vertical (default)',
  args: {
    title:   'Recrutements par direction',
    subtitle: 'Cumul annuel',
    data:    directionData,
    bars:    [{ key: 'Recrutements', label: 'Recrutements' }],
    xKey:    'direction',
  },
};

export const MultiBarres: Story = {
  name: 'Multi-barres',
  args: {
    title:   'Recrutements et départs par direction',
    subtitle: 'Cumul annuel',
    data:    directionData,
    bars:    [
      { key: 'Recrutements', label: 'Recrutements' },
      { key: 'Départs',      label: 'Départs' },
    ],
    xKey:    'direction',
  },
};

export const Horizontal: Story = {
  name: 'Horizontal',
  args: {
    title:   'Recrutements par direction',
    subtitle: 'Cumul annuel',
    data:    directionData,
    bars:    [{ key: 'Recrutements', label: 'Recrutements' }],
    xKey:    'direction',
    layout:  'horizontal',
  },
};

export const Loading: Story = {
  name: 'Chargement',
  args: {
    title:   'Recrutements par direction',
    data:    [],
    bars:    [{ key: 'Recrutements', label: 'Recrutements' }],
    xKey:    'direction',
    loading: true,
  },
};
