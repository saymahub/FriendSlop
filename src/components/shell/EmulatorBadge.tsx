import { usingEmulators } from '@/lib/firebase';

/**
 * Says loudly which database is in play. Editing the live data while believing
 * it is fake is the one mistake this setup makes easy.
 */
export function EmulatorBadge() {
  if (!usingEmulators) {
    return null;
  }

  return (
    <div className="fixed top-0 left-1/2 z-50 -translate-x-1/2 rounded-b border-2 border-t-0 border-keep-ink bg-keep px-3 py-1 text-xs font-bold text-keep-ink">
      local emulator data
    </div>
  );
}
