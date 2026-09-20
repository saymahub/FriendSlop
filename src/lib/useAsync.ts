import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; value: T }
  | { status: 'failed'; message: string };

/**
 * Runs a promise and reports where it got to, so screens can say "loading" and
 * "that did not work" instead of flashing an empty page.
 *
 * Results arriving after the inputs changed are dropped, which is what stops a
 * slow read overwriting a fast one with stale data.
 */
export function useAsync<T>(run: () => Promise<T>, deps: unknown[]): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    let current = true;
    setState({ status: 'loading' });

    run()
      .then((value) => {
        if (current) {
          setState({ status: 'ready', value });
        }
      })
      .catch((error: unknown) => {
        if (current) {
          setState({ status: 'failed', message: describe(error) });
        }
      });

    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  return { ...state, reload };
}

function describe(error: unknown): string {
  if (error instanceof Error && error.message.includes('permission')) {
    return 'You are not allowed to see this yet.';
  }

  return 'Could not load that. Check your connection and try again.';
}
