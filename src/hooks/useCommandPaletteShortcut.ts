import { useEffect } from 'react';

/** Déclenche `onToggle` sur Ctrl+K / Cmd+K, où qu'on soit dans l'application. */
export function useCommandPaletteShortcut(onToggle: () => void) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggle();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);
}
