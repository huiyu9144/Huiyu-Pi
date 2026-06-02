import type { AgentSessionEvent } from "@earendil-works/pi-coding-agent";

/**
 * Lightweight event bus for cross-session broadcasts.
 *
 * Decouples session-registry (which fires events) from sse-bridge
 * (which holds the global-clients set), avoiding a circular import:
 *   session-registry → global-events-bus ← sse-bridge
 */
type Listener = (event: AgentSessionEvent) => void;
const listeners = new Set<Listener>();

export function onGlobalEvent(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function emitGlobalEvent(event: AgentSessionEvent): void {
  if (listeners.size === 0) return;
  for (const fn of listeners) {
    try { fn(event); } catch { /* drop */ }
  }
}
