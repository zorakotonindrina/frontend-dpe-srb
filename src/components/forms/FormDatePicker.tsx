'use client';

import { useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/** Formate une date en jj/mm/aaaa (format FR) */
function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Insère les « / » au fil de la saisie (jj/mm/aaaa), ne garde que les chiffres. */
function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  return parts.join('/');
}

/** Parse un texte « jj/mm/aaaa » complet en Date valide, ou `null` si invalide. */
function parseDateFR(text: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const day   = Number(match[1]);
  const month = Number(match[2]);
  const year  = Number(match[3]);
  if (month < 1 || month > 12) return null;

  const date = new Date(year, month - 1, day);
  // rejette les dates calendaires inexistantes (ex. 31/02/2024)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function toDateOrUndefined(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface FormDatePickerProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Label affiché au-dessus */
  label: string;
  /** Placeholder quand aucune date sélectionnée */
  placeholder?: string;
  /** Champ obligatoire */
  required?: boolean;
  /** Désactive le champ */
  disabled?: boolean;
  /** Date minimale */
  fromDate?: Date;
  /** Date maximale */
  toDate?: Date;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* FormDatePicker                                                       */
/* ------------------------------------------------------------------ */

export function FormDatePicker({
  name,
  label,
  placeholder = 'jj/mm/aaaa',
  required = false,
  disabled = false,
  fromDate,
  toDate,
  className,
}: FormDatePickerProps) {
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);

  const selectedDate = toDateOrUndefined(field.value);

  const isOutOfRange = (date: Date) => {
    if (fromDate && date < fromDate) return true;
    if (toDate && date > toDate) return true;
    return false;
  };

  // Texte affiché dans le champ — resynchronisé quand la valeur change de l'extérieur
  // (sélection dans le calendrier, reset du formulaire, préremplissage en mode « modifier »).
  const [inputValue, setInputValue] = useState(() => (selectedDate ? formatDateFR(selectedDate) : ''));

  useEffect(() => {
    setInputValue(selectedDate ? formatDateFR(selectedDate) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskDateInput(e.target.value);
    setInputValue(masked);

    if (masked.length === 10) {
      const parsed = parseDateFR(masked);
      field.onChange(parsed && !isOutOfRange(parsed) ? parsed : null);
    } else if (masked.length === 0) {
      field.onChange(null);
    }
  }

  function handleInputBlur() {
    field.onBlur();
    // Saisie incomplète ou invalide au moment de quitter le champ → on l'efface.
    if (inputValue.length > 0 && inputValue.length < 10) {
      setInputValue('');
      field.onChange(null);
      return;
    }
    if (inputValue.length === 10) {
      const parsed = parseDateFR(inputValue);
      if (!parsed || isOutOfRange(parsed)) {
        setInputValue('');
        field.onChange(null);
      }
    }
  }

  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={`datepicker-${name}`}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      <div className="relative flex items-center">
        <Input
          id={`datepicker-${name}`}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={10}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={error ? `datepicker-${name}-error` : undefined}
          className={cn('pr-8', error && 'border-destructive')}
        />

        <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                aria-label={
                  selectedDate
                    ? `Date sélectionnée : ${formatDateFR(selectedDate)}. Ouvrir le calendrier.`
                    : `Ouvrir le calendrier, champ ${label}`
                }
                className="absolute right-0 h-8 w-8 text-muted-foreground hover:bg-transparent"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                field.onChange(date ?? null);
                setOpen(false);
              }}
              disabled={(date) => {
                if (fromDate && date < fromDate) return true;
                if (toDate && date > toDate) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {error?.message && (
        <p
          id={`datepicker-${name}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
