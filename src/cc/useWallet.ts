import { useCallback, useEffect, useState } from 'react';
import { loadWallet, saveWallet, type Wallet } from './wallet';

export type WalletActions = {
  wallet: Wallet;
  /** Takes the bet as the lever is pulled, so leaving mid-spin cannot dodge a loss. */
  placeBet: (bet: number) => void;
  /** Pays out once the reels land. */
  collectWinnings: (winnings: number) => void;
  recordTip: (tip: number) => void;
  markIntroSeen: () => void;
};

/** The wallet as React state, written back to its cookie on every change. */
export function useWallet(personId: string): WalletActions {
  const [wallet, setWallet] = useState(() => loadWallet(personId));

  useEffect(() => saveWallet(personId, wallet), [personId, wallet]);

  const placeBet = useCallback(
    (bet: number) => setWallet((current) => ({ ...current, coins: current.coins - bet, spins: current.spins + 1 })),
    [],
  );

  const collectWinnings = useCallback(
    (winnings: number) =>
      setWallet((current) => ({
        ...current,
        coins: current.coins + winnings,
        biggestWin: Math.max(current.biggestWin, winnings),
      })),
    [],
  );

  const recordTip = useCallback(
    (tip: number) =>
      setWallet((current) => ({
        ...current,
        coins: current.coins + tip,
        served: current.served + 1,
        tipsEarned: current.tipsEarned + tip,
      })),
    [],
  );

  const markIntroSeen = useCallback(() => setWallet((current) => ({ ...current, seenIntro: true })), []);

  return { wallet, placeBet, collectWinnings, recordTip, markIntroSeen };
}
