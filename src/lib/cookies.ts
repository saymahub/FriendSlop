/**
 * Small JSON values in cookies. A blocked or malformed cookie reads as the
 * fallback rather than throwing, so a page that uses one still loads.
 */

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readCookie<T>(name: string, fallback: T): T {
  try {
    const entry = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`));
    return entry ? (JSON.parse(decodeURIComponent(entry.slice(name.length + 1))) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeCookie(name: string, value: unknown): void {
  try {
    const encoded = encodeURIComponent(JSON.stringify(value));
    document.cookie = `${name}=${encoded}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax`;
  } catch {
    /* Cookies are blocked. The game keeps working, just without saving. */
  }
}
