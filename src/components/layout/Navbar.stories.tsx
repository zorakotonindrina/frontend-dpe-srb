import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import type { WfProcessusActiviteTache } from '@/types/workflow.types';
import { Navbar } from './Navbar';

/* ------------------------------------------------------------------ */
/* Mock sessions                                                       */
/* ------------------------------------------------------------------ */

const mockUser = {
  id: '000001', name: 'Marie Dupont', login: 'marie.dupont', role: 'ADMIN' as const,
};

/**
 * Navbar appelle useWorkflowMesTaches() (React Query) — aucun QueryClientProvider ni MSW n'est
 * configuré globalement dans Storybook (.storybook/preview.tsx), donc chaque story doit fournir
 * le sien. On pré-remplit directement le cache pour la clé de requête réelle plutôt que de mocker
 * le hook ou d'ajouter un prop réservé aux tests : la story exerce ainsi le vrai composant, sans
 * jamais déclencher de requête réseau qui échouerait dans l'environnement Storybook.
 */
function makeQueryClient(taches: WfProcessusActiviteTache[] = []) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(QUERY_KEYS.workflow.mesTaches(), taches);
  return client;
}

const WithSession = ({
  children,
  taches = [],
}: {
  children: React.ReactNode;
  taches?: WfProcessusActiviteTache[];
}) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('dpe-srb-auth-session', JSON.stringify(mockUser));
  }
  return (
    <QueryClientProvider client={makeQueryClient(taches)}>
      <AuthProvider>
        <div className="bg-background">
          {children}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const FIXTURE_TACHES: WfProcessusActiviteTache[] = [
  { processusCode: 'VA_RECENS', activiteCode: 'ACT_1', tacheAFaire: 'TRAITEMENT_TECHNIQUE', dateDebut: '2026-06-01', dateFin: null, referenceActe: 'REC072026001', detenteur: null, rang: 1 },
  { processusCode: 'VA_VISA_BC', activiteCode: 'ACT_1', tacheAFaire: 'VISA_VALIDATION', dateDebut: '2026-06-02', dateFin: null, referenceActe: 'VBC072026003', detenteur: null, rang: 1 },
  { processusCode: 'VA_EXPERTISE', activiteCode: 'ACT_1', tacheAFaire: 'CONTROLE_PIECES', dateDebut: '2026-06-03', dateFin: null, referenceActe: 'EXP072026008', detenteur: null, rang: 1 },
  { processusCode: 'VA_CONDAMN', activiteCode: 'ACT_1', tacheAFaire: 'TRAITEMENT_TECHNIQUE', dateDebut: '2026-06-04', dateFin: null, referenceActe: 'CDN072026009', detenteur: null, rang: 1 },
  { processusCode: 'VA_TEST_CHAUF', activiteCode: 'ACT_1', tacheAFaire: 'EDITION_LIVRABLE', dateDebut: '2026-06-05', dateFin: null, referenceActe: 'TCH072026010', detenteur: null, rang: 1 },
  { processusCode: 'VA_RECENS', activiteCode: 'ACT_2', tacheAFaire: 'VISA_VALIDATION', dateDebut: '2026-06-06', dateFin: null, referenceActe: 'REC072026011', detenteur: null, rang: 2 },
];

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof Navbar> = {
  title:     'Layout/Navbar',
  component: Navbar,
  tags:      ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/agents' } },
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
type Story = StoryObj<typeof Navbar>;

/* ------------------------------------------------------------------ */
/* Stories                                                             */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  name: 'Avec utilisateur',
  args: { onMobileMenuOpen: () => alert('Menu mobile ouvert') },
};

export const WithNotifications: Story = {
  name: 'Avec badge notifications',
  decorators: [
    (Story) => (
      <WithSession taches={FIXTURE_TACHES}>
        <Story />
      </WithSession>
    ),
  ],
  args: {
    onMobileMenuOpen: () => {},
  },
};

export const Mobile: Story = {
  name: 'Vue mobile',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: { onMobileMenuOpen: () => alert('Menu mobile ouvert') },
};
