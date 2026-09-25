'use client';

import { useController, useFormContext } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface FormRadioGroupProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Label du groupe */
  label: string;
  /** Options */
  options: RadioOption[];
  /** Champ obligatoire */
  required?: boolean;
  /** Désactive tout le groupe */
  disabled?: boolean;
  /** Disposition — vertical (défaut) ou horizontal */
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/* ------------------------------------------------------------------ */
/* FormRadioGroup                                                       */
/* ------------------------------------------------------------------ */

export function FormRadioGroup({
  name,
  label,
  options,
  required = false,
  disabled = false,
  orientation = 'vertical',
  className,
}: FormRadioGroupProps) {
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <fieldset className={cn('grid gap-2', className)} aria-required={required}>
      <legend className="text-sm font-medium leading-none">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      <RadioGroup
        value={field.value ?? ''}
        onValueChange={field.onChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `radio-${name}-error` : undefined}
        className={cn(
          orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'grid gap-2',
        )}
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-start gap-2">
            <RadioGroupItem
              id={`radio-${name}-${opt.value}`}
              value={opt.value}
              disabled={opt.disabled ?? disabled}
              className="mt-0.5"
            />
            <div className="grid gap-0.5">
              <Label
                htmlFor={`radio-${name}-${opt.value}`}
                className="cursor-pointer font-normal leading-snug"
              >
                {opt.label}
              </Label>
              {opt.description && (
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>

      {error?.message && (
        <p
          id={`radio-${name}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error.message}
        </p>
      )}
    </fieldset>
  );
}
