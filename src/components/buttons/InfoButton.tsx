'use client';

import { forwardRef, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const INFO_BTN_BG = '#2da9d7';
const INFO_BTN_HOVER = '#2595bd';

export interface InfoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const InfoButton = forwardRef<HTMLButtonElement, InfoButtonProps>(
  (
    {
      children,
      icon,
      loading,
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      className={cn(
        'relative flex h-8 shrink-0 items-center justify-center gap-2 rounded',
        'px-3 text-sm font-semibold text-white',
        'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        'disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer',
        fullWidth && 'w-full',
        className,
      )}
      style={{ backgroundColor: INFO_BTN_BG }}
      onMouseEnter={(e) => {
        if (!disabled && !loading)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = INFO_BTN_HOVER;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = INFO_BTN_BG;
      }}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {!loading && icon}
      {children}
    </button>
  ),
);
InfoButton.displayName = 'InfoButton';
