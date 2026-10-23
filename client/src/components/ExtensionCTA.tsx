import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isExtensionInstalled, detectBrowser, type SupportedBrowser } from '@/lib/extension-detect';
import { STORE_IDS, INSTALL_INSTRUCTIONS_URL } from '@/config/extension-store-ids';

type CtaState = 'checking' | 'installed' | 'not-installed' | 'dismissed' | 'unsupported-browser';

const DISMISSED_KEY = 'wannabout-extension-cta-dismissed-at';
const DISMISS_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isDismissed(): boolean {
  try {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (!stored) return false;
    const dismissedAt = Number(stored);
    if (Number.isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_EXPIRY_MS;
  } catch {
    return false;
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // localStorage may be unavailable — silently ignore
  }
}

function getStoreUrl(browser: SupportedBrowser): string | null {
  if (browser === 'chrome' || browser === 'brave' || browser === 'opera') {
    return STORE_IDS.chrome
      ? `https://chromewebstore.google.com/detail/wannabout/${STORE_IDS.chrome}`
      : null;
  }
  if (browser === 'edge') {
    return STORE_IDS.edge
      ? `https://microsoftedge.microsoft.com/addons/detail/wannabout/${STORE_IDS.edge}`
      : null;
  }
  return null;
}

function getCtaLabel(browser: SupportedBrowser): string {
  if (browser === 'chrome') return 'Add to Chrome';
  if (browser === 'brave') return 'Add to Brave';
  if (browser === 'opera') return 'Add to Opera';
  if (browser === 'edge') return 'Add to Edge';
  return 'How to install';
}

function DismissButton({ onClick }: { onClick: () => void }): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Dismiss"
      className="rounded-lg p-1 text-ink-4 transition-colors hover:bg-paper-sunken hover:text-ink"
    >
      <X className="size-3.5" />
    </button>
  );
}

/* ---------- Main component ---------- */

export interface ExtensionCTAProps {
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

/**
 * A small note about the browser extension. It reads like a margin note,
 * not an ad, and stays out of the way once dismissed or installed.
 */
export function ExtensionCTA({
  variant = 'card',
  className,
}: ExtensionCTAProps): React.ReactElement | null {
  const [state, setState] = useState<CtaState>(
    isDismissed() ? 'dismissed' : 'checking',
  );
  const browser: SupportedBrowser = detectBrowser();

  useEffect(() => {
    if (state !== 'checking') return;

    let cancelled = false;

    isExtensionInstalled().then((installed) => {
      if (cancelled) return;
      if (installed) {
        setState('installed');
      } else if (
        browser === 'firefox' ||
        browser === 'safari' ||
        browser === 'other'
      ) {
        setState('unsupported-browser');
      } else {
        setState('not-installed');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [state, browser]);

  const handleDismiss = useCallback(() => {
    setDismissed();
    setState('dismissed');
  }, []);

  if (state === 'dismissed' || state === 'checking') return null;

  const storeUrl = getStoreUrl(browser);
  const href = storeUrl ?? INSTALL_INSTRUCTIONS_URL;
  const label = storeUrl ? getCtaLabel(browser) : 'How to install';

  if (variant === 'inline') {
    if (state === 'installed') {
      return (
        <p className={cn('text-xs text-ink-3', className)}>
          <span className="font-medium text-moss">✓ Extension connected.</span> Save programs from any page.
        </p>
      );
    }
    return (
      <p className={cn('flex flex-wrap items-center gap-x-2 text-xs text-ink-3', className)}>
        {state === 'not-installed' ? (
          <>
            Save programs straight from university websites with the browser extension.
            <a href={href} target="_blank" rel="noopener noreferrer" className="link-ink">
              {label}
            </a>
          </>
        ) : (
          <>The browser extension works in Chrome, Edge and Brave.</>
        )}
        <DismissButton onClick={handleDismiss} />
      </p>
    );
  }

  const shell = cn(
    'relative rounded-[1.25rem] bg-paper-sunken',
    variant === 'banner' ? 'flex flex-wrap items-center justify-between gap-3 px-5 py-4' : 'p-5',
    className,
  );

  if (state === 'installed') {
    return (
      <div className={shell}>
        <p className="text-sm font-bold text-moss">Extension connected</p>
        <p className={cn('text-[13px] leading-relaxed text-ink-2', variant === 'card' && 'mt-1.5')}>
          When you find a program on a university website, save it from the toolbar and it lands here.
        </p>
      </div>
    );
  }

  if (state === 'unsupported-browser') {
    return (
      <div className={shell}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ink">Browser extension</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
              Available for Chrome, Edge and Brave. Open Suhayl in one of those to install it.
            </p>
          </div>
          <DismissButton onClick={handleDismiss} />
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className={cn('flex items-start justify-between gap-3', variant === 'banner' && 'flex-1')}>
        <div>
          <p className="text-sm font-bold text-ink">Browser extension</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
            Found a program on a university site? Save it to Suhayl in one click instead of copying details by hand.
          </p>
        </div>
        {variant === 'card' && <DismissButton onClick={handleDismiss} />}
      </div>
      <div className={cn('flex items-center gap-2', variant === 'card' && 'mt-3')}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center rounded-full bg-paper-raised px-3.5 text-[13px] font-semibold text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)] transition-colors hover:text-brand-ink"
        >
          {label}
        </a>
        {variant === 'banner' && <DismissButton onClick={handleDismiss} />}
      </div>
    </div>
  );
}
