'use client';

import { forwardRef, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline:     'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:       'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm:      'h-7 w-7',
        default: 'h-9 w-9',
        lg:      'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size:    'default',
    },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Icône à afficher — obligatoire */
  icon:      ReactNode;
  /**
   * Label accessible — OBLIGATOIRE (RGAA).
   * Affiché en tooltip et lu par les lecteurs d'écran.
   */
  'aria-label': string;
  /** data-testid pour les tests */
  testId?:   string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, testId, title, 'aria-label': ariaLabel, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(iconButtonVariants({ variant, size }), className)}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      data-testid={testId}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  ),
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
