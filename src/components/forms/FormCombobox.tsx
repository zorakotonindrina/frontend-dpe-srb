'use client';

import { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface FormComboboxProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Label affiché au-dessus */
  label: string;
  /** Options disponibles */
  options: ComboboxOption[];
  /** Placeholder du trigger */
  placeholder?: string;
  /** Placeholder de la recherche */
  searchPlaceholder?: string;
  /** Message si aucun résultat */
  emptyMessage?: string;
  /** Champ obligatoire */
  required?: boolean;
  /** Désactive le champ */
  disabled?: boolean;
  /** Callback appelé quand l'utilisateur clique sur × — affiche le bouton de réinitialisation dans le trigger */
  onClear?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* FormCombobox                                                         */
/* ------------------------------------------------------------------ */

export function FormCombobox({
  name,
  label,
  options,
  placeholder = 'Sélectionner…',
  searchPlaceholder = 'Rechercher…',
  emptyMessage = 'Aucun résultat.',
  required = false,
  disabled = false,
  onClear,
  className,
}: FormComboboxProps) {
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);

  const fieldValueLower = String(field.value ?? '').toLowerCase();

  const selectedLabel = options.find(
    (opt) => opt.value === field.value || opt.value.toLowerCase() === fieldValueLower,
  )?.label;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-invalid={!!error}
              aria-required={required}
              aria-describedby={error ? `combobox-${name}-error` : undefined}
              disabled={disabled}
              className={cn(
                'h-9 w-full overflow-hidden justify-between font-normal',
                !field.value && 'text-muted-foreground',
                error && 'border-destructive',
              )}
            >
              <span className="truncate flex-1 text-left">
                {selectedLabel ?? placeholder}
              </span>
              {onClear && field.value && (
                <span
                  role="button"
                  aria-label="Effacer"
                  onClick={(e) => { e.stopPropagation(); onClear(); }}
                  className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-destructive"
                >
                  ×
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => {
                      field.onChange(opt.value.toLowerCase() === fieldValueLower ? '' : opt.value);
                      setOpen(false);
                    }}
                    data-checked={opt.value.toLowerCase() === fieldValueLower}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        opt.value.toLowerCase() === fieldValueLower ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error?.message && (
        <p
          id={`combobox-${name}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
