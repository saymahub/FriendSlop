import type { SongAnswer, SongQuestion } from '@/config/questionTypes';
import type { QuestionProps } from './types';

const FIELD = 'w-full rounded-card border-2 border-paper-edge bg-paper px-3 py-2 text-base placeholder:text-ghost';

/**
 * Manual entry only, which is the fallback the search dropdown will sit on top
 * of. The iTunes lookup arrives with the music player in step 5; until then a
 * typed title and artist is a complete answer, just without artwork.
 */
export function SongSearch({ value, onChange }: QuestionProps<SongQuestion>) {
  const song = isSong(value) ? value : { title: '', artist: '' };

  const update = (field: 'title' | 'artist', text: string) => onChange({ ...song, [field]: text });

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input
        type="text"
        value={song.title}
        placeholder="Take Me To Church"
        aria-label="Song title"
        onChange={(event) => update('title', event.target.value)}
        className={FIELD}
      />
      <input
        type="text"
        value={song.artist}
        placeholder="Hozier"
        aria-label="Artist"
        onChange={(event) => update('artist', event.target.value)}
        className={FIELD}
      />
    </div>
  );
}

function isSong(value: unknown): value is SongAnswer {
  return typeof value === 'object' && value !== null && 'title' in value;
}
