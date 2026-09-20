const TILTS = ['var(--rotate-tilt-1)', 'var(--rotate-tilt-2)', 'var(--rotate-tilt-3)', 'var(--rotate-tilt-4)'];

/**
 * Picks a tilt from a fixed set by seed rather than at random, so a card keeps
 * the same angle across re-renders instead of twitching on every state change.
 */
export function tiltFor(seed: number | string): string {
  const index = typeof seed === 'number' ? seed : hash(seed);
  return TILTS[Math.abs(index) % TILTS.length];
}

function hash(value: string): number {
  let result = 0;
  for (const character of value) {
    result = (result * 31 + character.charCodeAt(0)) | 0;
  }
  return result;
}
