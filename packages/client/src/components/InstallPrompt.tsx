import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";
import { useInstallPrompt, isStandalone, DISMISS_KEY } from "../hooks/useInstallPrompt";
import { useIsMobile } from "../lib/use-is-mobile";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt(): React.JSX.Element | null {
  const isMobile = useIsMobile();
  const { canInstall, install, dismiss } = useInstallPrompt();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(DISMISS_KEY) === "true";
  });
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (dismissed) return;
    if (!isIOS() || !isMobile) return;
    const timer = window.setTimeout(() => setIosHint(true), 1500);
    return () => window.clearTimeout(timer);
  }, [isMobile, dismissed]);

  const handleDismiss = (): void => {
    setDismissed(true);
    setIosHint(false);
    dismiss();
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // private mode
    }
  };

  if (!isMobile || dismissed || isStandalone()) return null;
  if (!canInstall && !iosHint) return null;

  return (
    <div className="border-b border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <div className="min-w-0 flex-1">
          {canInstall ? (
            <span>Install Huiyu Pi as an app for a fullscreen experience.</span>
          ) : (
            <span className="inline-flex flex-wrap items-center gap-1">
              Install: tap <Share size={14} className="inline shrink-0 text-neutral-400" /> Share,
              then <span className="font-medium">Add to Home Screen</span>.
            </span>
          )}
        </div>
        {canInstall && (
          <button
            type="button"
            onClick={() => void install()}
            className="shrink-0 rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-200"
          >
            Install
          </button>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
