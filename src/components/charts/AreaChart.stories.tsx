import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AreaChart } from './AreaChart';

const meta: Meta<typeof AreaChart> = {
  title:     'Charts/AreaChart',
  component: AreaChart,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof AreaChart>;

const monthlyData = [
  { mois: 'Jan', Entrées: 12, Sorties: 5  },
  { mois: 'Fév', Entrées: 8,  Sorties: 7  },
  { mois: 'Mar', Entrées: 15, Sorties: 4  },
  { mois: 'Avr', Entrées: 10, Sorties: 9  },
  { mois: 'Mai', Entrées: 6,  Sorties: 11 },
  { mois: 'Jun', Entrées: 14, Sorties: 3  },
  { mois: 'Jul', Entrées: 9,  Sorties: 6  },
  { mois: 'Aoû', Entrées: 5,  Sorties: 8  },
  { mois: 'Sep', Entrées: 18, Sorties: 4  },
  { mois: 'Oct', Entrées: 11, Sorties: 7  },
  { mois: 'Nov', Entrées: 7,  Sorties: 10 },
  { mois: 'Déc', Entrées: 13, Sorties: 5  },
];

export const Simple: Story = {
  name: 'Simple (1 série)',
  args: {
    title:   'Entrées mensuelles',
    subtitle: '12 derniers mois',
    data:    monthlyData,
    areas:   [{ key: 'Entrées', label: 'Entrées' }],
    xKey:    'mois',
  },
};

export const MultiSeries: Story = {
  name: 'Multi-séries',
  args: {
    title:   'Flux d\'entrées et de sorties',
    subtitle: '12 derniers mois',
    data:    monthlyData,
    areas:   [
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
    areas:   [{ key: 'Entrées', label: 'Entrées' }],
    xKey:    'mois',
    loading: true,
  },
};
