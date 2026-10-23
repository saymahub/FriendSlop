import { jsonp } from './jsonp';
import type { LookupResult } from './types';

type DeezerArtist = { name: string; nb_fan: number; picture_xl?: string };

const RESULTS = 6;

/** Deezer serves a grey silhouette, at a path with an empty image id, for artists with no photo. */
const NO_PHOTO = '/images/artist//';

const fans = new Intl.NumberFormat('en', { notation: 'compact' });

/**
 * Artist photos from Deezer, which needs no key. It sends no CORS header for an
 * anonymous browser, so this goes through JSONP like the iTunes search. Fan
 * counts tell the real artist apart from a namesake with a few dozen listeners.
 */
export async function searchArtists(term: string): Promise<LookupResult[]> {
  const query = new URLSearchParams({ q: term, limit: String(RESULTS * 2), output: 'jsonp' });
  const reply = await jsonp<{ data?: DeezerArtist[] }>(`https://api.deezer.com/search/artist?${query}`);

  return (reply.data ?? [])
    .filter((artist): artist is DeezerArtist & { picture_xl: string } =>
      Boolean(artist.picture_xl && !artist.picture_xl.includes(NO_PHOTO)),
    )
    .slice(0, RESULTS)
    .map((artist) => ({ title: artist.name, detail: `${fans.format(artist.nb_fan)} fans`, image: artist.picture_xl }));
}
