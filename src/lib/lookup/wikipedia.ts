import type { LookupResult } from './types';

type RawPage = {
  title: string;
  index: number;
  description?: string;
  thumbnail?: { source: string };
  pageprops?: { wikibase_item?: string };
};

/** A search match, already ranked, with the Wikidata id other sources key on. */
export type WikipediaPage = { title: string; description?: string; thumbnail?: string; wikidataId?: string };

const RESULTS = 6;

/**
 * Article search with each page's lead image. Pages with no picture are dropped:
 * a typed answer already covers those.
 */
export async function searchWikipedia(term: string, preferred?: RegExp): Promise<LookupResult[]> {
  const pages = await findPages(term, preferred);

  return pages
    .filter((page): page is WikipediaPage & { thumbnail: string } => page.thumbnail !== undefined)
    .slice(0, RESULTS)
    .map((page) => ({ title: withoutQualifier(page.title), detail: page.description, image: page.thumbnail }));
}

/**
 * Ranked search matches in one keyless request. `origin=*` is what makes
 * Wikipedia send the CORS header an anonymous browser read needs.
 *
 * `preferred` floats pages whose description matches it to the top without
 * dropping the rest, so a loose match is still there when the pattern misses.
 */
export async function findPages(term: string, preferred?: RegExp): Promise<WikipediaPage[]> {
  const query = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    redirects: '1',
    generator: 'search',
    gsrsearch: term,
    gsrlimit: String(RESULTS * 2),
    prop: 'pageimages|description|pageprops',
    ppprop: 'wikibase_item',
    piprop: 'thumbnail',
    // Posters and game covers are fair-use images, which are left out unless asked for.
    pilicense: 'any',
    pithumbsize: '600',
  });

  const response = await fetch(`https://en.wikipedia.org/w/api.php?${query}`);

  if (!response.ok) {
    throw new Error(`Wikipedia search failed (${response.status})`);
  }

  const reply = (await response.json()) as { query?: { pages?: Record<string, RawPage> } };

  return Object.values(reply.query?.pages ?? {})
    .sort((left, right) => matches(right, preferred) - matches(left, preferred) || left.index - right.index)
    .map((page) => ({
      title: page.title,
      description: page.description,
      thumbnail: page.thumbnail?.source,
      wikidataId: page.pageprops?.wikibase_item,
    }));
}

function matches(page: RawPage, preferred: RegExp | undefined): number {
  return preferred?.test(page.description ?? '') ? 1 : 0;
}

/** "The Bear (TV series)" reads as "The Bear" on a polaroid; the description tells matches apart. */
export function withoutQualifier(title: string): string {
  return title.replace(/\s*\([^)]*\)$/, '');
}
