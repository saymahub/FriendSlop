import type { ReactNode } from 'react';
import { tiltFor } from '@/lib/tilt';

type PolaroidProps = {
  caption: string;
  children: ReactNode;
  tiltSeed?: number | string;
};

/** Past this, a caption drops a size so it fits the frame in two lines. */
const LONG_CAPTION = 16;

/**
 * A photo with a handwritten caption. A long caption, such as three flower names,
 * steps down a size and never runs past two lines, so the frame stays its shape.
 */
export function Polaroid({ caption, children, tiltSeed = caption }: PolaroidProps) {
  const size = caption.length > LONG_CAPTION ? 'text-hand-xs' : 'text-hand-sm';

  return (
    <figure style={{ rotate: tiltFor(tiltSeed) }} className="w-44 bg-white p-2 pb-1 shadow-lift">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-photo bg-paper-deep">
        {children}
      </div>
      <figcaption title={caption} className={`font-hand line-clamp-2 py-2 text-center leading-tight text-ink-soft ${size}`}>
        {caption}
      </figcaption>
    </figure>
  );
}
