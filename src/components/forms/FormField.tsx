'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface FormFieldProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Label affiché au-dessus du champ */
  label: string;
  /** Type HTML de l'input */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';
  /** Placeholder */
  placeholder?: string;
  /** Champ obligatoire (affiche un indicateur *) */
  required?: boolean;
  /** Désactive le champ */
  disabled?: boolean;
  /** Description aide sous le champ */
  description?: string;
  /** Longueur maximale du champ */
  maxLength?: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* FormField                                                            */
/* ------------------------------------------------------------------ */

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  description,
  maxLength,
  className,
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div
      className={cn('grid gap-1.5', className)}
      data-testid={`form-field-${name}`}
    >
      <Label htmlFor={`field-${name}`}>
        {label}
        {required && (
          <span
            className="text-destructive ml-1"
            aria-hidden="true"
            data-testid="form-field-required-indicator"
          >
            *
          </span>
        )}
      </Label>

      <Input
        id={`field-${name}`}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={
          errorMessage ? `field-${name}-error` : description ? `field-${name}-desc` : undefined
        }
        aria-required={required}
        data-testid={`form-field-${name}-input`}
        {...register(name)}
      />

      {description && !errorMessage && (
        <p
          id={`field-${name}-desc`}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}

      {errorMessage && (
        <p
          id={`field-${name}-error`}
          className="text-sm text-destructive"
          role="alert"
          data-testid={`form-field-${name}-error`}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
