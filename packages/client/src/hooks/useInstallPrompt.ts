import { useCallback, useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if ((window.navigator as { standalone?: boolean }).standalone === true) return true;
  return window.matchMedia?.("(display-mode: standalone)").matches ?? false;
}

export const DISMISS_KEY = "huiyu-pi/install-prompt-dismissed";

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return false;
  }
}

function isChromiumDesktop(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isChromium = (/Chrome\/\d+/.test(ua) && !ua.includes("Edg/")) || ua.includes("Edg/");
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  return isChromium && !isMobile;
}

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | undefined>(undefined);
  const [dismissed, setDismissed] = useState<boolean>(isDismissed);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (dismissed) return;

    const onBeforeInstall = (e: Event): void => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [dismissed]);

  const dismiss = useCallback((): void => {
    setDeferred(undefined);
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch { /* storage unavailable */ }
  }, []);

  const install = useCallback(async (): Promise<void> => {
    if (deferred === undefined) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(undefined);
    if (choice.outcome === "accepted") {
      setDismissed(true);
      try {
        localStorage.setItem(DISMISS_KEY, "true");
      } catch { /* storage unavailable */ }
    }
  }, [deferred]);

  const canInstall = deferred !== undefined;

  const showInstall = !isStandalone() && !dismissed && isChromiumDesktop();

  return { canInstall, showInstall, install, dismiss };
}
