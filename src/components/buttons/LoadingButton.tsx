'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './Button';

export interface LoadingButtonProps extends ButtonProps {
  /** Affiche l'état de chargement */
  loading?:     boolean;
  /** Texte affiché pendant le chargement (remplace children) */
  loadingText?: string;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText, children, disabled, className, testId, ...props }, ref) => (
    <Button
      ref={ref}
      disabled={disabled || loading}
      className={cn('relative', className)}
      testId={testId}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2
          className="h-4 w-4 shrink-0 animate-spin"
          aria-hidden="true"
        />
      )}
      {loading ? (loadingText ?? children) : children}
    </Button>
  ),
);
LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
