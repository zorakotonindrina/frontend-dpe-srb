import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title:     'Common/Avatar',
  component: Avatar,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
  args: { name: 'Marie Dupont' },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {
  name: 'Initiales (sans photo)',
  args: { name: 'Marie Dupont' },
};

export const WithPhoto: Story = {
  name: 'Avec photo',
  args: {
    name: 'Marie Dupont',
    src:  'https://i.pravatar.cc/150?img=47',
  },
};

export const Sizes: Story = {
  name: 'Toutes les tailles',
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Marie Dupont" size="sm" />
      <Avatar name="Marie Dupont" size="md" />
      <Avatar name="Marie Dupont" size="lg" />
    </div>
  ),
};

export const Initials2: Story = {
  name: 'Initiales variées',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Jean Martin" />
      <Avatar name="Sophie Bernard" />
      <Avatar name="Ahmed Toure" />
      <Avatar name="Chloé Lefebvre" />
      <Avatar name="Pierre Dubois" />
    </div>
  ),
};
