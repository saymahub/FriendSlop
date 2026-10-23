import type { ReactNode } from 'react';
import { tiltFor } from '@/lib/tilt';

type PolaroidProps = {
  caption: string;
  children: ReactNode;
  tiltSeed?: number | string;
};

/**
 * Caption sizes by length, longest first. Most captions are a word or two; three
 * long flower names ("Lily of the valley, Bleeding heart & Cherry blossom") need
 * the smallest size and a third line to be read in full.
 */
const CAPTION_SIZES = [
  { over: 34, size: 'text-hand-2xs line-clamp-3' },
  { over: 16, size: 'text-hand-xs line-clamp-2' },
] as const;

const SHORT_CAPTION = 'text-hand-sm line-clamp-2';

/**
 * A photo with a handwritten caption that steps down a size as it gets longer, so
 * the frame keeps its shape for all but the very longest.
 */
export function Polaroid({ caption, children, tiltSeed = caption }: PolaroidProps) {
  const size = CAPTION_SIZES.find((step) => caption.length > step.over)?.size ?? SHORT_CAPTION;

  return (
    <figure style={{ rotate: tiltFor(tiltSeed) }} className="w-44 bg-white p-2 pb-1 shadow-lift">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-photo bg-paper-deep">
        {children}
      </div>
      <figcaption title={caption} className={`font-hand py-2 text-center leading-tight text-ink-soft ${size}`}>
        {caption}
      </figcaption>
    </figure>
  );
}
