import { searchAnime } from './anilist';
import { searchArtists } from './deezer';
import { searchBooks } from './itunes';
import { searchPlaces } from './places';
import type { LookupResult } from './types';
import { searchWikipedia } from './wikipedia';

export type { LookupResult } from './types';

/**
 * Where a question looks for pictures. Apple Books has the cleanest covers,
 * Deezer the best artist photos and AniList the anime; Wikipedia covers the
 * rest, with a hint so "The Bear" finds the show before the animal.
 */
export type LookupSource = 'book' | 'artist' | 'film' | 'tvSeries' | 'anime' | 'place' | 'wikipedia';


const searchers: Record<LookupSource, (term: string) => Promise<LookupResult[]>> = {
  book: searchBooks,
  artist: searchArtists,
  film: (term) => searchWikipedia(`${term} film`),
  tvSeries: (term) => searchWikipedia(`${term} TV series`),
  anime: searchAnime,
  place: searchPlaces,
  wikipedia: searchWikipedia,
};

export function searchPictures(source: LookupSource, term: string): Promise<LookupResult[]> {
  return searchers[source](term);
}
