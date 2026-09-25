'use client';

import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ToggleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** État actif du bouton */
  pressed:       boolean;
  /** Callback lors du changement d'état */
  onPressedChange: (pressed: boolean) => void;
  /** Icône ou contenu du bouton */
  children:      ReactNode;
  /** data-testid pour les tests */
  testId?:       string;
}

const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ pressed, onPressedChange, children, className, testId, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-pressed={pressed}
      aria-checked={pressed}
      disabled={disabled}
      data-testid={testId}
      data-state={pressed ? 'on' : 'off'}
      onClick={() => !disabled && onPressedChange(!pressed)}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        pressed
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
ToggleButton.displayName = 'ToggleButton';

export { ToggleButton };
