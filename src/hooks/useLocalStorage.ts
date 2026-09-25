import { useCallback, useEffect, useState } from 'react';

/**
 * Synchronise une valeur avec le localStorage du navigateur.
 * Le premier rendu reste volontairement identique entre SSR et client.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // Lecture d'un système externe (localStorage) au montage pour rester
    // identique au rendu SSR — cas explicitement couvert par les docs React
    // (https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store).
    try {
      const item = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStoredValue(item ? (JSON.parse(item) as T) : initialValue);
    } catch {
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((previousValue) => {
        const valueToStore =
          typeof value === 'function'
            ? (value as (prev: T) => T)(previousValue)
            : value;

        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
          // localStorage peut etre plein ou desactive, on ignore silencieusement.
        }

        return valueToStore;
      });
    },
    [key],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
