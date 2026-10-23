import { useState, type CSSProperties } from 'react';
import { tapeNames, tapes, type TapeName } from '@/assets/registry';

type TapeProps = {
  /**
   * Where the strip sits relative to the card it decorates, `inline` to lie across
   * the page as a divider, or `loose` to leave size and angle to the caller.
   */
  placement?: 'top-left' | 'top-right' | 'top-centre' | 'inline' | 'loose';
  /** A particular pattern. Without one, each tape picks one at random. */
  pattern?: TapeName;
  className?: string;
  style?: CSSProperties;
};

const PLACEMENTS = {
  'top-left': 'absolute w-24 -top-3 left-5 -rotate-6',
  'top-right': 'absolute w-24 -top-3 right-5 rotate-6',
  'top-centre': 'absolute w-24 -top-3 left-1/2 -translate-x-1/2 -rotate-2',
  inline: 'mx-auto block w-56 max-w-full -rotate-1',
  loose: 'block',
} as const;

const randomPattern = (): TapeName => tapeNames[Math.floor(Math.random() * tapeNames.length)];

/**
 * A strip of washi tape holding a card down, slightly see-through as real washi
 * is. The random pattern is chosen once when the tape appears and kept, so it
 * never swaps mid-visit; a fresh visit gets a fresh roll.
 */
export function Tape({ placement = 'top-centre', pattern, className = '', style }: TapeProps) {
  const [chosen] = useState(() => pattern ?? randomPattern());

  return (
    <img
      src={tapes[chosen]}
      alt=""
      aria-hidden="true"
      style={style}
      className={`pointer-events-none opacity-90 drop-shadow-sm ${PLACEMENTS[placement]} ${className}`}
    />
  );
}
