const TIMEOUT_MS = 8000;

let nextCallback = 0;

/**
 * Loads a URL as a script and resolves with what it passes to the callback.
 *
 * The iTunes Search API sends no CORS headers, so `fetch` cannot read it from a
 * browser; JSONP is the keyless, backendless way round that. The script tag and
 * the global callback are removed however the request ends.
 */
export function jsonp<T>(url: string): Promise<T> {
  const callbackName = `friendslopJsonp${nextCallback++}`;
  const script = document.createElement('script');
  const callbacks = window as unknown as Record<string, unknown>;

  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => finish(() => reject(new Error(`No reply from ${new URL(url).host}`))), TIMEOUT_MS);

    function finish(settle: () => void) {
      window.clearTimeout(timer);
      delete callbacks[callbackName];
      script.remove();
      settle();
    }

    callbacks[callbackName] = (payload: T) => finish(() => resolve(payload));
    script.onerror = () => finish(() => reject(new Error(`Could not reach ${new URL(url).host}`)));
    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    document.head.append(script);
  });
}
