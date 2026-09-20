import type { ReactNode } from 'react';
import { tiltFor } from '@/lib/tilt';

type PaperCardProps = {
  children: ReactNode;
  /** Seeds a stable tilt. Pass an index or an id; omit for a square card. */
  tiltSeed?: number | string;
  className?: string;
};

export function PaperCard({ children, tiltSeed, className = '' }: PaperCardProps) {
  const rotate = tiltSeed === undefined ? undefined : tiltFor(tiltSeed);

  return (
    <div
      style={{ rotate }}
      className={`relative rounded-card border-2 border-paper-edge bg-paper p-5 shadow-lift ${className}`}
    >
      {children}
    </div>
  );
}
