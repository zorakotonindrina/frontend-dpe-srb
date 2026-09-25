'use client';

import type { ReactNode } from 'react';
import { useStepperContext } from './Stepper';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface StepperStepProps {
  /** Index 0-based de cette étape */
  stepIndex: number;
  children: ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* StepperStep — conteneur conditionnel d'une étape                    */
/* ------------------------------------------------------------------ */

export function StepperStep({ stepIndex, children, className }: StepperStepProps) {
  const { currentStep } = useStepperContext();

  if (currentStep !== stepIndex) return null;

  return (
    <section
      role="tabpanel"
      aria-label={`Contenu de l'étape ${stepIndex + 1}`}
      className={className}
    >
      {children}
    </section>
  );
}
