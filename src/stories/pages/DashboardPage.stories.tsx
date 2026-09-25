import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthProvider } from '@/providers/AuthProvider';
import DashboardPage from '@/app/(dashboard)/page';

const mockUser = {
  id: '000001', name: 'Marie Dupont', login: 'marie.dupont', role: 'ADMIN' as const,
};

const WithSession = ({ children }: { children: React.ReactNode }) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('dpe-srb-auth-session', JSON.stringify(mockUser));
  }
  return <AuthProvider>{children}</AuthProvider>;
};

const meta: Meta<typeof DashboardPage> = {
  title:     'Pages/Dashboard',
  component: DashboardPage,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/' } },
  },
  decorators: [
    (Story) => (
      <WithSession>
        <Story />
      </WithSession>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DashboardPage>;

export const VueComplète: Story = {
  name: 'Vue complète (KPI + charts + mouvements)',
};
