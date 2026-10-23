import { useState } from 'react';
import { CloseIcon } from '@/components/icons';
import type { SongAnswer, SongQuestion } from '@/config/questionTypes';
import { isSongAnswer } from '@/lib/answerDisplay';
import { searchSongs } from '@/lib/lookup/songs';
import { useSearch } from '@/lib/lookup/useSearch';
import { SearchMatches, type Match } from './SearchMatches';
import type { QuestionProps } from './types';

const FIELD = 'w-full rounded-card border-2 border-paper-edge bg-paper px-3 py-2 text-base placeholder:text-ghost';
const LINK = 'min-h-11 text-sm text-ink-soft underline';

const toMatch = (song: SongAnswer): Match => ({
  key: `${song.title}-${song.artist}-${song.previewUrl}`,
  title: song.title,
  detail: song.artist,
  image: song.artwork,
});

/**
 * Search iTunes and pick, which brings the artwork and the preview the music
 * player needs. Anything search cannot find can be typed in instead: a complete
 * answer, just one with nothing to play.
 */
export function SongSearch({ value, onChange }: QuestionProps<SongQuestion>) {
  const song = isSongAnswer(value) ? value : undefined;
  const [typing, setTyping] = useState(song !== undefined && !song.previewUrl);

  return typing ? (
    <TypedSong song={song} onChange={onChange} onSearch={() => setTyping(false)} />
  ) : (
    <FoundSong song={song} onChange={onChange} onType={() => setTyping(true)} />
  );
}

type FoundSongProps = { song: SongAnswer | undefined; onChange: (song: SongAnswer) => void; onType: () => void };

function FoundSong({ song, onChange, onType }: FoundSongProps) {
  const [term, setTerm] = useState('');
  const results = useSearch(searchSongs, term, true);

  const choose = (picked: SongAnswer) => {
    onChange(picked);
    setTerm('');
  };

  return (
    <div>
      {song && <ChosenSong song={song} />}
      <div className="relative">
        <input
          type="search"
          value={term}
          placeholder={song ? 'Search for a different song' : 'Take Me To Church'}
          aria-label="Search for a song"
          onChange={(event) => setTerm(event.target.value)}
          className={`${FIELD} pr-11`}
        />
        {term && (
          <button
            type="button"
            onClick={() => setTerm('')}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center text-faded hover:text-ink"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <SearchMatches state={results} toMatch={toMatch} onChoose={choose} />
      <button type="button" onClick={onType} className={LINK}>
        Can&rsquo;t find it? Type it in
      </button>
    </div>
  );
}

function ChosenSong({ song }: { song: SongAnswer }) {
  return (
    <div className="mb-2 flex items-center gap-3 rounded-card border-2 border-ink bg-paper p-2">
      {song.artwork && <img src={song.artwork} alt="" className="h-12 w-12 rounded-photo object-cover" />}
      <span className="min-w-0">
        <span className="block font-bold text-ink">{song.title}</span>
        <span className="block truncate text-sm text-faded">{song.artist}</span>
      </span>
    </div>
  );
}

type TypedSongProps = { song: SongAnswer | undefined; onChange: (song: SongAnswer) => void; onSearch: () => void };

/** Typing replaces any picked song, so the artwork and preview of the old one go too. */
function TypedSong({ song, onChange, onSearch }: TypedSongProps) {
  const typed = { title: song?.title ?? '', artist: song?.artist ?? '' };
  const update = (field: 'title' | 'artist', text: string) => onChange({ ...typed, [field]: text });

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={typed.title}
          placeholder="Take Me To Church"
          aria-label="Song title"
          onChange={(event) => update('title', event.target.value)}
          className={FIELD}
        />
        <input
          type="text"
          value={typed.artist}
          placeholder="Hozier"
          aria-label="Artist"
          onChange={(event) => update('artist', event.target.value)}
          className={FIELD}
        />
      </div>
      <button type="button" onClick={onSearch} className={LINK}>
        Search instead
      </button>
    </div>
  );
}
