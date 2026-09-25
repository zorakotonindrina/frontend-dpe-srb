import { useState, useCallback } from 'react';
import type { StepConfig } from './stepper.types';

/* ------------------------------------------------------------------ */
/* useStepper — hook état pur (sans RHF)                               */
/* ------------------------------------------------------------------ */

export interface UseStepperOptions {
  steps: StepConfig[];
  initialStep?: number;
}

export interface UseStepperReturn {
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  canGoNext: boolean;
  goTo: (step: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
}

/**
 * Hook d'état pur pour le Stepper.
 * Ne connaît pas React Hook Form — la validation est gérée par Stepper.tsx.
 */
export function useStepper({ steps, initialStep = 0 }: UseStepperOptions): UseStepperReturn {
  const totalSteps = steps.length;
  const [currentStep, setCurrentStep] = useState<number>(
    Math.max(0, Math.min(initialStep, totalSteps - 1)),
  );

  const isFirst = currentStep === 0;
  const isLast  = currentStep === totalSteps - 1;
  const canGoNext = !isLast;

  const goTo = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(step, totalSteps - 1));
      setCurrentStep(clamped);
    },
    [totalSteps],
  );

  const next = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  return {
    currentStep,
    totalSteps,
    isFirst,
    isLast,
    canGoNext,
    goTo,
    next,
    prev,
    reset,
  };
}
