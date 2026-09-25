'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { referentielsApi, type Soa } from '@/lib/api/referentiels';
import { cn } from '@/lib/utils';

const MIN_CHARS = 3;

export interface SoaSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  emptyMessage?: string;
  /** Texte affiché tant que l'utilisateur n'a pas encore tapé/sélectionné — permet à un appelant
   *  de préremplir l'affichage (ex. depuis vehicule.soaDepositaire) sans déclencher de recherche. */
  initialLabel?: string;
  /** Valeur stockée à la sélection : le `soaCode` (défaut) ou le `libelle`. */
  valueMode?: 'code' | 'label';
  error?: string;
  'data-testid'?: string;
  id?: string;
}

/**
 * Recherche typeahead pour SOA (referentiel_rh.rh_soa, 20 101 codes distincts — jamais chargé en
 * intégralité, voir referentielsApi.soas). Version **contrôlée** (`value`/`onChange`), extraite de
 * `SoaSearchField` (qui reste le point d'entrée lié à React Hook Form, et délègue maintenant tout
 * l'affichage/la recherche ici) pour être réutilisable hors d'un `FormProvider` — ex.
 * `VehiculeQuickAddPanel`, qui gère ses champs en `useState` local, pas en RHF.
 */
export function SoaSearchInput({
  value, onChange, label, placeholder = 'Rechercher un SOA…', required = false,
  emptyMessage = 'Aucun résultat.', initialLabel, valueMode = 'code', error,
  'data-testid': dataTestId, id = 'soa-search',
}: SoaSearchInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Soa[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLDivElement>(null);
  const skipNextFetch = useRef(false);
  const debouncedQuery = useDebounce(query, 300);

  // Positionne le portail en fixed par rapport au champ — la liste est rendue dans document.body
  // (voir plus bas) pour échapper à `overflow-hidden` des conteneurs parents (ex. SectionCard, qui
  // sinon coupe la liste au bord de la carte).
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, [open]);

  useEffect(() => {
    if (initialLabel && !query) {
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
    if (debouncedQuery.length < MIN_CHARS) {
      setOpen(false);
      setOptions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    referentielsApi.soas(debouncedQuery)
      .then((results) => {
        if (cancelled) return;
        setOptions(results);
        setOpen(true);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    skipNextFetch.current = false;
    setQuery(e.target.value);
    if (value) onChange('');
  }

  function handleSelect(opt: Soa) {
    skipNextFetch.current = true;
    onChange(valueMode === 'label' ? opt.libelle : opt.soaCode);
    setQuery(`${opt.soaCode} — ${opt.libelle}`);
    setOpen(false);
  }

  function isSelected(opt: Soa): boolean {
    return value === (valueMode === 'label' ? opt.libelle : opt.soaCode);
  }

  return (
    <div className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </label>

      <div
        ref={triggerRef}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 h-9',
          'rounded-sm bg-white border border-gray-300 transition-all',
          'focus-within:border-[#e05726]',
          error && 'border-red-400 bg-red-50',
        )}
      >
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => options.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
          data-testid={dataTestId}
          className="flex-1 bg-transparent text-sm text-[#1e293b] outline-none min-w-0"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0 text-[#94a3b8]" />}
      </div>

      {typeof window !== 'undefined' && open && createPortal(
        <ul
          role="listbox"
          style={dropdownStyle}
          className="bg-white border border-gray-200 rounded-sm shadow-md max-h-48 overflow-auto text-sm"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">{emptyMessage}</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.soaCode}
                role="option"
                aria-selected={isSelected(opt)}
                onMouseDown={() => handleSelect(opt)}
                data-testid={dataTestId ? `${dataTestId}-option-${opt.soaCode}` : undefined}
                className={cn(
                  'px-3 py-2 cursor-pointer hover:bg-orange-50',
                  isSelected(opt) && 'font-medium',
                )}
              >
                {opt.soaCode} — {opt.libelle}
              </li>
            ))
          )}
        </ul>,
        document.body,
      )}

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
