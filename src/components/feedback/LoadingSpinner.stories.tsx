import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title:     'Feedback/LoadingSpinner',
  component: LoadingSpinner,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Small:  Story = { name: 'Petit (sm)',   args: { size: 'sm' } };
export const Medium: Story = { name: 'Moyen (md)',   args: { size: 'md' } };
export const Large:  Story = { name: 'Grand (lg)',   args: { size: 'lg' } };

export const AllSizes: Story = {
  name: 'Toutes les tailles',
  render: () => (
    <div className="flex items-center gap-6">
      <LoadingSpinner size="sm" />
      <LoadingSpinner size="md" />
      <LoadingSpinner size="lg" />
    </div>
  ),
};

export const WithLabel: Story = {
  name: 'Avec label',
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <LoadingSpinner size="md" />
      <p className="text-sm text-muted-foreground">Chargement en cours…</p>
    </div>
  ),
};
