import { useEffect, useState, useCallback } from 'react';
import { Puzzle, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  return 'Install instructions';
}

/* ---------- Sub-components for each variant ---------- */

function CardCta({
  state,
  browser,
  onDismiss,
}: {
  state: Exclude<CtaState, 'dismissed'>;
  browser: SupportedBrowser;
  onDismiss: () => void;
}): React.ReactElement {
  if (state === 'checking') {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Puzzle className="h-4 w-4 text-muted-foreground animate-pulse" />
            Checking extension…
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (state === 'installed') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Extension ready
            </CardTitle>
          </div>
          <CardDescription>
            Save university programs from any page you visit.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (state === 'not-installed') {
    const storeUrl = getStoreUrl(browser);
    const hasStoreUrl = storeUrl !== null;
    const href = hasStoreUrl ? storeUrl : INSTALL_INSTRUCTIONS_URL;
    const label = hasStoreUrl ? getCtaLabel(browser) : 'Install instructions';

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Puzzle className="h-5 w-5 text-primary" />
              Get the WannaOut extension
            </CardTitle>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Save university programs from any page you visit — works in Chrome, Edge, and Brave.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full rounded-xl" size="sm">
            <a href={href} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {label}
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // unsupported-browser
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Puzzle className="h-5 w-5 text-muted-foreground" />
            Use Chrome, Edge, or Brave
          </CardTitle>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          The extension is currently available for Chromium-based browsers.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function BannerCta({
  state,
  browser,
  onDismiss,
}: {
  state: Exclude<CtaState, 'dismissed'>;
  browser: SupportedBrowser;
  onDismiss: () => void;
}): React.ReactElement {
  const base =
    'flex items-center justify-between gap-4 rounded-xl border px-5 py-3';

  if (state === 'checking') {
    return (
      <div className={`${base} border-dashed`}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Puzzle className="h-4 w-4 animate-pulse" />
          Checking extension…
        </div>
      </div>
    );
  }

  if (state === 'installed') {
    return (
      <div className={`${base} border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30`}>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="font-medium">Extension ready</span>
          <span className="text-muted-foreground">
            — Save university programs from any page you visit.
          </span>
        </div>
      </div>
    );
  }

  if (state === 'not-installed') {
    const storeUrl = getStoreUrl(browser);
    const hasStoreUrl = storeUrl !== null;
    const href = hasStoreUrl ? storeUrl : INSTALL_INSTRUCTIONS_URL;
    const label = hasStoreUrl ? getCtaLabel(browser) : 'Install instructions';

    return (
      <div className={`${base} border-primary/20 bg-primary/[0.03]`}>
        <div className="flex items-center gap-2 text-sm">
          <Puzzle className="h-4 w-4 text-primary" />
          <span className="font-medium">Get the WannaOut extension</span>
          <span className="text-muted-foreground hidden sm:inline">
            — Save programs from any page you visit.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="xs" className="rounded-lg">
            <a href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onDismiss} aria-label="Dismiss">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // unsupported-browser
  return (
    <div className={`${base} border-muted bg-muted/30`}>
      <div className="flex items-center gap-2 text-sm">
        <Puzzle className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Use Chrome, Edge, or Brave</span>
        <span className="text-muted-foreground hidden sm:inline">
          — The extension is available for Chromium-based browsers.
        </span>
      </div>
      <Button variant="ghost" size="icon-xs" onClick={onDismiss} aria-label="Dismiss">
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function InlineCta({
  state,
  browser,
  onDismiss,
}: {
  state: Exclude<CtaState, 'dismissed'>;
  browser: SupportedBrowser;
  onDismiss: () => void;
}): React.ReactElement {
  if (state === 'checking') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Puzzle className="h-3 w-3 animate-pulse" />
        Checking extension…
      </div>
    );
  }

  if (state === 'installed') {
    return (
      <div className="flex items-center gap-2 text-xs">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        <span className="font-medium text-foreground">Extension ready</span>
        <span className="text-muted-foreground">
          — Save university programs from any page.
        </span>
      </div>
    );
  }

  if (state === 'not-installed') {
    const storeUrl = getStoreUrl(browser);
    const hasStoreUrl = storeUrl !== null;
    const href = hasStoreUrl ? storeUrl : INSTALL_INSTRUCTIONS_URL;
    const label = hasStoreUrl ? getCtaLabel(browser) : 'Install instructions';

    return (
      <div className="flex items-center gap-2 text-xs">
        <Puzzle className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium text-foreground">Get the WannaOut extension</span>
        <span className="text-muted-foreground hidden sm:inline">
          — Save programs from any page.
        </span>
        <Button asChild variant="link" size="xs" className="h-auto p-0 text-xs">
          <a href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // unsupported-browser
  return (
    <div className="flex items-center gap-2 text-xs">
      <Puzzle className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-medium text-foreground">Use Chrome, Edge, or Brave</span>
      <span className="text-muted-foreground hidden sm:inline">
        — The extension is available for Chromium-based browsers.
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ---------- Main component ---------- */

export interface ExtensionCTAProps {
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

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

  if (state === 'dismissed') return null;

  const ctaProps = { state: state as Exclude<CtaState, 'dismissed'>, browser, onDismiss: handleDismiss };

  const wrapperCn = className ?? '';

  switch (variant) {
    case 'banner':
      return <div className={wrapperCn}><BannerCta {...ctaProps} /></div>;
    case 'inline':
      return <div className={wrapperCn}><InlineCta {...ctaProps} /></div>;
    case 'card':
    default:
      return <div className={wrapperCn}><CardCta {...ctaProps} /></div>;
  }
}
