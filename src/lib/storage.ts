/**
 * Browser storage, wrapped so a private window or blocked site data degrades to
 * "nothing saved" instead of throwing on page load.
 *
 * Step 3 moves the real data to Firestore; this stays for the device claim and
 * for drafts written before someone submits.
 */

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage is full or blocked. The page keeps working unsaved. */
  }
}

export function clearStored(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* Nothing to do: the key is already unreachable. */
  }
}
