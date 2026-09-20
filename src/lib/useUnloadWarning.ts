import { useEffect } from 'react';

/**
 * Asks the browser to confirm before a tab closes or reloads with unsaved work.
 *
 * The wording is the browser's own and cannot be set from here, so this covers
 * closing the tab only. Leaving by a link is handled in the app, where the
 * choice can actually be Save or Discard.
 */
export function useUnloadWarning(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [enabled]);
}
