'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/buttons/Button';
import { ButtonValider } from '@/components/buttons/ButtonValider';

import { cn } from '@/lib/utils';

export type ConfirmDialogVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive';

export type ConfirmDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  size?: ConfirmDialogSize;
  staticBackdrop?: boolean;
  showCloseButton?: boolean;
  testId?: string;
  className?: string;
  contentClassName?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm?: () => void;
}

const sizeClasses: Record<ConfirmDialogSize, string> = {
  sm:   'sm:max-w-sm',
  md:   'sm:max-w-md',
  lg:   'sm:max-w-3xl',
  xl:   'sm:max-w-5xl',
  full: 'sm:max-w-[90vw]',
};

const headerClasses: Record<ConfirmDialogVariant, string> = {
  default:
    'border-b bg-card text-card-foreground',
  success:
    'bg-[color:var(--color-success)] text-white',
  warning:
    'bg-[color:var(--color-warning)] text-white',
  destructive:
    'bg-destructive text-destructive-foreground',
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  confirmLabel,
  cancelLabel,
  variant,
  size = 'md',
  staticBackdrop = false,
  showCloseButton = true,
  testId = 'confirm-dialog',
  className,
  contentClassName,
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations('common');
  const visualVariant = variant ?? (destructive ? 'destructive' : 'default');
  const customLayout = Boolean(
    variant || children || footer !== undefined || className || contentClassName || size !== 'md',
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      disablePointerDismissal={staticBackdrop}
    >
      <DialogContent
        data-testid={testId}
        showCloseButton={showCloseButton}
        className={cn(
          customLayout && 'overflow-hidden p-0',
          sizeClasses[size],
          className,
        )}
      >
        <DialogHeader
          className={cn(
            customLayout && 'px-4 py-4',
            customLayout && headerClasses[visualVariant],
            customLayout && showCloseButton && 'pr-12',
          )}
        >
          {customLayout ? (
            <DialogTitle>{title}</DialogTitle>
          ) : (
            <div className="flex items-center gap-3">
              {destructive && (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
                </span>
              )}
              <DialogTitle>{title}</DialogTitle>
            </div>
          )}

          {description && (
            <DialogDescription
              className={cn(
                customLayout && visualVariant !== 'default'
                  ? 'text-white/90'
                  : 'mt-2',
              )}
            >
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && (
          <div className={cn(customLayout && 'px-4 py-4', contentClassName)}>
            {children}
          </div>
        )}

        {footer !== undefined ? (
          footer === null ? null : (
            <DialogFooter className={cn(customLayout && 'm-0 rounded-none')}>
              {footer}
            </DialogFooter>
          )
        ) : (
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              data-testid="confirm-dialog-cancel-button"
            >
              {cancelLabel ?? t('cancel')}
            </Button>

            <ButtonValider
              icon={<Check className="h-4 w-4" />}
              onClick={onConfirm}
              disabled={loading || !onConfirm}
              data-testid="confirm-dialog-confirm-button"
            >
              {confirmLabel ?? t('confirm')}
            </ButtonValider>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
