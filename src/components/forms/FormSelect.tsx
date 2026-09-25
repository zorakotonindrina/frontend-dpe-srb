'use client';

import { useController, useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Label affiché au-dessus du select */
  label: string;
  /** Options disponibles */
  options: SelectOption[];
  /** Placeholder affiché quand aucune valeur sélectionnée */
  placeholder?: string;
  /** Champ obligatoire */
  required?: boolean;
  /** Désactive le champ */
  disabled?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* FormSelect                                                           */
/* ------------------------------------------------------------------ */

export function FormSelect({
  name,
  label,
  options,
  placeholder = 'Sélectionner…',
  required = false,
  disabled = false,
  className,
}: FormSelectProps) {
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div
      className={cn('grid min-w-0 gap-1.5', className)}
      data-testid={`form-select-${name}`}
    >
      <Label htmlFor={`select-${name}`}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      <Select
        value={field.value ?? ''}
        onValueChange={field.onChange}
        disabled={disabled}
        name={name}
        items={options}
      >
        <SelectTrigger
          id={`select-${name}`}
          className="w-full min-w-0 overflow-hidden"
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={error ? `select-${name}-error` : undefined}
        >
          <SelectValue className="min-w-0 truncate overflow-hidden" placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt, idx) => (
            <SelectItem key={`${opt.value}-${idx}`} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error?.message && (
        <p
          id={`select-${name}-error`}
          className="text-sm text-destructive"
          role="alert"
          data-testid={`form-select-${name}-error`}
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
