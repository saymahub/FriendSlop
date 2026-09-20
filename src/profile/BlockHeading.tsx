import type { ReactNode } from 'react';
import { HandLabel } from '@/components/primitives';

/**
 * Every block heading on a profile. One component so the sections cannot drift
 * apart as the page grows.
 */
export function BlockHeading({ children }: { children: ReactNode }) {
  return (
    <HandLabel size="lg" className="mb-3 block">
      {children}
    </HandLabel>
  );
}
