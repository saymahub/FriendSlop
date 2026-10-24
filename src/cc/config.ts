/**
 * Every number that shapes Millie's CC, in one place to tune.
 *
 * Slots payouts are multiples of the bet. With seven equally likely symbols,
 * any one triple lands 1 spin in 343, some triple 1 in 49, and exactly two of a
 * kind about 37 in 100. At these values a spin returns about 78% of its bet on
 * average: the house wins slowly, and the café is how coins come back in.
 */
export const STARTING_COINS = 100;

export const BETS = [5, 10, 25] as const;
export type Bet = (typeof BETS)[number];

export const PAYOUT = {
  /** Three matching symbols: the bet times this. */
  threeOfAKind: 15,
  /**
   * Three of this one symbol pays more than any other triple. `symbol` is its
   * file name in `assets/cc/symbols/` without `.webp`.
   */
  jackpot: { symbol: 'flying-kirby', multiplier: 50 },
  /** Exactly two matching: the bet back, so the spin cost nothing. */
  twoOfAKind: 1,
} as const;

/** When each reel stops, left to right, in milliseconds after the pull. */
export const REEL_STOPS_MS = [1000, 1400, 1800] as const;

/** How many symbols the first reel rolls past; each later reel rolls six more. */
export const ROLL_LENGTH = 14;

export const CAFE = {
  /** No more than this many customers wait at once. */
  maxWaiting: 3,
  /** A new customer walks in this often while the café is open. */
  arrivalMs: 1500,
  /** How long a customer waits before leaving without their order. */
  patienceMs: 12000,
  /** Every served order earns this... */
  baseTip: 2.5,
  /** ...plus up to this much more for serving quickly. Tips round to whole coins. */
  speedBonus: 2.5,
} as const;
