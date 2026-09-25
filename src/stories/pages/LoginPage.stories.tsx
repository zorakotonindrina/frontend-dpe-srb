import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthProvider } from '@/providers/AuthProvider';
import LoginPage from '@/app/(auth)/login/page';

const meta: Meta<typeof LoginPage> = {
  title:     'Pages/Auth/Login',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/login',
        query:    {},
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Connexion: Story = {
  name: 'Formulaire de connexion',
};
