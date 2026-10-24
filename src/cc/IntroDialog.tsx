import { useEffect } from 'react';
import { Button, HandLabel } from '@/components/primitives';
import { STARTING_COINS } from './config';

/**
 * What Millie's CC is, and the one thing people must know before they get
 * attached to their coins: they live in a cookie on this device only.
 */
export function IntroDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-intro-title"
        className="w-full max-w-sm rounded-card border-2 border-paper-edge bg-paper p-5 shadow-lift"
      >
        <HandLabel as="h2" size="lg" className="block text-center">
          <span id="cc-intro-title">Welcome to Millie&rsquo;s Casino &amp; Cafe</span>
        </HandLabel>

        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          <li>You start with {STARTING_COINS} coins.</li>
          <li>
            <span className="font-bold text-ink">Slots:</span> pick a bet and spin. Three of a kind pays big, and one
            special symbol pays a jackpot. A pair gets your bet back.
          </li>
          <li>
            <span className="font-bold text-ink">Café:</span> open up, then tap the drink or food each customer
            ordered before they lose patience. Faster service, bigger tips.
          </li>
        </ul>

        <p className="mt-3 rounded-card border-2 border-avoid-ink/30 bg-avoid/60 p-3 text-sm text-avoid-ink">
          Your coins are saved in a cookie on this device only. Clearing your cookies or browsing data, or playing on
          another device, starts you back at {STARTING_COINS}.
        </p>

        <Button autoFocus variant="keep" onClick={onClose} className="mt-4 w-full">
          Let&rsquo;s play
        </Button>
      </div>
    </div>
  );
}
