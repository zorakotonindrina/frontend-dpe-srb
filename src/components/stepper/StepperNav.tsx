'use client';

import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStepperContext } from './Stepper';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface StepperNavProps {
  /** Label du bouton Précédent (défaut : "Précédent") */
  prevLabel?: string;
  /** Label du bouton Suivant (défaut : "Suivant") */
  nextLabel?: string;
  /** Label du bouton de soumission (défaut : "Soumettre") */
  submitLabel?: string;
  /** Masque le bouton Précédent à la première étape */
  hidePrevOnFirst?: boolean;
  /** Désactive Suivant/Soumettre en plus de la validation RHF — pour une règle métier externe au
   *  schéma zod (ex. donnée chargée de manière asynchrone), voir processus/constatation-technique. */
  nextDisabled?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* StepperNav — boutons Précédent / Suivant / Soumettre                */
/* ------------------------------------------------------------------ */

export function StepperNav({
  prevLabel    = 'Précédent',
  nextLabel    = 'Suivant',
  submitLabel  = 'Soumettre',
  hidePrevOnFirst = false,
  nextDisabled = false,
  className,
}: StepperNavProps) {
  const { isFirst, isLast, prev, next, onComplete, isSubmitting } = useStepperContext();

  const showPrev = !isFirst || !hidePrevOnFirst;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 pt-2',
        isFirst && hidePrevOnFirst && 'justify-end',
        className,
      )}
    >
      {/* Précédent */}
      {showPrev && (
        <Button
          type="button"
          variant="outline"
          onClick={prev}
          disabled={isFirst || isSubmitting}
          data-testid="stepper-prev-button"
          aria-label={prevLabel}
        >
          <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
          {prevLabel}
        </Button>
      )}

      {/* Suivant ou Soumettre */}
      {isLast ? (
        <Button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting || nextDisabled}
          data-testid="stepper-submit-button"
          aria-label={submitLabel}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <span
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              Envoi…
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" aria-hidden="true" />
              {submitLabel}
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={next}
          disabled={isSubmitting || nextDisabled}
          data-testid="stepper-next-button"
          aria-label={nextLabel}
        >
          {nextLabel}
          <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
