import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthProvider } from '@/providers/AuthProvider';
import { Sidebar } from './Sidebar';
import { AUGURE_MENU, AUGURE_BOTTOM_MENU, type NavItem } from '@/lib/constants/nav-items';

/* ------------------------------------------------------------------ */
/* Mock session                                                        */
/* ------------------------------------------------------------------ */

const mockUser = {
  id: '000001', name: 'Marie Dupont', login: 'marie.dupont', role: 'ADMIN' as const,
};

const WithSession = ({ children }: { children: React.ReactNode }) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('dpe-srb-auth-session', JSON.stringify(mockUser));
  }
  return <AuthProvider>{children}</AuthProvider>;
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof Sidebar> = {
  title:     'Layout/Sidebar',
  component: Sidebar,
  tags:      ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/agents/informations' } },
  },
  args: {
    menu:       AUGURE_MENU,
    bottomMenu: AUGURE_BOTTOM_MENU,
  },
  decorators: [
    (Story) => (
      <WithSession>
        <div className="flex h-screen bg-background">
          <Story />
          <main className="flex-1 p-6 bg-muted/30">
            <p className="text-muted-foreground text-sm">Zone de contenu principale</p>
          </main>
        </div>
      </WithSession>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

/* ------------------------------------------------------------------ */
/* Stories                                                             */
/* ------------------------------------------------------------------ */

export const Normal: Story = {
  name: 'Normal (étendu)',
  parameters: {
    nextjs: { navigation: { pathname: '/' } },
  },
};

export const WithOpenGroup: Story = {
  name: 'Groupe ouvert — Gestion des agents',
  parameters: {
    nextjs: { navigation: { pathname: '/agents/informations' } },
  },
};

export const ActiveSubItem: Story = {
  name: 'Sous-item actif — Suivi de dossiers',
  parameters: {
    nextjs: { navigation: { pathname: '/dossiers/suivi' } },
  },
};

export const ActiveSectionItem: Story = {
  name: 'Item actif — Section Assistance managériale',
  parameters: {
    nextjs: { navigation: { pathname: '/poste-budgetaire' } },
  },
};

export const ActiveBottomItem: Story = {
  name: 'Item bas actif — Guide de formation',
  parameters: {
    nextjs: { navigation: { pathname: '/guide-formation' } },
  },
};

export const ForceCollapsed: Story = {
  name: 'Replié',
  args: { forceCollapsed: true },
  parameters: {
    nextjs: { navigation: { pathname: '/' } },
  },
};

export const CollapsedActiveGroup: Story = {
  name: 'Replié — sous-menu au survol',
  args: { forceCollapsed: true },
  parameters: {
    nextjs: { navigation: { pathname: '/agents/informations' } },
  },
};

export const MobileSheet: Story = {
  name: 'Mobile (Sheet)',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [
    (Story) => (
      <WithSession>
        <div className="flex h-screen bg-background">
          <Story />
          <main className="flex-1 p-6 bg-muted/30">
            <p className="text-muted-foreground text-sm">
              Sur mobile, la sidebar est remplacée par un Sheet drawer
            </p>
          </main>
        </div>
      </WithSession>
    ),
  ],
};

export const CustomMenu: Story = {
  name: 'Menu personnalisé (minimal)',
  args: {
    menu: [
      {
        labelKey: 'dashboard',
        href:     '/',
        icon:     (AUGURE_MENU.find((e) => !('type' in e) && (e as NavItem).labelKey === 'dashboard') as NavItem).icon,
        segment:  '',
      },
    ],
    bottomMenu: [],
  },
};
