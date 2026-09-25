'use client';

import { useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useState, useEffect } from 'react';

export interface SearchInputProps {
  /** Valeur courante (contrôlée) */
  value?:        string;
  /** Callback appelé après le délai de debounce */
  onSearch:      (value: string) => void;
  /** Délai en ms (défaut : 300) */
  debounceMs?:   number;
  placeholder?:  string;
  className?:    string;
  disabled?:     boolean;
}

export function SearchInput({
  value: externalValue = '',
  onSearch,
  debounceMs = 300,
  placeholder = 'Rechercher…',
  className,
  disabled,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(externalValue);
  const debouncedValue = useDebounce(inputValue, debounceMs);

  // Synchronise si la valeur externe change
  useEffect(() => {
    setInputValue(externalValue);
  }, [externalValue]);

  // Déclenche la recherche quand la valeur debounced change
  useEffect(() => {
    onSearch(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleClear = useCallback(() => {
    setInputValue('');
  }, []);

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        className="absolute left-3 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        data-testid="datatable-search-input"
        className={cn(
          'h-9 w-full rounded-md border border-border bg-background pl-9 pr-9 text-sm',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Effacer la recherche"
          className="absolute right-3 text-muted-foreground hover:text-foreground focus-visible:outline-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
