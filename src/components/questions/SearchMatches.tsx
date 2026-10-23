import type { SearchState } from '@/lib/lookup/useSearch';

/** One row in a results list: what it is called, a line to tell it apart, and its picture. */
export type Match = { key: string; title: string; detail?: string; image?: string };

type SearchMatchesProps<T> = {
  state: SearchState<T>;
  toMatch: (result: T) => Match;
  onChoose: (result: T) => void;
};

/**
 * The dropdown under a search field. Every outcome says something, and a failed
 * or empty search says that what was typed still counts, so nobody is stuck.
 */
export function SearchMatches<T>({ state, toMatch, onChoose }: SearchMatchesProps<T>) {
  if (state.status === 'searching') {
    return <p className="mt-2 text-sm text-faded">Searching…</p>;
  }

  if (state.status === 'failed') {
    // Usually Apple's limit of about twenty searches a minute per connection, which
    // a few people on the same Wi-Fi reach quickly. It clears on its own.
    return (
      <p className="mt-2 text-sm text-faded">
        Search isn't working for some reason, come back later or try a new device.
      </p>
    );
  }

  if (state.status !== 'done') {
    return null;
  }

  if (state.results.length === 0) {
    return <p className="mt-2 text-sm text-faded">Nothing found. What you typed still counts.</p>;
  }

  return (
    // About four rows show at once; the rest scroll inside the list, which keeps
    // the page itself from jumping as results come and go.
    <ul className="mt-2 max-h-64 divide-y divide-paper-edge overflow-y-auto overscroll-contain rounded-card border-2 border-paper-edge bg-paper">
      {state.results.map((result) => {
        const match = toMatch(result);

        return (
          <li key={match.key}>
            <button
              type="button"
              onClick={() => onChoose(result)}
              className="flex min-h-11 w-full items-center gap-3 px-2 py-1.5 text-left hover:bg-paper-deep"
            >
              {match.image && <img src={match.image} alt="" className="h-12 w-12 shrink-0 rounded-photo object-cover" />}
              <span className="min-w-0">
                <span className="block font-bold text-ink">{match.title}</span>
                {match.detail && <span className="block truncate text-xs text-faded">{match.detail}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
