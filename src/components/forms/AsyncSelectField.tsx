'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

export interface AsyncSelectOption {
  value: string;
  label: string;
}

export interface AsyncSelectFieldProps {
  fetchOptions: (query: string) => Promise<AsyncSelectOption[]>;
  onSelect: (opt: AsyncSelectOption) => void;
  placeholder?: string;
  ariaLabel?: string;
  icon?: ReactNode;
  minCharsToSearch?: number;
  disabled?: boolean;
  resetKey?: string | number;
  emptyMessage?: string;
  className?: string;
  'data-testid'?: string;
}

/**
 * Autocomplete asynchrone sans dépendance React Hook Form.
 * La liste déroulante est rendue via un portail (document.body) pour
 * échapper aux conteneurs avec overflow-hidden (ex : SectionCard).
 */
export function AsyncSelectField({
  fetchOptions,
  onSelect,
  placeholder,
  ariaLabel,
  icon,
  minCharsToSearch = 4,
  disabled = false,
  resetKey,
  emptyMessage = 'Aucun résultat.',
  className,
  'data-testid': dataTestId,
}: AsyncSelectFieldProps) {
  const [query, setQuery]     = useState('');
  const [open, setOpen]       = useState(false);
  const [options, setOptions] = useState<AsyncSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const triggerRef    = useRef<HTMLDivElement>(null);
  const skipNextFetch = useRef(false);
  const debouncedQuery = useDebounce(query, 400);

  /* Réinitialise quand resetKey change (ex : changement de ministère). */
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setQuery('');
    setOptions([]);
    setOpen(false);
  }

  /* Positionne le portail en fixed par rapport au trigger. */
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

  /* Fetch des options. */
  useEffect(() => {
    if (disabled || skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (debouncedQuery.length < minCharsToSearch) {
      // Fait partie du même effet que le fetch débouncé ci-dessous (garde
      // disabled/skipNextFetch partagée) : pas d'extraction sûre vers un
      // ajustement pendant le rendu sans risquer de rouvrir/fermer le
      // dropdown au mauvais moment, non couvert par des tests ici.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false); setOptions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchOptions(debouncedQuery)
      .then((results) => { if (!cancelled) { setOptions(results); setOpen(true); } })
      .catch(() => { if (!cancelled) setOptions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery, fetchOptions, minCharsToSearch, disabled]);

  function handleSelect(opt: AsyncSelectOption) {
    skipNextFetch.current = true;
    setQuery(opt.label);
    setOpen(false);
    onSelect(opt);
  }

  const dropdown = open ? (
    <ul
      role="listbox"
      style={dropdownStyle}
      className="max-h-48 overflow-auto rounded-sm border border-gray-200 bg-white text-sm shadow-md"
    >
      {options.length === 0 ? (
        <li className="px-3 py-2 text-muted-foreground">{emptyMessage}</li>
      ) : (
        options.map((opt, idx) => (
          <li
            key={`${opt.value}-${idx}`}
            role="option"
            aria-selected={false}
            onMouseDown={() => handleSelect(opt)}
            data-testid={dataTestId ? `${dataTestId}-option-${opt.value}` : undefined}
            className="cursor-pointer px-3 py-2 hover:bg-orange-50"
          >
            {opt.label}
          </li>
        ))
      )}
    </ul>
  ) : null;

  return (
    <div className={cn('relative', className)}>
      <div
        ref={triggerRef}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2',
          'rounded-sm border border-gray-300 bg-white transition-all',
          'focus-within:border-[#e05726]',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {icon && (
          <span className="shrink-0 text-[#94a3b8]" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => { skipNextFetch.current = false; setQuery(e.target.value); }}
          onFocus={() => options.length > 0 && !disabled && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder}
          aria-autocomplete="list"
          aria-expanded={open}
          data-testid={dataTestId}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#1e293b] outline-none disabled:cursor-not-allowed"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0 text-[#94a3b8]" />}
      </div>

      {typeof window !== 'undefined' && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
