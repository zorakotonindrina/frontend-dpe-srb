'use client';

import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const VALIDER_BG    = '#28a745';
const VALIDER_HOVER = '#218838';

export interface ButtonValiderProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icône affichée à gauche du libellé */
  icon: ReactNode;
  /** Passe le bouton en mode grisé (disabled visuel + fonctionnel) */
  disabled?: boolean;
}

export const ButtonValider = forwardRef<HTMLButtonElement, ButtonValiderProps>(
  ({ children, icon, disabled, className, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-2 rounded px-3',
        'text-sm font-semibold text-white',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400',
        'cursor-pointer',
        className,
      )}
      style={disabled ? undefined : { backgroundColor: VALIDER_BG }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = VALIDER_HOVER;
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = VALIDER_BG;
      }}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),
);
ButtonValider.displayName = 'ButtonValider';
