'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useStepper } from './useStepper';
import type { StepConfig, StepperContextValue } from './stepper.types';

/* ------------------------------------------------------------------ */
/* Contexte                                                             */
/* ------------------------------------------------------------------ */

const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext(): StepperContextValue {
  const ctx = useContext(StepperContext);
  if (!ctx) {
    throw new Error('useStepperContext must be used inside <Stepper>');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface StepperProps {
  /** Configuration des étapes */
  steps: StepConfig[];
  /**
   * Appelé quand l'utilisateur clique sur Soumettre à la dernière étape.
   * Généralement `form.handleSubmit(onSubmit)`.
   */
  onComplete?: () => void | Promise<void>;
  /**
   * Instance React Hook Form pour la validation par étape.
   * Chaque `StepConfig` doit avoir `fields` pour que la validation soit active.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturn<any>;
  /** Étape initiale (0-based, défaut : 0) */
  initialStep?: number;
  children: ReactNode;
}

/* ------------------------------------------------------------------ */
/* Stepper — orchestrateur + Context.Provider                          */
/* ------------------------------------------------------------------ */

export function Stepper({
  steps,
  onComplete,
  form,
  initialStep = 0,
  children,
}: StepperProps) {
  const stepper = useStepper({ steps, initialStep });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Avancer à l'étape suivante.
   * Si `form` et `steps[currentStep].fields` sont présents,
   * déclenche la validation RHF sur ces champs avant d'avancer.
   */
  const next = useCallback(async () => {
    const currentConfig = steps[stepper.currentStep];
    if (form && currentConfig?.fields?.length) {
      const valid = await form.trigger(currentConfig.fields);
      if (!valid) return;
    }
    stepper.next();
  }, [stepper, steps, form]);

  /**
   * Soumettre le formulaire (dernière étape).
   */
  const handleComplete = useCallback(async () => {
    if (!onComplete) return;
    setIsSubmitting(true);
    try {
      await onComplete();
    } finally {
      setIsSubmitting(false);
    }
  }, [onComplete]);

  const contextValue: StepperContextValue = {
    steps,
    currentStep: stepper.currentStep,
    totalSteps: stepper.totalSteps,
    isFirst: stepper.isFirst,
    isLast: stepper.isLast,
    canGoNext: stepper.canGoNext,
    goTo: stepper.goTo,
    next,
    prev: stepper.prev,
    reset: stepper.reset,
    onComplete: handleComplete,
    form,
    isSubmitting,
  };

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        className="flex flex-col gap-6"
        data-testid="stepper"
        aria-label={`Formulaire multi-étapes — étape ${stepper.currentStep + 1} sur ${stepper.totalSteps}`}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}
