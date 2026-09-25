'use client';

import { Check, Loader2, Circle, RotateCcw, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  WORKFLOW_ETAPES,
  deriveWorkflowState,
  getActionableEtape,
  type EtapeCode,
  type EtapeNodeState,
} from '@/lib/constants/workflow-etapes';

export interface WorkflowStepperProps {
  /** Code de la tâche `wf_processus_activite_tache` réellement ouverte, ou `null` si le circuit est terminé. */
  etapeCode: EtapeCode | null;
  /** `wf_dossier.motif_rejet` — non nul si la tâche courante provient d'une ressaisie. */
  motifRejet?: string | null;
  className?: string;
}

interface StepItem {
  id: string;
  title: string;
  state: EtapeNodeState;
}

const STATE_ICONS: Record<EtapeNodeState, LucideIcon> = {
  done: Check,
  active: Loader2,
  pending: Circle,
  returned: RotateCcw,
};

/** Style du cercle par état — mêmes tokens sémantiques que `EtapeNode.tsx` (success/info/warning). */
const STATE_CIRCLE_STYLES: Record<EtapeNodeState, string> = {
  done: 'border-[color:var(--color-success)] bg-[color:var(--color-success)] text-white',
  active: 'border-[color:var(--color-info)] bg-background text-[color:var(--color-info)]',
  pending: 'border-muted-foreground/30 bg-background text-muted-foreground',
  returned: 'border-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]',
};

/** Suffixe d'aria-label par état — non traduit, comme les aria-labels de `StepperIndicator` (AUGURE). */
const STATE_ARIA_SUFFIX: Record<EtapeNodeState, string> = {
  done: 'terminée',
  active: 'en cours',
  pending: 'à venir',
  returned: 'retournée pour complément',
};

/**
 * Bandeau d'étapes du workflow dossier (lecture seule) — même présentation que le
 * `WorkflowStepper` d'AUGURE (rangée de cercles + traits + libellés), piloté par la tâche
 * `wf_processus_activite_tache` réellement ouverte pour le dossier plutôt que par un statut
 * fonctionnel à plat. Remplace `WorkflowGraph`.
 */
export function WorkflowStepper({ etapeCode, motifRejet, className }: WorkflowStepperProps) {
  const t = useTranslations('dossiers.etapes');

  const { etapeStates } = deriveWorkflowState(etapeCode, motifRejet);

  const steps: StepItem[] = WORKFLOW_ETAPES.map((code) => ({
    id: code,
    title: t(code),
    state: etapeStates[code],
  }));

  const actionable = getActionableEtape(etapeStates);
  const actionableIndex = actionable ? WORKFLOW_ETAPES.indexOf(actionable) : -1;
  const mobileLabel = actionable ? t(actionable) : t('CIRCUIT_TERMINE');

  return (
    <div
      data-testid="workflow-stepper"
      className={cn(
        'flex flex-col gap-4 rounded-sm border border-border border-t-2 border-t-orange-400 bg-card p-4 shadow-sm',
        className,
      )}
    >
      <nav aria-label="Progression du dossier">
        <ol className="flex w-full items-center">
          {steps.map((step, index) => {
            const Icon = STATE_ICONS[step.state];
            const isLast = index === steps.length - 1;
            const lineFilled = step.state === 'done';

            return (
              <li
                key={step.id}
                className={cn('flex items-center', !isLast && 'flex-1')}
                data-testid={`workflow-stepper-step-${step.id}`}
              >
                <div
                  aria-current={step.state === 'active' || step.state === 'returned' ? 'step' : undefined}
                  aria-label={`Étape ${index + 1} : ${step.title} (${STATE_ARIA_SUFFIX[step.state]})`}
                  className={cn(
                    'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold',
                    STATE_CIRCLE_STYLES[step.state],
                  )}
                >
                  <Icon className={cn('h-4 w-4', step.state === 'active' && 'animate-spin')} aria-hidden="true" />
                </div>

                {!isLast && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 flex-1 rounded transition-colors',
                      lineFilled ? 'bg-[color:var(--color-success)]' : 'bg-muted-foreground/20',
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Libellés — alignés sous les cercles, masqués sur mobile */}
        <ol className="mt-2 hidden justify-between sm:flex" aria-hidden="true">
          {steps.map((step, index) => {
            const isFirst = index === 0;
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.id}
                className={cn(
                  'flex flex-col',
                  isFirst && 'items-start text-left',
                  isLast && !isFirst && 'items-end text-right',
                  !isFirst && !isLast && 'flex-1 items-center text-center',
                )}
              >
                <span
                  className={cn(
                    'text-xs font-medium leading-tight',
                    step.state === 'active' && 'text-[color:var(--color-info)]',
                    step.state === 'returned' && 'text-[color:var(--color-warning)]',
                    step.state === 'done' && 'text-foreground',
                    step.state === 'pending' && 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Résumé mobile */}
        <div className="mt-2 sm:hidden">
          <p className="text-sm font-medium text-primary">
            {actionableIndex >= 0
              ? `Étape ${actionableIndex + 1} / ${WORKFLOW_ETAPES.length} — ${mobileLabel}`
              : mobileLabel}
          </p>
        </div>
      </nav>
    </div>
  );
}
