import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { bootTheme } from "./lib/theme";

bootTheme();

// Unregister any previously installed service worker to ensure fresh
// content from every build. VitePWA has been removed — no future SW
// will be generated, but old SW instances may still be active in the
// browser from prior builds. Running this on every mount guarantees
// the old SW is evicted.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) reg.unregister();
  });
}

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

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root element missing in index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
