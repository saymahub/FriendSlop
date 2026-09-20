/**
 * Toggles a value in an ordered selection.
 *
 * At the cap, picking something new drops the oldest pick rather than doing
 * nothing: a tap that silently fails reads as a broken control. Order is kept
 * because the first pick means something — it becomes a person's page theme.
 */
export function toggleCapped(current: readonly string[], value: string, max?: number): string[] {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }

  if (max !== undefined && current.length >= max) {
    return [...current.slice(current.length - max + 1), value];
  }

  return [...current, value];
}

export function asSelection(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}
