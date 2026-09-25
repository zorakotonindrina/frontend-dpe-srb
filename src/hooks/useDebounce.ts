import { useState, useEffect } from 'react';

/**
 * Retarde la mise à jour d'une valeur pendant le délai spécifié.
 * Utile pour éviter des requêtes trop fréquentes lors de la saisie.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
