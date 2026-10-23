import type { SongAnswer } from '@/config/questionTypes';
import { jsonp } from './jsonp';

type ItunesSong = {
  artistId?: number;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
};

const RESULTS = 6;

const ARTIST_CATALOGUE = 200;

/**
 * Songs with their 30-second preview, which is what the music player plays.
 */
export async function searchSongs(term: string): Promise<SongAnswer[]> {
  const query = new URLSearchParams({ term, media: 'music', entity: 'song', limit: String(RESULTS) });
  const found = (await jsonp<{ results: ItunesSong[] }>(`https://itunes.apple.com/search?${query}`)).results;
  const missed = await titlesFromTopArtist(found, term);

  return withoutRepeats([...missed, ...found]).slice(0, RESULTS).flatMap(toAnswer);
}

/** A catalogue lookup failing is not worth failing the search over. */
async function titlesFromTopArtist(found: ItunesSong[], term: string): Promise<ItunesSong[]> {
  const artistId = found.find((song) => song.artistId)?.artistId;

  if (!artistId) {
    return [];
  }

  try {
    const query = new URLSearchParams({ id: String(artistId), entity: 'song', limit: String(ARTIST_CATALOGUE) });
    const reply = await jsonp<{ results: ItunesSong[] }>(`https://itunes.apple.com/lookup?${query}`);
    return reply.results.filter((song) => song.trackName && titleIsIn(song.trackName, term));
  } catch {
    return [];
  }
}

/** Every word of the title, ignoring anything in brackets, appears in what was typed. */
function titleIsIn(title: string, term: string): boolean {
  const typed = new Set(wordsOf(term));
  const titleWords = wordsOf(title.replace(/\(.*?\)|\[.*?\]/g, ''));
  return titleWords.length > 0 && titleWords.every((word) => typed.has(word));
}

function wordsOf(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

function withoutRepeats(songs: ItunesSong[]): ItunesSong[] {
  const seen = new Set<string>();

  return songs.filter((song) => {
    const key = `${song.trackName}|${song.artistName}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function toAnswer(song: ItunesSong): SongAnswer[] {
  if (!song.trackName || !song.artistName) {
    return [];
  }

  return [
    {
      title: song.trackName,
      artist: song.artistName,
      // The API only hands out 100px art, but the same path serves any size asked for.
      artwork: song.artworkUrl100?.replace('100x100bb', '300x300bb'),
      previewUrl: song.previewUrl,
      itunesUrl: song.trackViewUrl,
    },
  ];
}
