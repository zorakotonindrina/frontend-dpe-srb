'use client';

import { useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface FormTextareaProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Label affiché au-dessus */
  label: string;
  /** Placeholder */
  placeholder?: string;
  /** Champ obligatoire */
  required?: boolean;
  /** Désactive le champ */
  disabled?: boolean;
  /** Nombre de lignes visible */
  rows?: number;
  /** Nombre max de caractères — affiche un compteur si fourni */
  maxLength?: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* FormTextarea                                                         */
/* ------------------------------------------------------------------ */

export function FormTextarea({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  maxLength,
  className,
}: FormTextareaProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;
  const currentValue: string = watch(name) ?? '';
  const charCount = currentValue.length;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <div className="flex items-baseline justify-between">
        <Label htmlFor={`textarea-${name}`}>
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        {maxLength !== undefined && (
          <span
            className={cn(
              'text-xs tabular-nums',
              charCount > maxLength ? 'text-destructive' : 'text-muted-foreground',
            )}
            aria-live="polite"
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      <Textarea
        id={`textarea-${name}`}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={errorMessage ? `textarea-${name}-error` : undefined}
        {...register(name)}
      />

      {errorMessage && (
        <p
          id={`textarea-${name}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
