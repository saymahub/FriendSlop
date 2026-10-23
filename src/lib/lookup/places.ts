import type { LookupResult } from './types';
import { findPages, withoutQualifier } from './wikipedia';

const RESULTS = 6;

/** Wide enough that the square crop of a 7:1 banner is still sharp on a phone. */
const BANNER_WIDTH = 1200;

/** Ranks real places above songs, films and bands that share their name. */
const PLACE = /country|city|capital|island|town|region|province|state|municipality|archipelago|village/i;

/**
 * A country's Wikipedia picture is usually its flag. Wikivoyage gives every
 * destination a scenic banner photo, recorded on Wikidata, so places use that
 * and fall back to the Wikipedia picture only when a page has no banner.
 */
export async function searchPlaces(term: string): Promise<LookupResult[]> {
  const pages = await findPages(term, PLACE);
  const banners = await bannersFor(pages.map((page) => page.wikidataId).filter((id): id is string => !!id));

  return pages
    .flatMap((page): LookupResult[] => {
      const image = (page.wikidataId && banners.get(page.wikidataId)) || page.thumbnail;
      return image ? [{ title: withoutQualifier(page.title), detail: page.description, image }] : [];
    })
    .slice(0, RESULTS);
}

/**
 * Banner file for each Wikidata id that has one (property P948), in one query.
 * A failed lookup is not worth failing the search over: it returns no banners,
 * and the Wikipedia pictures stand in.
 */
async function bannersFor(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) {
    return new Map();
  }

  const sparql = `SELECT ?item ?banner WHERE { VALUES ?item { ${ids.map((id) => `wd:${id}`).join(' ')} } ?item wdt:P948 ?banner }`;
  const query = new URLSearchParams({ query: sparql, format: 'json' });

  try {
    const response = await fetch(`https://query.wikidata.org/sparql?${query}`);
    const reply = (await response.json()) as { results: { bindings: { item: { value: string }; banner: { value: string } }[] } };

    return new Map(
      reply.results.bindings.map((row) => [row.item.value.split('/').pop() ?? '', sizedBanner(row.banner.value)]),
    );
  } catch {
    return new Map();
  }
}

/** Wikidata hands back an http link to the full file; this asks for a sized https copy. */
function sizedBanner(fileUrl: string): string {
  return `${fileUrl.replace(/^http:/, 'https:')}?width=${BANNER_WIDTH}`;
}
