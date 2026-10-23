import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SongAnswer } from '@/config/questionTypes';
import type { SwatchId } from '@/config/swatches';
import { useVolumeFade } from './useVolumeFade';

/** The song a profile offers, whose page it belongs to, and that page's colour. */
export type Track = { song: SongAnswer; ownerName: string; colour: SwatchId };

/**
 * Previews are mastered loud, and full volume on a phone speaker is a shock in a
 * quiet room. Someone who wants it louder still has their volume buttons.
 */
const PLAYBACK_VOLUME = 0.35;

/** Quick enough to feel instant on a tap; only leaving a page gets the slow fade. */
const FADE_IN_MS = 250;
const FADE_OUT_ON_LEAVE_MS = 700;

type MusicContextValue = {
  track: Track | undefined;
  playing: boolean;
  muted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  offer: (track: Track) => void;
  withdraw: (track: Track) => void;
};

const MusicContext = createContext<MusicContextValue | undefined>(undefined);

/**
 * The one `<audio>` element, above the router so a page change never unmounts it
 * mid-fade. Nothing here plays on its own: a profile offers its song, a tap
 * starts it, and leaving the profile fades it out. Mute flips `audio.muted`
 * rather than the volume, which the fades own.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const current = useRef<Track | undefined>(undefined);
  const [track, setTrack] = useState<Track>();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const fade = useVolumeFade(audio);

  const offer = useCallback(
    (next: Track) => {
      const element = audio.current;
      fade.cancel();
      element?.pause();
      if (element) {
        element.src = next.song.previewUrl ?? '';
      }
      current.current = next;
      setTrack(next);
    },
    [fade],
  );

  const withdraw = useCallback(
    (leaving: Track) => {
      if (current.current !== leaving) {
        return;
      }
      current.current = undefined;
      setTrack(undefined);
      void fade.to(0, FADE_OUT_ON_LEAVE_MS).then(() => audio.current?.pause());
    },
    [fade],
  );

  const togglePlay = useCallback(() => {
    const element = audio.current;
    if (!element?.src) {
      return;
    }
    if (element.paused) {
      element.volume = 0;
      element.play().then(() => fade.to(PLAYBACK_VOLUME, FADE_IN_MS), () => setPlaying(false));
    } else {
      fade.cancel();
      element.pause();
    }
  }, [fade]);

  const toggleMute = useCallback(() => setMuted((was) => !was), []);

  useEffect(() => {
    if (audio.current) {
      audio.current.muted = muted;
    }
  }, [muted]);

  const value = useMemo(
    () => ({ track, playing, muted, togglePlay, toggleMute, offer, withdraw }),
    [track, playing, muted, togglePlay, toggleMute, offer, withdraw],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audio}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextValue {
  const value = useContext(MusicContext);
  if (!value) {
    throw new Error('useMusic must be used inside <MusicProvider>.');
  }
  return value;
}

/**
 * Offers a profile's song while the profile is on screen, and fades it out when
 * they leave. Typed songs with no preview are still offered, so the bar can show
 * what the song is even with nothing to play. Offering also starts the preview
 * downloading, so the first tap on play starts the song straight away.
 */
export function useSongOnPage(song: SongAnswer | undefined, ownerName: string, colour: SwatchId): void {
  const { offer, withdraw } = useMusic();

  useEffect(() => {
    if (!song) {
      return;
    }
    const track = { song, ownerName, colour };
    offer(track);
    return () => withdraw(track);
  }, [song, ownerName, colour, offer, withdraw]);
}
