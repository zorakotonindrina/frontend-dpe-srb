'use client';

import { useState } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertBannerVariants = cva(
  'relative flex items-start gap-3 rounded-lg border p-4 text-sm',
  {
    variants: {
      variant: {
        success: 'border-[color:var(--color-feedback-success)]    bg-[color:var(--color-feedback-success-bg)]    text-[color:var(--color-feedback-success)]',
        error:   'border-[color:var(--color-feedback-error)]      bg-[color:var(--color-feedback-error-bg)]      text-[color:var(--color-feedback-error)]',
        warning: 'border-[color:var(--color-feedback-warning)]    bg-[color:var(--color-feedback-warning-bg)]    text-[color:var(--color-feedback-warning)]',
        info:    'border-[color:var(--color-feedback-info)]       bg-[color:var(--color-feedback-info-bg)]       text-[color:var(--color-feedback-info)]',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

const ICONS = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
} as const;

export interface AlertBannerProps extends VariantProps<typeof alertBannerVariants> {
  /** Titre de la bannière (optionnel) */
  title?:       string;
  /** Corps du message */
  children:     React.ReactNode;
  /** Affiche le bouton de fermeture */
  dismissible?: boolean;
  /** Callback à la fermeture */
  onDismiss?:   () => void;
  className?:   string;
}

export function AlertBanner({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const Icon = ICONS[variant ?? 'info'];

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      data-testid="alert-banner"
      className={cn(alertBannerVariants({ variant }), className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />

      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-current/80">{children}</div>
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer la notification"
          className="ml-auto shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
