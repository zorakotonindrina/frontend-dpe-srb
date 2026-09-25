import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      sm:  'h-4 w-4',
      md:  'h-6 w-6',
      lg:  'h-8 w-8',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  /** Texte lisible par les lecteurs d'écran */
  label?:     string;
  className?: string;
}

export function LoadingSpinner({
  size,
  label = 'Chargement en cours…',
  className,
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <Loader2 className={spinnerVariants({ size })} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
