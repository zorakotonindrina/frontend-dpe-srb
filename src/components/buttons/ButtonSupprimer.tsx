'use client';

import { forwardRef, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUPPRIMER_BG    = '#dc3545';
const SUPPRIMER_HOVER = '#c82333';

export interface ButtonSupprimerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icône affichée à gauche du libellé (défaut : Trash2) */
  icon?: ReactNode;
  /** Passe le bouton en mode grisé (disabled visuel + fonctionnel) */
  disabled?: boolean;
}

export const ButtonSupprimer = forwardRef<HTMLButtonElement, ButtonSupprimerProps>(
  ({ children, icon, disabled, className, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-2 rounded px-3',
        'text-sm font-semibold text-white',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400',
        'cursor-pointer',
        className,
      )}
      style={disabled ? undefined : { backgroundColor: SUPPRIMER_BG }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = SUPPRIMER_HOVER;
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = SUPPRIMER_BG;
      }}
      {...props}
    >
      {icon ?? <Trash2 className="h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  ),
);
ButtonSupprimer.displayName = 'ButtonSupprimer';
