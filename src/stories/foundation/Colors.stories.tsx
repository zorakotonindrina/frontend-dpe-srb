import type { Meta, StoryObj } from '@storybook/nextjs-vite';

/* ------------------------------------------------------------------ */
/* Palette swatch générique                                            */
/* ------------------------------------------------------------------ */

function ColorSwatch({ variable, label }: { variable: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-12 w-full rounded-md border border-border shadow-sm"
        style={{ background: `var(${variable})` }}
        title={variable}
      />
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground font-mono">{variable}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground border-b border-border pb-1">{title}</h2>
      <div className="grid grid-cols-5 gap-3">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Story                                                               */
/* ------------------------------------------------------------------ */

function ColorsPage() {
  return (
    <div className="space-y-8 p-6 bg-background min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Palette de couleurs</h1>
        <p className="text-muted-foreground text-sm mt-1">Tokens CSS du design system AUGURE</p>
      </div>

      <Section title="Marque (Brand)">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => (
          <ColorSwatch key={n} variable={`--color-brand-${n}`} label={`Brand ${n}`} />
        ))}
      </Section>

      <Section title="Statuts RH">
        <ColorSwatch variable="--color-status-active"       label="Actif" />
        <ColorSwatch variable="--color-status-inactive"     label="Inactif" />
        <ColorSwatch variable="--color-status-pending"      label="En attente" />
        <ColorSwatch variable="--color-status-suspended"    label="Suspendu" />
      </Section>

      <Section title="Statuts RH — Fonds">
        <ColorSwatch variable="--color-status-active-bg"    label="Actif BG" />
        <ColorSwatch variable="--color-status-inactive-bg"  label="Inactif BG" />
        <ColorSwatch variable="--color-status-pending-bg"   label="En attente BG" />
        <ColorSwatch variable="--color-status-suspended-bg" label="Suspendu BG" />
      </Section>

      <Section title="Feedback">
        <ColorSwatch variable="--color-feedback-success" label="Success" />
        <ColorSwatch variable="--color-feedback-warning" label="Warning" />
        <ColorSwatch variable="--color-feedback-error"   label="Error" />
        <ColorSwatch variable="--color-feedback-info"    label="Info" />
      </Section>

      <Section title="Feedback — Fonds">
        <ColorSwatch variable="--color-feedback-success-bg" label="Success BG" />
        <ColorSwatch variable="--color-feedback-warning-bg" label="Warning BG" />
        <ColorSwatch variable="--color-feedback-error-bg"   label="Error BG" />
        <ColorSwatch variable="--color-feedback-info-bg"    label="Info BG" />
      </Section>

      <Section title="Charts">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <ColorSwatch key={n} variable={`--color-chart-${n}`} label={`Chart ${n}`} />
        ))}
      </Section>

      <Section title="Interface">
        <ColorSwatch variable="--color-background"      label="Background" />
        <ColorSwatch variable="--color-foreground"      label="Foreground" />
        <ColorSwatch variable="--color-border"          label="Border" />
        <ColorSwatch variable="--color-muted"           label="Muted" />
        <ColorSwatch variable="--color-muted-foreground" label="Muted FG" />
      </Section>
    </div>
  );
}

const meta: Meta = {
  title:  'Foundation/Colors',
  component: ColorsPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Palette complète des tokens CSS couleur du design system AUGURE.' } },
  },
};
export default meta;
type Story = StoryObj;

export const AllColors: Story = { name: 'Palette complète' };
