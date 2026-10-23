import { useEffect, useState } from 'react';

/** Long enough that a search fires when typing pauses, not on every key. */
const DEBOUNCE_MS = 400;
const MINIMUM_TERM = 2;

export type SearchState<T> =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'done'; results: T[] }
  | { status: 'failed' };

/**
 * Searches as someone types, once they pause. A reply that arrives after the
 * term has changed is dropped, so a slow search never overwrites a newer one.
 * `search` must keep the same identity between renders, or every render searches.
 */
export function useSearch<T>(search: (term: string) => Promise<T[]>, term: string, enabled: boolean): SearchState<T> {
  const [state, setState] = useState<SearchState<T>>({ status: 'idle' });
  const trimmed = term.trim();
  const active = enabled && trimmed.length >= MINIMUM_TERM;

  useEffect(() => {
    if (!active) {
      setState({ status: 'idle' });
      return;
    }

    let current = true;
    const timer = window.setTimeout(() => {
      setState({ status: 'searching' });
      search(trimmed)
        .then((results) => current && setState({ status: 'done', results }))
        .catch(() => current && setState({ status: 'failed' }));
    }, DEBOUNCE_MS);

    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [search, trimmed, active]);

  return state;
}
