'use client';

import { Check } from 'lucide-react';
import { useStepperContext } from './Stepper';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* StepperIndicator — barre de progression horizontale                 */
/* ------------------------------------------------------------------ */

export function StepperIndicator() {
  const { steps, currentStep, goTo } = useStepperContext();

  return (
    <nav
      aria-label="Progression du formulaire"
      data-testid="stepper-indicator"
    >
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent   = index === currentStep;
          const isUpcoming  = index > currentStep;
          const isLast      = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
              data-testid={`stepper-step-${index}`}
            >
              {/* Cercle de l'étape */}
              <button
                type="button"
                onClick={() => isCompleted ? goTo(index) : undefined}
                disabled={!isCompleted}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Étape ${index + 1} : ${step.title}${isCompleted ? ' (terminée)' : isCurrent ? ' (en cours)' : ' (à venir)'}`}
                className={cn(
                  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                  isCompleted && 'border-primary bg-primary text-primary-foreground cursor-pointer hover:opacity-90',
                  isCurrent  && 'border-primary bg-background text-primary',
                  isUpcoming && 'border-muted-foreground/30 bg-background text-muted-foreground cursor-default',
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{index + 1}</span>
                )}
              </button>

              {/* Label sous le cercle */}
              <div className="absolute mt-16 hidden sm:flex flex-col items-center" style={{ marginLeft: '-1rem' }}>
                {/* rendered via CSS below to avoid layout shift — see inline approach */}
              </div>

              {/* Ligne de connexion */}
              {!isLast && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 rounded transition-colors',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/20',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Labels des étapes — alignés sous les cercles */}
      <ol className="mt-2 hidden sm:flex justify-between" aria-hidden="true">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent   = index === currentStep;
          const isFirst     = index === 0;
          const isLast      = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn(
                'flex flex-col',
                isFirst                    && 'items-start text-left',
                isLast && !isFirst         && 'items-end text-right',
                !isFirst && !isLast        && 'flex-1 items-center text-center',
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium leading-tight',
                  isCurrent   && 'text-primary',
                  isCompleted && 'text-foreground',
                  !isCurrent && !isCompleted && 'text-muted-foreground',
                )}
              >
                {step.title}
              </span>
              {step.description && (
                <span className="text-xs text-muted-foreground leading-tight mt-0.5">
                  {step.description}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Titre mobile — affiche seulement l'étape courante */}
      <div className="mt-2 sm:hidden">
        <p className="text-sm font-medium text-primary">
          Étape {currentStep + 1} / {steps.length} — {steps[currentStep]?.title}
        </p>
        {steps[currentStep]?.description && (
          <p className="text-xs text-muted-foreground">{steps[currentStep].description}</p>
        )}
      </div>
    </nav>
  );
}
