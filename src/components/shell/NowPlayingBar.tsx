import { swatchVariables } from '@/config/swatches';
import { useMusic } from '@/state/MusicContext';

const CONTROL =
  'flex min-h-11 min-w-11 items-center justify-center rounded-card border-2 border-paper-edge bg-paper text-lg';

/**
 * Pinned to the bottom of a profile while it has a song, clear of the iPhone home
 * bar, and outlined in that person's colour. It sits outside the profile page, so
 * it sets the colour variables itself rather than inheriting them. Play and mute
 * are labelled for screen readers; the symbols are for eyes.
 */
export function NowPlayingBar() {
  const { track, playing, muted, togglePlay, toggleMute } = useMusic();

  if (!track) {
    return null;
  }

  const { song, ownerName, colour } = track;

  return (
    <div
      style={swatchVariables(colour)}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-card border-[3px] border-[var(--person-base)] bg-paper p-2 shadow-lift">
        {song.artwork ? (
          <img src={song.artwork} alt="" className="h-11 w-11 shrink-0 rounded-photo object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center text-2xl">
            &#9835;
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{song.title}</p>
          <p className="truncate text-xs text-faded">
            {song.artist} &middot; {ownerName}&rsquo;s song
          </p>
        </div>

        {song.previewUrl ? (
          <>
            <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className={CONTROL}>
              <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : `Play ${song.title}`}
              className={`${CONTROL} border-ink bg-keep text-keep-ink`}
            >
              <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
            </button>
          </>
        ) : (
          <span className="shrink-0 text-xs text-faded">No preview</span>
        )}
      </div>
    </div>
  );
}
