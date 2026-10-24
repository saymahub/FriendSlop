import { PAYOUT } from './config';

export type Reels = readonly [string, string, string];

/** Three independent reels, each landing on any symbol with equal chance. */
export function spinReels(symbols: readonly string[]): Reels {
  const [first, second, third] = randomSymbols(symbols, 3);
  return [first, second, third];
}

/** Any number of symbols picked at random, for the strip a reel rolls past. */
export function randomSymbols(symbols: readonly string[], count: number): string[] {
  return Array.from({ length: count }, () => symbols[Math.floor(Math.random() * symbols.length)]);
}

/** Which reels are part of a match, to light them up when they land. */
export function matchingReels(reels: Reels): boolean[] {
  return reels.map((symbol) => reels.filter((other) => other === symbol).length > 1);
}

/** What a spin pays: a multiple of the bet for three or two matching, otherwise nothing. */
export function payoutFor(reels: Reels, bet: number): number {
  const distinct = new Set(reels).size;

  if (distinct === 1) {
    return bet * (isJackpot(reels) ? PAYOUT.jackpot.multiplier : PAYOUT.threeOfAKind);
  }

  return distinct === 2 ? bet * PAYOUT.twoOfAKind : 0;
}

/** Three of the jackpot symbol, the one triple that pays more than the rest. */
export function isJackpot(reels: Reels): boolean {
  return reels.every((symbol) => symbol === PAYOUT.jackpot.symbol);
}
