'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { type ComboboxOption } from '@/components/forms/FormCombobox';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface FormAsyncSelectFieldProps {
  name: string;
  placeholder?: string;
  ariaLabel: string;
  icon: ReactNode;
  fetchOptions: (query: string) => Promise<ComboboxOption[]>;
  onSelect?: (opt: ComboboxOption) => void;
  minCharsToSearch?: number;
  emptyMessage?: string;
  /** Libellé à afficher quand la valeur est pré-remplie depuis l'extérieur (mode modifier). */
  initialLabel?: string;
  /** Libellé visible au-dessus du champ (même rendu que SoaSearchInput) — omis par défaut : les
   *  usages existants (champs auth) n'ont pas de label visible, juste un placeholder. */
  label?: string;
  required?: boolean;
  id?: string;
  className?: string;
  controlClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  'data-testid'?: string;
}

/* ------------------------------------------------------------------ */
/* FormAsyncSelectField                                                 */
/* ------------------------------------------------------------------ */

export function FormAsyncSelectField({
  name,
  placeholder,
  ariaLabel,
  icon,
  fetchOptions,
  onSelect,
  minCharsToSearch = 3,
  emptyMessage = 'Aucun résultat.',
  initialLabel,
  label,
  required = false,
  id,
  className,
  controlClassName,
  inputClassName,
  iconClassName,
  'data-testid': dataTestId,
}: FormAsyncSelectFieldProps) {
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [query, setQuery]     = useState('');
  const [open, setOpen]       = useState(false);
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);

  const skipNextFetch     = useRef(false);
  const isUserInteracting = useRef(false);
  // Dernière valeur injectée depuis l'extérieur (pour distinguer d'un changement utilisateur).
  const lastExternalValue = useRef('');
  const debouncedQuery = useDebounce(query, 400);

  // Synchronise l'affichage quand la valeur est modifiée depuis l'extérieur (methods.reset()).
  // Ne s'applique pas lors des interactions utilisateur (frappe / sélection).
  useEffect(() => {
    if (isUserInteracting.current) {
      isUserInteracting.current = false;
      return;
    }
    const val = field.value ?? '';
    lastExternalValue.current = val;
    skipNextFetch.current = true;
    setQuery(val);          // affiche le code en attendant le libellé
    setOpen(false);
    setOptions([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  // Dès que le libellé résolu arrive (async), remplace le code par le libellé
  // — mais seulement si l'utilisateur n'a pas encore modifié le champ.
  useEffect(() => {
    if (!initialLabel) return;
    if (field.value && field.value === lastExternalValue.current) {
      skipNextFetch.current = true;
      setQuery(initialLabel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLabel]);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    if (debouncedQuery.length < minCharsToSearch) {
      setOpen(false);
      setOptions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchOptions(debouncedQuery)
      .then((results) => {
        if (!cancelled) {
          setOptions(results);
          setOpen(true);
        }
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, fetchOptions, minCharsToSearch]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    isUserInteracting.current = true;
    skipNextFetch.current = false;
    setQuery(e.target.value);
    if (field.value) field.onChange('');
  }

  function handleSelect(opt: ComboboxOption) {
    isUserInteracting.current = true;
    skipNextFetch.current = true;
    field.onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
    onSelect?.(opt);
  }

  const errorMessage = error?.message;
  const inputId = id ?? `async-select-${name}`;

  return (
    <div className={cn('relative flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium" htmlFor={inputId}>
          {label}
          {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2.5 px-3 py-2',
          'rounded-sm bg-white border border-gray-300 transition-all',
          'focus-within:border-[#e05726]',
          errorMessage && 'border-red-400 bg-red-50',
          controlClassName,
        )}
      >
        <span className={cn('shrink-0 text-[#94a3b8]', iconClassName)} aria-hidden="true">
          {icon}
        </span>

        <input
          id={inputId}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => options.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `async-select-${name}-error` : undefined}
          aria-autocomplete="list"
          aria-expanded={open}
          data-testid={dataTestId}
          className={cn('flex-1 bg-transparent text-sm text-[#1e293b] outline-none min-w-0', inputClassName)}
        />

        {loading && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0 text-[#94a3b8]" />
        )}
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full z-50 w-full mt-0.5 bg-white border border-gray-200 rounded-sm shadow-md max-h-48 overflow-auto text-sm"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">{emptyMessage}</li>
          ) : (
            options.map((opt, idx) => (
              <li
                key={`${opt.value}-${idx}`}
                role="option"
                aria-selected={field.value === opt.value}
                onMouseDown={() => handleSelect(opt)}
                data-testid={dataTestId ? `${dataTestId}-option-${opt.value}` : undefined}
                className={cn(
                  'px-3 py-2 cursor-pointer hover:bg-orange-50',
                  field.value === opt.value && 'font-medium',
                )}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}

      {errorMessage && (
        <p
          id={`async-select-${name}-error`}
          className="text-xs text-red-500"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
