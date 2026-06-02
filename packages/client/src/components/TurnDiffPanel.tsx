import { useEffect, useState } from "react";
import { Columns2, FileDiff, RefreshCw, Rows2 } from "lucide-react";
import { api, ApiError, type TurnDiffEntry } from "../lib/api-client";
import { useSessionStore } from "../store/session-store";
import { DiffBlock } from "./DiffBlock";

type ViewType = "unified" | "split";
const VIEW_TYPE_KEY = "forge.turnDiff.viewType";

function readPersistedViewType(): ViewType {
  try {
    const v = localStorage.getItem(VIEW_TYPE_KEY);
    return v === "split" ? "split" : "unified";
  } catch {
    // Private-mode storage — fall back to the default unified view.
    return "unified";
  }
}

/**
 * Shows the aggregated set of file changes from the current session's
 * latest turn. Lives in the right pane (file browser column) as a
 * sibling to the file tree — it's the same audience and shares the
 * same width.
 *
 * Refresh strategy: fetch on mount + on every `agent_end` (proxied by
 * the active-session messages-array length, same pattern App.tsx uses
 * to refresh the file tree). The "Refresh" button forces a fetch in
 * case the proxy missed.
 *
 * Two layout modes — unified (collapsed list, click to expand) and
 * "all expanded". v1 stays with the simpler accordion; the dev plan's
 * side-by-side toggle for wide viewports lands as a polish item.
 */
export function TurnDiffPanel() {
  const activeSessionId = useSessionStore((s) => s.activeSessionId);

  const [entries, setEntries] = useState<TurnDiffEntry[]>([]);
  // Gets stuck on a "Loading…" splash if the very first refresh
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [viewType, setViewType] = useState<ViewType>(readPersistedViewType);

  const setAndPersistViewType = (next: ViewType): void => {
    setViewType(next);
    try {
      localStorage.setItem(VIEW_TYPE_KEY, next);
    } catch {
      // Private-mode storage failure — choice still applies for this session.
    }
  };

  const refresh = async (): Promise<void> => {
    if (activeSessionId === undefined) return;
    // Skip non-live sessions so the console stays clean (turn-diff
    // only works for sessions with an active SSE connection).
    const state = useSessionStore.getState();
    let isLive = false;
    for (const sessions of Object.values(state.byProject)) {
      for (const ss of sessions) {
        if (ss.sessionId === activeSessionId && ss.isLive) {
          isLive = true;
          break;
        }
      }
      if (isLive) break;
    }
    if (!isLive) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const r = await api.getTurnDiff(activeSessionId);
      setEntries(r.entries);
    } catch (err) {
      setEntries([]);
      setError(err instanceof ApiError ? err.code : (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch once when the panel mounts or the active session changes.
  // No auto-refresh on agent_end — the user opens this panel
  // explicitly when they want to see changes.
  useEffect(() => {
    setEntries([]);
    setError(undefined);
    if (activeSessionId === undefined) return;
    void refresh();
  }, [activeSessionId]);

  if (activeSessionId === undefined) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-xs italic text-neutral-500">
        Pick a session to see its file changes.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col text-xs text-neutral-300 select-text">
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
        <div className="flex items-center gap-2 font-medium text-neutral-200">
          <FileDiff size={13} />
          Last turn
          {entries.length > 0 && (
            <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400">
              {entries.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAndPersistViewType(viewType === "split" ? "unified" : "split")}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            title={viewType === "split" ? "Switch to unified view" : "Switch to side-by-side view"}
          >
            {viewType === "split" ? <Rows2 size={13} /> : <Columns2 size={13} />}
          </button>
          <button
            onClick={() => void refresh()}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            title="Refresh diff"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      {error !== undefined && (
        <div className="border-b border-red-700/40 bg-red-900/20 px-3 py-1.5 text-[11px] text-red-300">
          {error}
        </div>
      )}
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {entries.length === 0 && (
          <p className="px-3 py-3 italic text-neutral-500">
            {loading
              ? "Loading…"
              : error !== undefined
                ? "Couldn't load the latest turn diff (see banner)."
                : "No file changes from the most recent turn."}
          </p>
        )}
        {entries.map((entry) => {
          const open = expanded[entry.file] ?? false;
          const name = entry.file.split("/").pop() ?? entry.file;
          return (
            <div key={entry.file} className="border-b border-neutral-800/60">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded((e) => ({ ...e, [entry.file]: !open }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded((prev) => ({ ...prev, [entry.file]: !open }));
                  }
                }}
                className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:bg-neutral-900"
                title={entry.file}
              >
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate font-mono text-neutral-200">{name}</span>
                  {entry.isPureAddition && (
                    <span className="rounded bg-emerald-900/40 px-1 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300 light:bg-emerald-100 light:text-emerald-800">
                      new
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-baseline gap-2 text-[11px]">
                  <span className="text-emerald-400 light:text-emerald-700">
                    +{entry.additions}
                  </span>
                  <span className="text-red-400 light:text-red-700">−{entry.deletions}</span>
                </span>
              </div>
              {open && <DiffBlock diff={entry.diff} viewType={viewType} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
