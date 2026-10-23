import type { LookupResult } from './types';

type AniListAnime = {
  title: { english: string | null; romaji: string };
  format: string | null;
  seasonYear: number | null;
  coverImage: { extraLarge: string | null };
};

const RESULTS = 6;

/** Most popular first, so "Haikyu" finds the series before its spin-offs and recaps. */
const QUERY = `query ($search: String, $perPage: Int) {
  Page(perPage: $perPage) {
    media(search: $search, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
      title { english romaji }
      format
      seasonYear
      coverImage { extraLarge }
    }
  }
}`;

/** Anime covers from AniList, which needs no key and accepts requests from any site. */
export async function searchAnime(term: string): Promise<LookupResult[]> {
  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { search: term, perPage: RESULTS } }),
  });

  if (!response.ok) {
    throw new Error(`AniList search failed (${response.status})`);
  }

  const reply = (await response.json()) as { data?: { Page?: { media?: AniListAnime[] } } };

  return (reply.data?.Page?.media ?? []).flatMap((anime): LookupResult[] =>
    anime.coverImage.extraLarge
      ? [{ title: anime.title.english ?? anime.title.romaji, detail: detailOf(anime), image: anime.coverImage.extraLarge }]
      : [],
  );
}

/** "TV · 2020" or "Movie · 2001", to tell a series from its film. */
function detailOf(anime: AniListAnime): string | undefined {
  const parts = [anime.format && formatLabel(anime.format), anime.seasonYear?.toString()].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

/** AniList's TV, OVA and ONA are initialisms; MOVIE and TV_SHORT read better as "Movie" and "TV short". */
function formatLabel(format: string): string {
  const [first, ...rest] = format.split('_');
  const lead = first.length <= 3 ? first : first.charAt(0) + first.slice(1).toLowerCase();
  return [lead, ...rest.map((word) => word.toLowerCase())].join(' ');
}
