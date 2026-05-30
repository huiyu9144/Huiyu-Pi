import { useEffect, useState } from "react";
import { FileDiff, X } from "lucide-react";
import { api, ApiError } from "../lib/api-client";
import { useSessionStore } from "../store/session-store";

/**
 * Inline button under ChatView showing "N file(s) edited" whenever
 * the latest turn touched files. Clicking opens the right pane on
 * the Last turn tab. The badge unmounts when:
 *   - the count is 0 (nothing to review), OR
 *   - the user is already viewing the Last turn pane (no point
 *     nudging to open what they're already on).
 *
 * Refreshes once per `agent_end` via the session-store's counter,
 * matching how TurnDiffPanel and useGitStatus react to the same
 * signal.
 */
export function ChangedFilesBadge({
  sessionId,
  alreadyOnChangesTab,
  onOpen,
}: {
  sessionId: string;
  alreadyOnChangesTab: boolean;
  onOpen: () => void;
}) {
  const isStreaming = useSessionStore((s) => s.streamingBySession[sessionId] ?? false);
  const agentEndCount = useSessionStore((s) => s.agentEndCountBySession[sessionId] ?? 0);

  const [count, setCount] = useState<number>(0);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(`pi-forge/dismissed-badge/${sessionId}`) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setCount(0);
    try {
      setDismissed(localStorage.getItem(`pi-forge/dismissed-badge/${sessionId}`) === "1");
    } catch {
      setDismissed(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isStreaming) return;
    let cancelled = false;
    api
      .getTurnDiff(sessionId)
      .then((r) => {
        if (!cancelled) {
          setCount(r.entries.length);
          if (r.entries.length > 0) setDismissed(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // 404 → cold session with no live turn-diff; treat as 0
        // silently. Other errors (500, network drops) shouldn't be
        // mistaken for "no changes" — log so a server regression
        // doesn't silently hide the badge.
        if (err instanceof ApiError && err.status === 404) {
          setCount(0);
        } else {
          if (typeof console !== "undefined") {
            console.warn("[ChangedFilesBadge] turn-diff fetch failed:", err);
          }
          setCount(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, agentEndCount, isStreaming]);

  if (count === 0 || alreadyOnChangesTab || dismissed) return null;

  return (
    <div className="border-t border-neutral-800 bg-neutral-950 px-6 py-2">
      <div className="mx-auto max-w-3xl">
        <div className="group relative inline-flex">
          <button
            onClick={onOpen}
            className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800"
            title="Open the Last turn pane to review what the agent just wrote"
          >
            <FileDiff size={12} />
            {count === 1 ? "1 file edited" : `${count} files edited`}
            <span className="text-[10px] text-neutral-500">— review</span>
          </button>
          <button
            onClick={() => {
              setDismissed(true);
              try {
                localStorage.setItem(`pi-forge/dismissed-badge/${sessionId}`, "1");
              } catch {}
            }}
            className="absolute -top-1.5 -right-1.5 hidden h-4 w-4 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 group-hover:inline-flex"
            title="Dismiss"
          >
            <X size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
