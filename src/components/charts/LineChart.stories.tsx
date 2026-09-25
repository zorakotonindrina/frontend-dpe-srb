import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LineChart } from './LineChart';

const meta: Meta<typeof LineChart> = {
  title:     'Charts/LineChart',
  component: LineChart,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof LineChart>;

const monthlyData = [
  { mois: 'Jan', Entrées: 12, Sorties: 5,  Effectifs: 1200 },
  { mois: 'Fév', Entrées: 8,  Sorties: 7,  Effectifs: 1201 },
  { mois: 'Mar', Entrées: 15, Sorties: 4,  Effectifs: 1212 },
  { mois: 'Avr', Entrées: 10, Sorties: 9,  Effectifs: 1213 },
  { mois: 'Mai', Entrées: 6,  Sorties: 11, Effectifs: 1208 },
  { mois: 'Jun', Entrées: 14, Sorties: 3,  Effectifs: 1219 },
  { mois: 'Jul', Entrées: 9,  Sorties: 6,  Effectifs: 1222 },
  { mois: 'Aoû', Entrées: 5,  Sorties: 8,  Effectifs: 1219 },
  { mois: 'Sep', Entrées: 18, Sorties: 4,  Effectifs: 1233 },
  { mois: 'Oct', Entrées: 11, Sorties: 7,  Effectifs: 1237 },
  { mois: 'Nov', Entrées: 7,  Sorties: 10, Effectifs: 1234 },
  { mois: 'Déc', Entrées: 13, Sorties: 5,  Effectifs: 1242 },
];

export const UneLigne: Story = {
  name: '1 ligne',
  args: {
    title:  'Évolution des effectifs',
    subtitle: '12 derniers mois',
    data:   monthlyData,
    lines:  [{ key: 'Effectifs', label: 'Effectifs' }],
    xKey:   'mois',
  },
};

export const MultiLignes: Story = {
  name: 'Multi-lignes',
  args: {
    title:   'Flux mensuels',
    subtitle: 'Entrées et sorties',
    data:    monthlyData,
    lines:   [
      { key: 'Entrées', label: 'Entrées' },
      { key: 'Sorties', label: 'Sorties' },
    ],
    xKey: 'mois',
  },
};

export const Loading: Story = {
  name: 'Chargement',
  args: {
    title:   'Flux mensuels',
    data:    [],
    lines:   [{ key: 'Entrées', label: 'Entrées' }],
    xKey:    'mois',
    loading: true,
  },
};
