import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthProvider } from '@/providers/AuthProvider';
import ForgotPasswordPage from '@/app/(auth)/mot-de-passe-oublie/page';

const meta: Meta<typeof ForgotPasswordPage> = {
  title:     'Pages/Auth/ForgotPassword',
  component: ForgotPasswordPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/mot-de-passe-oublie',
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
type Story = StoryObj<typeof ForgotPasswordPage>;

export const Demande: Story = {
  name: 'Formulaire mot de passe oublie',
};
