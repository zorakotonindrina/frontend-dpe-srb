import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PageTitle } from '@/components/common/PageTitle';
import { PageHeading } from '@/components/common/PageHeading';
import { SectionLabel } from '@/components/common/SectionLabel';

function TypoRow({
  label,
  className,
  text = 'République de la Réfondation de Madagascar — AUGURE',
}: {
  label: string;
  className: string;
  text?: string;
}) {
  return (
    <div className="flex items-baseline gap-6 border-b border-border py-3 last:border-0">
      <span className="w-40 shrink-0 text-xs text-muted-foreground font-mono">{label}</span>
      <p className={className}>{text}</p>
    </div>
  );
}

function TypographyPage() {
  return (
    <div className="space-y-8 p-6 bg-background min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Typographie</h1>
        <p className="text-muted-foreground text-sm mt-1">Échelle typographique Marianne — design system AUGURE</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-1">Tailles</h2>
        <div>
          <TypoRow label="text-xs / 12px"  className="text-xs text-foreground"  />
          <TypoRow label="text-sm / 14px"  className="text-sm text-foreground"  />
          <TypoRow label="text-base / 16px" className="text-base text-foreground" />
          <TypoRow label="text-lg / 18px"  className="text-lg text-foreground"  />
          <TypoRow label="text-xl / 20px"  className="text-xl text-foreground"  />
          <TypoRow label="text-2xl / 24px" className="text-2xl text-foreground" />
          <TypoRow label="text-3xl / 30px" className="text-3xl text-foreground" />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-1">Poids</h2>
        <div>
          <TypoRow label="font-normal / 400"  className="text-base font-normal text-foreground"  />
          <TypoRow label="font-medium / 500"  className="text-base font-medium text-foreground"  />
          <TypoRow label="font-semibold / 600" className="text-base font-semibold text-foreground" />
          <TypoRow label="font-bold / 700"    className="text-base font-bold text-foreground"    />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-1">Usages UI</h2>
        <div className="space-y-4">
          <div>
            <PageTitle text="Titre de page" />
            <PageHeading text="Gestion des agents" />
          </div>
          <div>
            <SectionLabel text="Titre de section" />
            <h2 className="text-lg font-semibold text-foreground">Informations personnelles</h2>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Corps de texte</p>
            <p className="text-sm text-foreground">
              L&apos;agent est affecté à la Direction des Ressources Humaines depuis le 1er janvier 2023.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Texte secondaire</p>
            <p className="text-sm text-muted-foreground">Matricule : AGT-00142 · Grade A · Catégorie 1</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Label de formulaire</p>
            <label className="text-sm font-medium text-foreground">Nom de famille <span className="text-destructive">*</span></label>
          </div>
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title:     'Foundation/Typography',
  component: TypographyPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Échelle typographique Marianne du design system AUGURE.' } },
  },
};
export default meta;
type Story = StoryObj;

export const Scale: Story = { name: 'Échelle typographique' };
