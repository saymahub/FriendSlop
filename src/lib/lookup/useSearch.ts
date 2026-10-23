import { useEffect, useState } from 'react';

/** Long enough that a search fires when typing pauses, not on every key. */
const DEBOUNCE_MS = 400;
const MINIMUM_TERM = 2;

/**
 * How long to wait before one quiet second try. Most failures are a brief
 * rate limit or a dropped request, and a retry this soon often lands.
 */
const RETRY_AFTER_MS = 2000;

export type SearchState<T> =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'done'; results: T[] }
  | { status: 'failed' };

/**
 * Searches as someone types, once they pause. A failed search is retried once,
 * still showing as searching, before it is reported. A reply that arrives after
 * the term has changed is dropped, so a slow search never overwrites a newer one.
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
    let retry = 0;

    const attempt = (isRetry: boolean) =>
      search(trimmed)
        .then((results) => current && setState({ status: 'done', results }))
        .catch(() => {
          if (!current) {
            return;
          }
          if (isRetry) {
            setState({ status: 'failed' });
          } else {
            retry = window.setTimeout(() => attempt(true), RETRY_AFTER_MS);
          }
        });

    const timer = window.setTimeout(() => {
      setState({ status: 'searching' });
      void attempt(false);
    }, DEBOUNCE_MS);

    return () => {
      current = false;
      window.clearTimeout(timer);
      window.clearTimeout(retry);
    };
  }, [search, trimmed, active]);

  return state;
}
