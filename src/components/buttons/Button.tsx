'use client';

import { type ReactNode } from 'react';
import { Button as UiButton, buttonVariants } from '@/components/ui/button';

export interface ButtonProps extends React.ComponentProps<typeof UiButton> {
  /** Icône à gauche du libellé */
  leadingIcon?:  ReactNode;
  /** Icône à droite du libellé */
  trailingIcon?: ReactNode;
  /** data-testid pour les tests */
  testId?:       string;
}

function Button({ leadingIcon, trailingIcon, children, testId, ...props }: ButtonProps) {
  return (
    <UiButton data-testid={testId} {...props}>
      {leadingIcon && <span className="shrink-0" aria-hidden="true">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className="shrink-0" aria-hidden="true">{trailingIcon}</span>}
    </UiButton>
  );
}
Button.displayName = 'Button';

export { Button, buttonVariants };
