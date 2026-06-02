import { useEffect, useRef, useState, useCallback } from "react";
import { api, ApiError, type GitStatus } from "../lib/api-client";
import { useSessionStore } from "../store/session-store";

const POLL_INTERVAL_MS = 30_000;

/**
 * Module-level singleton poller for git status.
 *
 * Problem: two components (FilesPanelLayer + GitPanel) each called
 * useGitStatus(), creating *two* independent 15 s intervals →
 * effective server rate ~2× the intended interval.  On HTTP/1.1
 * that wastes precious connection slots.
 *
 * Solution: a single module-level poller per projectId.  Every
 * hook consumer subscribes to the same shared snapshot.  The
 * poller starts when the first consumer mounts and stops when
 * the last consumer unmounts (ref-counted).
 */
interface PollerState {
  status: GitStatus | undefined;
  error: string | undefined;
  subscriberCount: number;
  intervalId: ReturnType<typeof setInterval> | null;
  epoch: number;
  lastProjectId: string | undefined;
  inflight: boolean;
}

const pollers = new Map<string, PollerState>();

function getOrCreatePoller(projectId: string): PollerState {
  let p = pollers.get(projectId);
  if (!p) {
    p = {
      status: undefined,
      error: undefined,
      subscriberCount: 0,
      intervalId: null,
      epoch: 0,
      lastProjectId: projectId,
      inflight: false,
    };
    pollers.set(projectId, p);
  }
  return p;
}

async function refreshPoller(poller: PollerState, projectId: string): Promise<void> {
  if (poller.inflight) return;
  poller.inflight = true;
  const myEpoch = poller.epoch;
  try {
    const next = await api.gitStatus(projectId);
    if (poller.epoch !== myEpoch) return;
    poller.status = next;
    poller.error = undefined;
  } catch (err) {
    if (poller.epoch !== myEpoch) return;
    poller.error = err instanceof ApiError ? err.code : (err as Error).message;
  } finally {
    poller.inflight = false;
  }
}

function startPolling(poller: PollerState, projectId: string): void {
  if (poller.intervalId !== null) return;
  void refreshPoller(poller, projectId);
  poller.intervalId = window.setInterval(() => {
    void refreshPoller(poller, projectId);
  }, POLL_INTERVAL_MS);
}

function stopPolling(poller: PollerState): void {
  if (poller.intervalId !== null) {
    window.clearInterval(poller.intervalId);
    poller.intervalId = null;
  }
}

/**
 * Polls `GET /git/status` via a shared module-level singleton.
 *
 * All consumers for the same projectId share one timer and one
 * status snapshot, eliminating duplicate requests.
 *
 * Pauses while the active session is streaming; refreshes on
 * every agent_end signal.
 */
export function useGitStatus(projectId: string | undefined): {
  status: GitStatus | undefined;
  error: string | undefined;
  refresh: () => Promise<void>;
} {
  const [status, setStatus] = useState<GitStatus | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const isStreaming = useSessionStore((s) =>
    activeSessionId !== undefined ? (s.streamingBySession[activeSessionId] ?? false) : false,
  );
  const agentEndCount = useSessionStore((s) =>
    activeSessionId !== undefined ? (s.agentEndCountBySession[activeSessionId] ?? 0) : 0,
  );

  const pollerRef = useRef<PollerState | null>(null);

  useEffect(() => {
    if (projectId === undefined) return;

    const poller = getOrCreatePoller(projectId);
    pollerRef.current = poller;
    poller.subscriberCount += 1;

    const syncState = () => {
      setStatus(poller.status);
      setError(poller.error);
    };
    syncState();

    if (!isStreaming) {
      startPolling(poller, projectId);
    }

    return () => {
      poller.subscriberCount -= 1;
      if (poller.subscriberCount <= 0) {
        stopPolling(poller);
        pollers.delete(projectId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    const poller = pollerRef.current;
    if (!poller) return;
    if (isStreaming) {
      stopPolling(poller);
      return;
    }
    const timer = setTimeout(() => {
      startPolling(poller, poller.lastProjectId!);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isStreaming]);

  useEffect(() => {
    const poller = pollerRef.current;
    if (!poller || projectId === undefined) return;
    if (agentEndCount === 0) return;
    void refreshPoller(poller, projectId).then(() => {
      setStatus(poller.status);
      setError(poller.error);
    });
  }, [projectId, activeSessionId, agentEndCount]);

  const refresh = useCallback(async (): Promise<void> => {
    const poller = pollerRef.current;
    if (!poller || projectId === undefined) return;
    await refreshPoller(poller, projectId);
    setStatus(poller.status);
    setError(poller.error);
  }, [projectId]);

  return { status, error, refresh };
}
