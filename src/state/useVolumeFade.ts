import { useMemo, useRef, type RefObject } from 'react';

type VolumeFade = {
  /** Resolves once the volume arrives, and never if a newer fade or a cancel takes over. */
  to: (target: number, durationMs: number) => Promise<void>;
  cancel: () => void;
};

/**
 * Ramps an audio element's volume a frame at a time. iOS ignores volume changes
 * from script, so there the song simply starts and stops; the pause after a
 * fade-out still happens, because the ramp still runs to the end.
 */
export function useVolumeFade(audio: RefObject<HTMLAudioElement | null>): VolumeFade {
  const frame = useRef(0);

  return useMemo(() => {
    const cancel = () => cancelAnimationFrame(frame.current);

    const to = (target: number, durationMs: number) =>
      new Promise<void>((resolve) => {
        cancel();
        const element = audio.current;
        if (!element) {
          return resolve();
        }

        const start = element.volume;
        const began = performance.now();

        const step = (now: number) => {
          const progress = Math.min(1, (now - began) / durationMs);
          element.volume = start + (target - start) * progress;
          if (progress < 1) {
            frame.current = requestAnimationFrame(step);
          } else {
            resolve();
          }
        };

        frame.current = requestAnimationFrame(step);
      });

    return { to, cancel };
  }, [audio]);
}
