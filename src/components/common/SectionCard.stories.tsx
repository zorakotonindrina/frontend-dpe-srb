import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/buttons/Button';
import { InfoButton } from '@/components/buttons/InfoButton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SectionCard,
  SectionCardHeader,
  SectionCardTitle,
  SectionCardAction,
  SectionCardContent,
  SectionCardFooter,
} from './SectionCard';

const meta: Meta<typeof SectionCard> = {
  title: 'Common/SectionCard',
  component: SectionCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SectionCard>;

/* ================================================================
   Default
   ================================================================ */
export const Default: Story = {
  name: 'En-tête + contenu',
  render: () => (
    <SectionCard>
      <SectionCardHeader>
        <SectionCardTitle>Liste des agents</SectionCardTitle>
      </SectionCardHeader>
      <SectionCardContent>
        <p className="text-sm text-muted-foreground">
          Contenu principal de la section. Texte, formulaires, tableaux…
        </p>
      </SectionCardContent>
    </SectionCard>
  ),
};

/* ================================================================
   Avec action dans le header
   ================================================================ */
export const AvecAction: Story = {
  name: 'Avec action header',
  render: () => (
    <SectionCard>
      <SectionCardHeader>
        <SectionCardTitle>Liste des agents</SectionCardTitle>
        <SectionCardAction>
          <Button size="sm" leadingIcon={<Plus className="h-3.5 w-3.5" />}>
            Ajouter
          </Button>
        </SectionCardAction>
      </SectionCardHeader>
      <SectionCardContent>
        <p className="text-sm text-muted-foreground">
          Le slot action aligne automatiquement le contenu à droite du bandeau.
        </p>
      </SectionCardContent>
    </SectionCard>
  ),
};

/* ================================================================
   Avec pied de page
   ================================================================ */
export const AvecPied: Story = {
  name: 'Avec pied de page',
  render: () => (
    <SectionCard>
      <SectionCardHeader>
        <SectionCardTitle>Résultats de recherche</SectionCardTitle>
      </SectionCardHeader>
      <SectionCardContent>
        <p className="text-sm text-muted-foreground">Corps de la section.</p>
      </SectionCardContent>
      <SectionCardFooter>
        <span className="text-xs text-muted-foreground">42 résultats trouvés</span>
      </SectionCardFooter>
    </SectionCard>
  ),
};

/* ================================================================
   Complet — header + action + content + footer
   ================================================================ */
export const Complet: Story = {
  name: 'Complet',
  render: () => (
    <SectionCard>
      <SectionCardHeader>
        <SectionCardTitle>Gestion des postes</SectionCardTitle>
        <SectionCardAction>
          <Button size="sm" variant="outline">
            Exporter
          </Button>
          <Button size="sm" leadingIcon={<Plus className="h-3.5 w-3.5" />}>
            Nouveau poste
          </Button>
        </SectionCardAction>
      </SectionCardHeader>
      <SectionCardContent>
        <p className="text-sm text-muted-foreground">
          Contenu principal — tableau, formulaire, liste…
        </p>
      </SectionCardContent>
      <SectionCardFooter className="justify-between">
        <span className="text-xs text-muted-foreground">18 postes • Page 1 / 3</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled>
            Précédent
          </Button>
          <Button size="sm" variant="outline">
            Suivant
          </Button>
        </div>
      </SectionCardFooter>
    </SectionCard>
  ),
};

/* ================================================================
   Taille compacte (sm)
   ================================================================ */
export const TailleCompacte: Story = {
  name: 'Taille sm',
  render: () => (
    <SectionCard size="sm">
      <SectionCardHeader>
        <SectionCardTitle>Filtres actifs</SectionCardTitle>
        <SectionCardAction>
          <Button size="sm" variant="ghost" className="h-6 text-xs">
            Réinitialiser
          </Button>
        </SectionCardAction>
      </SectionCardHeader>
      <SectionCardContent>
        <p className="text-xs text-muted-foreground">
          Variant compact — padding réduit, titre en xs.
        </p>
      </SectionCardContent>
    </SectionCard>
  ),
};

/* ================================================================
   Formulaire de recherche — réplique de la capture écran
   ================================================================ */
export const FormulaireRecherche: Story = {
  name: 'Formulaire de recherche',
  render: () => (
    <SectionCard>
      <SectionCardHeader>
        <SectionCardTitle>Formulaire de recherche</SectionCardTitle>
      </SectionCardHeader>
      <SectionCardContent>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-foreground/70">Recherche par:</label>
            <Select defaultValue="nom-prenom">
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nom-prenom">Nom / prénom</SelectItem>
                <SelectItem value="matricule">Matricule</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-foreground/70">
              Nom(s) et/ou Prénom(s):
            </label>
            <Input
              placeholder="Nom ou prénom"
              className="w-72"
            />
          </div>

          <InfoButton
            fullWidth={false}
            icon={<Search className="h-4 w-4" />}
          >
            Rechercher
          </InfoButton>
        </div>
      </SectionCardContent>
    </SectionCard>
  ),
};

/* ================================================================
   Liste avec tableau mock
   ================================================================ */
export const ListeAvecTableau: Story = {
  name: 'Liste avec tableau',
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <SectionCard>
      <SectionCardHeader>
        <SectionCardTitle>Agents — Direction des Ressources Humaines</SectionCardTitle>
        <SectionCardAction>
          <Button size="sm" leadingIcon={<Plus className="h-3.5 w-3.5" />}>
            Nouvel agent
          </Button>
        </SectionCardAction>
      </SectionCardHeader>
      <SectionCardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Nom
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Prénom
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Service
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { nom: 'Martin', prenom: 'Sophie', service: 'DRH', statut: 'Actif' },
              { nom: 'Dupont', prenom: 'Jean', service: 'DSI', statut: 'Actif' },
              { nom: 'Bernard', prenom: 'Chloé', service: 'DAF', statut: 'Congé' },
            ].map((row, i) => (
              <tr
                key={i}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-2.5 font-medium">{row.nom}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.prenom}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.service}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
                    {row.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCardContent>
      <SectionCardFooter>
        <span className="text-xs text-muted-foreground">3 agents affichés</span>
      </SectionCardFooter>
    </SectionCard>
  ),
};

/* ================================================================
   Skeleton — état de chargement
   ================================================================ */
export const SkeletonLoading: Story = {
  name: 'Chargement (skeleton)',
  render: () => (
    <SectionCard>
      <SectionCardHeader>
        <SectionCardTitle>
          <Skeleton className="h-4 w-40" />
        </SectionCardTitle>
      </SectionCardHeader>
      <SectionCardContent className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </SectionCardContent>
    </SectionCard>
  ),
};
