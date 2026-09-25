import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const SPACING = [
  { token: 'space-1',  px: '4px',  rem: '0.25rem' },
  { token: 'space-2',  px: '8px',  rem: '0.5rem'  },
  { token: 'space-3',  px: '12px', rem: '0.75rem' },
  { token: 'space-4',  px: '16px', rem: '1rem'    },
  { token: 'space-5',  px: '20px', rem: '1.25rem' },
  { token: 'space-6',  px: '24px', rem: '1.5rem'  },
  { token: 'space-8',  px: '32px', rem: '2rem'    },
  { token: 'space-10', px: '40px', rem: '2.5rem'  },
  { token: 'space-12', px: '48px', rem: '3rem'    },
  { token: 'space-16', px: '64px', rem: '4rem'    },
];

function SpacingPage() {
  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Espacement</h1>
        <p className="text-muted-foreground text-sm mt-1">Grille de base 8px — design system AUGURE</p>
      </div>

      <div className="space-y-3">
        {SPACING.map(({ token, px, rem }) => (
          <div key={token} className="flex items-center gap-4">
            <span className="w-20 text-xs font-mono text-muted-foreground shrink-0">{token}</span>
            <span className="w-16 text-xs text-muted-foreground shrink-0">{px}</span>
            <span className="w-20 text-xs text-muted-foreground shrink-0">{rem}</span>
            <div className="flex items-center">
              <div
                className="h-4 bg-primary/40 rounded"
                style={{ width: px }}
                title={`${token} = ${px}`}
              />
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-3 mt-8">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-1">Padding visuel (classe Tailwind)</h2>
        <div className="grid grid-cols-4 gap-4">
          {['p-2', 'p-4', 'p-6', 'p-8'].map((cls) => (
            <div key={cls} className="flex flex-col items-center gap-2">
              <div className={`${cls} border border-dashed border-primary/50 bg-primary/10 rounded`}>
                <div className="h-4 w-12 bg-primary/40 rounded" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{cls}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title:     'Foundation/Spacing',
  component: SpacingPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Grille d\'espacement 8px du design system AUGURE.' } },
  },
};
export default meta;
type Story = StoryObj;

export const SpacingScale: Story = { name: 'Grille 8px' };
