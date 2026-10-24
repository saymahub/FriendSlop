import { readCookie, writeCookie } from '@/lib/cookies';
import { STARTING_COINS } from './config';

/** Someone's coins and game history. Lives only in a cookie on this device. */
export type Wallet = {
  coins: number;
  spins: number;
  biggestWin: number;
  served: number;
  tipsEarned: number;
  seenIntro: boolean;
};

export const FRESH_WALLET: Wallet = {
  coins: STARTING_COINS,
  spins: 0,
  biggestWin: 0,
  served: 0,
  tipsEarned: 0,
  seenIntro: false,
};

/** One cookie per person, because the group shares phones and each keeps their own coins. */
const cookieName = (personId: string) => `millies-cc-${personId}`;

/** A cookie that is missing, edited or from an older version reads as a fresh wallet field by field. */
export function loadWallet(personId: string): Wallet {
  const stored = readCookie<Partial<Wallet>>(cookieName(personId), {});
  const number = (value: unknown, fallback: number) =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;

  return {
    coins: number(stored.coins, FRESH_WALLET.coins),
    spins: number(stored.spins, 0),
    biggestWin: number(stored.biggestWin, 0),
    served: number(stored.served, 0),
    tipsEarned: number(stored.tipsEarned, 0),
    seenIntro: stored.seenIntro === true,
  };
}

export function saveWallet(personId: string, wallet: Wallet): void {
  writeCookie(cookieName(personId), wallet);
}
