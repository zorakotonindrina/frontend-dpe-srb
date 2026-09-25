import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { toast } from 'sonner';
import { Stepper } from './Stepper';
import { StepperIndicator } from './StepperIndicator';
import { StepperStep } from './StepperStep';
import { StepperNav } from './StepperNav';
import type { StepConfig } from './stepper.types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function StepContent({ step, content }: { step: number; content: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
      <p className="text-sm font-medium text-foreground">Étape {step}</p>
      <p className="text-xs text-muted-foreground mt-1">{content}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof Stepper> = {
  title:     'Components/Stepper',
  component: Stepper,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Stepper>;

/* ------------------------------------------------------------------ */
/* Stories                                                             */
/* ------------------------------------------------------------------ */

export const DeuxEtapes: Story = {
  name: '2 étapes',
  render: () => {
    const steps: StepConfig[] = [
      { id: 'step-1', title: 'Identité' },
      { id: 'step-2', title: 'Confirmation' },
    ];
    return (
      <div className="max-w-lg mx-auto">
        <Stepper steps={steps} onComplete={() => { toast.success('Formulaire soumis !'); }}>
          <StepperIndicator />
          <StepperStep stepIndex={0}><StepContent step={1} content="Saisissez vos informations personnelles" /></StepperStep>
          <StepperStep stepIndex={1}><StepContent step={2} content="Vérifiez et confirmez vos données" /></StepperStep>
          <StepperNav />
        </Stepper>
      </div>
    );
  },
};

export const TroisEtapes: Story = {
  name: '3 étapes',
  render: () => {
    const steps: StepConfig[] = [
      { id: 'step-1', title: 'Identité' },
      { id: 'step-2', title: 'Affectation' },
      { id: 'step-3', title: 'Confirmation' },
    ];
    return (
      <div className="max-w-lg mx-auto">
        <Stepper steps={steps} onComplete={() => { toast.success('Formulaire soumis !'); }}>
          <StepperIndicator />
          <StepperStep stepIndex={0}><StepContent step={1} content="Nom, prénom, matricule, date de naissance" /></StepperStep>
          <StepperStep stepIndex={1}><StepContent step={2} content="Direction, poste, grade, contrat" /></StepperStep>
          <StepperStep stepIndex={2}><StepContent step={3} content="Récapitulatif et validation" /></StepperStep>
          <StepperNav />
        </Stepper>
      </div>
    );
  },
};

export const QuatreEtapes: Story = {
  name: '4 étapes',
  render: () => {
    const steps: StepConfig[] = [
      { id: 'step-1', title: 'Identité' },
      { id: 'step-2', title: 'Affectation' },
      { id: 'step-3', title: 'Contrat' },
      { id: 'step-4', title: 'Confirmation' },
    ];
    return (
      <div className="max-w-lg mx-auto">
        <Stepper steps={steps} onComplete={() => { toast.success("Agent créé avec succès !"); }}>
          <StepperIndicator />
          <StepperStep stepIndex={0}><StepContent step={1} content="Nom, prénom, email, téléphone" /></StepperStep>
          <StepperStep stepIndex={1}><StepContent step={2} content="Direction, service, poste" /></StepperStep>
          <StepperStep stepIndex={2}><StepContent step={3} content="Grade, contrat, date d'effet" /></StepperStep>
          <StepperStep stepIndex={3}><StepContent step={4} content="Récapitulatif — vérifiez les informations" /></StepperStep>
          <StepperNav submitLabel="Créer l'agent" />
        </Stepper>
      </div>
    );
  },
};
