import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** Titre de l'état vide */
  title?:       string;
  /** Message descriptif */
  description?: string;
  /** Icône personnalisée (défaut : Inbox) */
  icon?:        ReactNode;
  /** Slot pour les boutons d'action (ex. : "Créer un agent") */
  action?:      ReactNode;
  className?:   string;
}

export function EmptyState({
  title       = 'Aucun résultat',
  description = 'Il n\'y a rien à afficher pour le moment.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      )}
      data-testid="empty-state"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-8 w-8" aria-hidden="true" />}
      </div>

      <div className="max-w-sm">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
