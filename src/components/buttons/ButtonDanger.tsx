'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const DANGER_BG    = '#dc3545';
const DANGER_HOVER = '#c82333';

export interface ButtonDangerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
}

export const ButtonDanger = forwardRef<HTMLButtonElement, ButtonDangerProps>(
  ({ children, disabled, className, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-2 rounded px-3',
        'text-sm font-semibold text-white',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400',
        'cursor-pointer',
        className,
      )}
      style={disabled ? undefined : { backgroundColor: DANGER_BG }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = DANGER_HOVER;
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = DANGER_BG;
      }}
      {...props}
    >
      {children}
    </button>
  ),
);
ButtonDanger.displayName = 'ButtonDanger';
