import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { bootTheme } from "./lib/theme";

bootTheme();

/**
 * Startup gate: ensure the environment is clean before React mounts.
 *
 * Quick health-check that `fetch()` actually reaches the server.
 * If it doesn't (proxy extension / CSP mismatch / server down), we show
 * a helpful error instead of a blank "No sessions yet" sidebar.
 *
 * Service worker note: production builds register a SW via vite-plugin-pwa
 * (see vite.config.ts). We deliberately do NOT unregister it here —
 * unregistering at boot would defeat the whole point of PWA caching.
 * Dev mode (`npm run dev`, port 9145) has `devOptions.enabled: false` so
 * no SW is registered there in the first place, meaning HMR is unaffected.
 */
async function prepareEnvironment(): Promise<void> {
  try {
    await fetch("/api/v1/health", { signal: AbortSignal.timeout(5000) }).then((res) => {
      if (!res.ok) throw new Error(`health ${res.status}`);
    });
  } catch (err) {
    const rootEl = document.getElementById("root");
    if (rootEl) {
      rootEl.innerHTML = `
        <main style="padding:2rem;font-family:monospace;color:#fca5a5;background:#0a0a0a;min-height:100vh">
          <h1 style="color:#fff;margin-bottom:1rem">⚠ Huiyu Pi: connection failed</h1>
          <p style="color:#d4d4d4;margin-bottom:1rem">Could not connect to the server (${err instanceof Error ? err.message : err})</p>
          <p style="margin-bottom:1rem">Try these steps:</p>
          <ol style="color:#a3a3a3;padding-left:1.5rem;line-height:1.8">
            <li>Open DevTools with <kbd style="background:#333;padding:2px 6px;border-radius:3px">F12</kbd> → Application → Storage → <b>Clear site data</b></li>
            <li>Disable browser extensions that may block requests</li>
            <li>Force-reload with <kbd style="background:#333;padding:2px 6px;border-radius:3px">Ctrl+Shift+R</kbd></li>
          </ol>
          <p style="margin-top:1rem;color:#71717a;font-size:12px">
            If the server is not running, start it with: <code style="background:#333;padding:2px 6px">npm run start</code>
          </p>
        </main>`;
    }
    throw err;
  }
}

void prepareEnvironment().then(() => {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("#root element missing in index.html");

  createRoot(rootEl).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>,
  );
});

/**
 * Dev-time error boundary that renders the error visibly on the page when
 * a render throws. Without this, an uncaught React error in StrictMode
 * leaves the page blank — the very symptom we just hit. Production builds
 * keep this too: a visible error is better than a silent blank screen.
 */
class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Console-only. We previously fired a "log breadcrumb" `GET
    // /api/v1/health`, which surfaced nothing useful server-side and
    // was confusing in dev tools. Real client-error reporting is a
    // Phase 18 polish item.
    console.error("[huiyu-pi] root render error", error, info);
  }

  override render(): ReactNode {
    if (this.state.error !== null) {
      return (
        <main
          style={{
            padding: "2rem",
            fontFamily: "monospace",
            color: "#fca5a5",
            background: "#0a0a0a",
            minHeight: "100vh",
            whiteSpace: "pre-wrap",
            overflow: "auto",
          }}
        >
          <h1 style={{ color: "#fff", marginBottom: "1rem" }}>Huiyu Pi: render crash</h1>
          <p style={{ color: "#d4d4d4", marginBottom: "1rem" }}>{this.state.error.message}</p>
          <pre style={{ fontSize: "11px", color: "#a3a3a3" }}>
            {this.state.error.stack ?? "(no stack)"}
          </pre>
          <p style={{ marginTop: "2rem", color: "#71717a", fontSize: "12px" }}>
            Tip: open the browser console for more detail. Try clearing localStorage (devtools →
            Application → Local Storage → Clear) and refreshing if the error mentions stale state.
          </p>
        </main>
      );
    }
    return this.props.children;
  }
}

window.addEventListener("error", (e) => {
  console.error("[huiyu-pi] uncaught error", e.error);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[huiyu-pi] unhandled rejection", e.reason);
});
