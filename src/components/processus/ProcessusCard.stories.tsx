import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ShieldAlert } from 'lucide-react';
import { ProcessusCard } from './ProcessusCard';

const meta: Meta<typeof ProcessusCard> = {
  title: 'Processus/ProcessusCard',
  component: ProcessusCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ProcessusCard>;

export const Default: Story = {
  args: {
    code: 'VA_EXPERTISE',
    title: 'Expertise',
    description: "Déclarer une expertise après accident et son estimation des dommages",
    href: '/processus/expertise/nouveau',
    icon: ShieldAlert,
  },
};

export const SansDescription: Story = {
  args: {
    code: 'VA_TEST_CHAUF',
    title: 'Test chauffeur',
    href: '/processus/test-chauffeur/nouveau',
    icon: ShieldAlert,
  },
};
