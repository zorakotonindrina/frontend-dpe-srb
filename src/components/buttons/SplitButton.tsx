'use client';

import { forwardRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonProps } from './Button';

export interface SplitButtonAction {
  label:    string;
  onClick:  () => void;
  disabled?: boolean;
  icon?:    ReactNode;
}

export interface SplitButtonProps
  extends Omit<ButtonProps, 'trailingIcon' | 'leadingIcon'> {
  /** Actions dans le dropdown secondaire */
  actions:       SplitButtonAction[];
  /** Libellé du bouton d'expansion (accessible) */
  expandLabel?:  string;
}

const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      children,
      actions,
      expandLabel = 'Plus d\'actions',
      testId,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClass = buttonVariants({ variant, size });

    return (
      <div className="inline-flex rounded-md shadow-sm" role="group">
        {/* Bouton principal */}
        <button
          ref={ref}
          className={cn(baseClass, 'rounded-r-none border-r-0', className)}
          data-testid={testId}
          disabled={disabled}
          {...props}
        >
          {children}
        </button>

        {/* Bouton dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              baseClass,
              'rounded-l-none border-l border-l-white/20 px-2',
            )}
            aria-label={expandLabel}
            disabled={disabled}
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon && (
                  <span className="mr-2" aria-hidden="true">{action.icon}</span>
                )}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);
SplitButton.displayName = 'SplitButton';

export { SplitButton };
