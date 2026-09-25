'use client';

import { type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SelectOption {
  value: string;
  label: string;
}

export interface RegisterSelectFieldProps {
  name: string;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel: string;
  icon: ReactNode;
  className?: string;
  'data-testid'?: string;
}

/* ------------------------------------------------------------------ */
/* RegisterSelectField — select stylé identique à AuthFormField       */
/* variant register (fond blanc + bordure fine)                       */
/* ------------------------------------------------------------------ */

export function RegisterSelectField({
  name,
  options,
  placeholder,
  ariaLabel,
  icon,
  className,
  'data-testid': dataTestId,
}: RegisterSelectFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error        = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className={cn(
          'flex items-center gap-2.5 px-3 py-2',
          'rounded-sm bg-white border border-gray-300 transition-all',
          'focus-within:border-[#e05726]',
          errorMessage && 'border-red-400 bg-red-50',
        )}
      >
        {/* Icône gauche */}
        <span className="shrink-0 text-[#94a3b8]" aria-hidden="true">
          {icon}
        </span>

        {/* Select natif */}
        <select
          id={`register-select-${name}`}
          aria-label={ariaLabel}
          aria-invalid={!!error}
          aria-describedby={errorMessage ? `register-select-${name}-error` : undefined}
          data-testid={dataTestId}
          className={cn(
            'flex-1 bg-transparent text-sm text-[#1e293b] outline-none min-w-0 cursor-pointer',
            'appearance-none',
          )}
          {...register(name)}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <p
          id={`register-select-${name}-error`}
          className="text-xs text-red-500"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
