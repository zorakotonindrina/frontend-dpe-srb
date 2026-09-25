import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { UserBadgeDropdown } from './UserBadgeDropdown';

const meta: Meta<typeof UserBadgeDropdown> = {
  title:     'Layout/UserBadgeDropdown',
  component: UserBadgeDropdown,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    displayName: 'RINDRAMANANAA PARSONA',
    userCode:    '391618',
    onLogout:    () => {},
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[360px] min-w-[360px] items-start justify-end bg-background p-8">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof UserBadgeDropdown>;

export const Default: Story = {
  name: 'Badge utilisateur',
};

export const Open: Story = {
  name: 'Dropdown ouvert',
  args: { defaultOpen: true },
};

export const LongNameWithoutImage: Story = {
  name: 'Nom long sans image',
  args: {
    displayName: 'RINDRAMANANAA PARSONA',
    image:       undefined,
    defaultOpen: true,
  },
};

export const SmallerUserCount: Story = {
  name: 'Compteur utilisateur',
  args: {
    displayName: 'Marie Dupont',
    userCode:    'A-204',
    defaultOpen: true,
  },
};
