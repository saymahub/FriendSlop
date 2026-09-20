import type { ReactNode } from 'react';
import { tiltFor } from '@/lib/tilt';

type PolaroidProps = {
  caption: string;
  children: ReactNode;
  tiltSeed?: number | string;
};

export function Polaroid({ caption, children, tiltSeed = caption }: PolaroidProps) {
  return (
    <figure style={{ rotate: tiltFor(tiltSeed) }} className="w-44 bg-white p-2 pb-1 shadow-lift">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-photo bg-paper-deep">
        {children}
      </div>
      <figcaption className="font-hand py-2 text-center text-hand-sm text-ink-soft">{caption}</figcaption>
    </figure>
  );
}
