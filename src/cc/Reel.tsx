import { useEffect, useState } from 'react';
import { ccArt } from '@/assets/registry';
import { cutoutLabel } from '@/lib/answerDisplay';

/**
 * One reel's spin: the symbols it rolls through in order, ending on where it
 * lands, and how long it takes. A one-symbol strip simply sits still.
 */
export type ReelRoll = { id: number; strip: readonly string[]; durationMs: number };

/** Fast off the mark, a long slow-down, and a slight overshoot that settles like a real reel. */
const EASE = 'cubic-bezier(0.12, 0.6, 0.25, 1.04)';

/**
 * A window onto a tall strip of symbols. The strip is drawn last-symbol-first
 * and slides down, so symbols fall past like a physical reel until the landing
 * symbol fills the window. Percentages keep it right at any reel size.
 */
export function Reel({ roll, won }: { roll: ReelRoll; won: boolean }) {
  const [rolling, setRolling] = useState(false);
  const count = roll.strip.length;
  const landed = roll.strip[count - 1];

  useEffect(() => {
    if (count < 2) {
      return;
    }

    // Two frames: the first paints the strip at its start, the second starts the slide.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setRolling(true));
    });

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [count]);

  const start = `translateY(-${((count - 1) / count) * 100}%)`;

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-card border-2 bg-paper-deep transition-colors ${
        won ? 'border-progress-100 shadow-lift' : 'border-ink'
      }`}
    >
      <div
        aria-hidden="true"
        style={{
          height: `${count * 100}%`,
          transform: rolling || count < 2 ? 'translateY(0)' : start,
          transition: rolling ? `transform ${roll.durationMs}ms ${EASE}` : 'none',
        }}
        className="absolute inset-x-0 top-0"
      >
        {[...roll.strip].reverse().map((symbol, index) => (
          <div key={index} style={{ height: `${100 / count}%` }} className="p-2">
            <img src={ccArt.symbols[symbol]} alt="" className="h-full w-full object-contain" />
          </div>
        ))}
      </div>
      <span className="sr-only">{cutoutLabel(landed)}</span>
    </div>
  );
}
