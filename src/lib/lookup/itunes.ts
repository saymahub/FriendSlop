import { jsonp } from './jsonp';
import type { LookupResult } from './types';

type ItunesBook = { trackName?: string; artistName?: string; artworkUrl100?: string };

const RESULTS = 6;

/**
 * Book covers from Apple Books. Its film and TV catalogue only holds what Apple
 * sells, which misses too much, so those go to Wikipedia instead.
 */
export async function searchBooks(term: string): Promise<LookupResult[]> {
  const query = new URLSearchParams({ term, media: 'ebook', entity: 'ebook', limit: String(RESULTS * 2) });
  const reply = await jsonp<{ results: ItunesBook[] }>(`https://itunes.apple.com/search?${query}`);

  return dedupe(reply.results.map(toResult)).slice(0, RESULTS);
}

function toResult(book: ItunesBook): LookupResult | undefined {
  if (!book.trackName || !book.artworkUrl100) {
    return undefined;
  }

  return {
    title: book.trackName,
    detail: book.artistName,
    // The API only hands out 100px art, but the same path serves any size asked for.
    image: book.artworkUrl100.replace('100x100bb', '600x600bb'),
  };
}

/** The same book comes back once per edition; one entry per title and author is plenty. */
function dedupe(results: (LookupResult | undefined)[]): LookupResult[] {
  const seen = new Set<string>();

  return results.filter((result): result is LookupResult => {
    const key = `${result?.title}|${result?.detail}`.toLowerCase();
    if (!result || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
