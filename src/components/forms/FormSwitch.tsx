'use client';

import { useController, useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface FormSwitchProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Label affiché à côté du switch */
  label: string;
  /** Description optionnelle sous le label */
  description?: string;
  /** Désactive le switch */
  disabled?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* FormSwitch                                                           */
/* ------------------------------------------------------------------ */

export function FormSwitch({
  name,
  label,
  description,
  disabled = false,
  className,
}: FormSwitchProps) {
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div className={cn('grid gap-1.5', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-0.5">
          <Label htmlFor={`switch-${name}`} className="cursor-pointer">
            {label}
          </Label>
          {description && (
            <p id={`switch-${name}-desc`} className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <Switch
          id={`switch-${name}`}
          checked={field.value === true}
          onCheckedChange={field.onChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `switch-${name}-error`
              : description
                ? `switch-${name}-desc`
                : undefined
          }
        />
      </div>

      {error?.message && (
        <p
          id={`switch-${name}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
