import type { UseFormReturn, FieldValues } from 'react-hook-form';

/* ------------------------------------------------------------------ */
/* StepConfig                                                           */
/* ------------------------------------------------------------------ */

export interface StepConfig {
  /** Identifiant unique de l'étape */
  id: string;
  /** Titre affiché dans l'indicateur */
  title: string;
  /** Sous-titre / description optionnel */
  description?: string;
  /**
   * Noms des champs React Hook Form à valider avant de passer
   * à l'étape suivante. Si absent, aucune validation par étape.
   */
  fields?: string[];
}

/* ------------------------------------------------------------------ */
/* StepperState                                                         */
/* ------------------------------------------------------------------ */

export interface StepperState {
  /** Index 0-based de l'étape courante */
  currentStep: number;
  /** Nombre total d'étapes */
  totalSteps: number;
  /** Vrai si on est à la première étape */
  isFirst: boolean;
  /** Vrai si on est à la dernière étape */
  isLast: boolean;
}

/* ------------------------------------------------------------------ */
/* StepperContextValue                                                  */
/* ------------------------------------------------------------------ */

export interface StepperContextValue extends StepperState {
  /** Configuration de toutes les étapes */
  steps: StepConfig[];
  /** Naviguer vers une étape spécifique (0-based) */
  goTo: (step: number) => void;
  /** Avancer à l'étape suivante (avec validation RHF si form fourni) */
  next: () => Promise<void>;
  /** Revenir à l'étape précédente */
  prev: () => void;
  /** Réinitialiser au début */
  reset: () => void;
  /** Vrai si l'avance est possible (pas la dernière étape) */
  canGoNext: boolean;
  /** Appelé quand le formulaire est soumis sur la dernière étape */
  onComplete?: () => void | Promise<void>;
  /** Instance React Hook Form pour la validation par étape */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturn<any>;
  /** Vrai pendant la validation/soumission asynchrone */
  isSubmitting: boolean;
}
