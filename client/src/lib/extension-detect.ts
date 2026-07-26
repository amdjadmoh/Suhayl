export type SupportedBrowser =
  | 'chrome'
  | 'edge'
  | 'brave'
  | 'firefox'
  | 'safari'
  | 'opera'
  | 'other';

/** Detect which browser the user is on (best-effort UA check). */
export function detectBrowser(): SupportedBrowser {
  const ua = navigator.userAgent;

  // Brave: check navigator.brave (a Promise), fall back to UA check
  const braveApi = (navigator as { brave?: { isBrave: () => boolean } }).brave;
  if (braveApi && typeof braveApi.isBrave === 'function') {
    // We can't await here — return 'brave' optimistically if the API exists.
    // The UA fallback covers false positives from spoofing.
    return 'brave';
  }
  if (/Brave/i.test(ua)) return 'brave';

  if (/Edg\//i.test(ua)) return 'edge';
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'opera';
  if (/Firefox\//i.test(ua)) return 'firefox';
  if (/Chrome\//i.test(ua)) return 'chrome';
  if (/Safari\//i.test(ua)) return 'safari';

  return 'other';
}

// Module-level cache: once resolved, subsequent calls return instantly.
let cachedResult: boolean | null = null;

/**
 * Returns true if the WannaOut extension is installed on this page.
 *
 * First checks the synchronous global flag (`window.__wannaboutExtension`).
 * If that is not set, sends a postMessage ping and waits for a pong.
 * Results are cached so subsequent calls resolve synchronously.
 *
 * @param timeoutMs  How long to wait for a pong before resolving false.
 *                   Default: 500ms.
 */
export function isExtensionInstalled(
  timeoutMs: number = 500,
): Promise<boolean> {
  // Return cached result immediately.
  if (cachedResult !== null) return Promise.resolve(cachedResult);

  // Synchronous check via the global flag set by the content script.
  if ((window as { __wannaboutExtension?: boolean }).__wannaboutExtension === true) {
    cachedResult = true;
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const handler = (event: MessageEvent): void => {
      if (event.source !== window) return;
      const data = event.data as { type?: string } | undefined;
      if (data?.type === 'wannabout-extension-pong') {
        window.removeEventListener('message', handler);
        cachedResult = true;
        resolve(true);
      }
    };

    window.addEventListener('message', handler);

    window.postMessage({ type: 'wannabout-extension-ping' }, '*');

    setTimeout(() => {
      window.removeEventListener('message', handler);
      cachedResult = false;
      resolve(false);
    }, timeoutMs);
  });
}
