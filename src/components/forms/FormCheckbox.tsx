'use client';

import { useController, useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface FormCheckboxProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Label affiché à côté de la checkbox */
  label: string;
  /** Description additionnelle sous le label */
  description?: string;
  /** Champ obligatoire */
  required?: boolean;
  /** Désactive le champ */
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

/* ------------------------------------------------------------------ */
/* FormCheckbox                                                         */
/* ------------------------------------------------------------------ */

export function FormCheckbox({
  name,
  label,
  description,
  required = false,
  disabled = false,
  className,
  'data-testid': dataTestId,
}: FormCheckboxProps) {
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div className={cn('grid gap-1.5', className)} data-testid={dataTestId}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={`checkbox-${name}`}
          checked={field.value === true}
          onCheckedChange={field.onChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={
            error
              ? `checkbox-${name}-error`
              : description
                ? `checkbox-${name}-desc`
                : undefined
          }
        />
        <div className="grid gap-0.5">
          <Label
            htmlFor={`checkbox-${name}`}
            className="cursor-pointer leading-snug"
          >
            <span className="text-gray-500">{label}</span>
            {required && (
              <span className="text-destructive ml-1" aria-hidden="true">
                *
              </span>
            )}
          </Label>
          {description && (
            <p
              id={`checkbox-${name}-desc`}
              className="text-sm text-muted-foreground"
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {error?.message && (
        <p
          id={`checkbox-${name}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
