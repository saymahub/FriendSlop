import type { SongAnswer } from '@/config/questionTypes';
import { jsonp } from './jsonp';

type ItunesSong = {
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
};

const RESULTS = 6;

/** Songs with their 30-second preview, which is what the music player plays. */
export async function searchSongs(term: string): Promise<SongAnswer[]> {
  const query = new URLSearchParams({ term, media: 'music', entity: 'song', limit: String(RESULTS) });
  const reply = await jsonp<{ results: ItunesSong[] }>(`https://itunes.apple.com/search?${query}`);

  return reply.results.flatMap((song): SongAnswer[] =>
    song.trackName && song.artistName
      ? [
          {
            title: song.trackName,
            artist: song.artistName,
            // The API only hands out 100px art, but the same path serves any size asked for.
            artwork: song.artworkUrl100?.replace('100x100bb', '300x300bb'),
            previewUrl: song.previewUrl,
            itunesUrl: song.trackViewUrl,
          },
        ]
      : [],
  );
}
