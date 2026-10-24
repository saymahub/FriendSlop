import { useState } from 'react';
import { ccExtras } from '@/assets/registry';
import { HandLabel, PaperCard } from '@/components/primitives';
import { CafeCounter } from '@/cc/CafeCounter';
import { IntroDialog } from '@/cc/IntroDialog';
import { SlotMachine } from '@/cc/SlotMachine';
import { useWallet } from '@/cc/useWallet';
import type { Wallet } from '@/cc/wallet';
import { useViewer } from '@/state/ViewerContext';

/**
 * Millie's CC: slots to spend coins, a café to earn them. Coins and stats live in
 * a cookie, never in Firestore, so nothing here touches anyone's page.
 */
export function MilliesCC() {
  const { viewer } = useViewer();

  if (viewer.kind !== 'member') {
    throw new Error("Millie's CC rendered for a viewer who has not claimed a card");
  }

  return <Arcade personId={viewer.personId} />;
}

function Arcade({ personId }: { personId: string }) {
  const { wallet, placeBet, collectWinnings, recordTip, markIntroSeen } = useWallet(personId);
  const [rereading, setRereading] = useState(false);

  const closeIntro = () => {
    markIntroSeen();
    setRereading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <HandLabel as="h1" size="hero" face="title" className="block">
          Millie&rsquo;s <span className="block sm:inline">Casino &amp; Cafe</span>
        </HandLabel>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-chip border-2 border-ink bg-paper px-3 py-1 font-bold tabular-nums text-ink">
            {wallet.coins}
            <img src={ccExtras.coin} alt="coins" className="h-5 w-5" />
          </span>
          <button
            type="button"
            onClick={() => setRereading(true)}
            aria-label="How to play"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-paper-edge bg-paper font-bold text-ink-soft"
          >
            ?
          </button>
        </div>
      </header>

      <SlotMachine coins={wallet.coins} onBet={placeBet} onWin={collectWinnings} />
      <CafeCounter onTip={recordTip} />
      <Stats wallet={wallet} />

      {(!wallet.seenIntro || rereading) && <IntroDialog onClose={closeIntro} />}
    </div>
  );
}

function Stats({ wallet }: { wallet: Wallet }) {
  const rows = [
    { label: 'Spins', value: wallet.spins },
    { label: 'Biggest win', value: wallet.biggestWin },
    { label: 'Orders served', value: wallet.served },
    { label: 'Tips earned', value: wallet.tipsEarned },
  ];

  return (
    <PaperCard>
      <HandLabel as="h2" size="lg" className="mb-2 block">
        Your stats
      </HandLabel>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-faded">{row.label}</dt>
            <dd className="text-lg font-bold tabular-nums text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </PaperCard>
  );
}
