import { create } from "zustand";
import { api, ApiError, type SessionSummary, type UnifiedSession } from "../lib/api-client";
import { streamSSE } from "../lib/sse-client";
import { postCrossTab, subscribeCrossTab } from "../lib/cross-tab";
import { useAskUserQuestionStore, type PendingAskQuestion } from "./ask-user-question-store";
import { useTodoStore, type Task as TodoTaskShape } from "./todo-store";
import { useProcessesStore, type ProcessInfo as ProcessShape } from "./processes-store";
import { useSnapshotStore } from "./snapshot-store";

const ACTIVE_SESSION_KEY = "huiyu-pi/active-session-id";

/**
 * Stable empty constants for Zustand selectors. React 18's useSyncExternalStore
 * (which Zustand uses) treats every new reference as "state changed" — so a
 * selector like `(s) => s.byProject[id] ?? []` returns a fresh `[]` each call
 * and the equality check fails on every render, triggering an infinite
 * re-render loop ("Maximum update depth exceeded"). The fix is to default to
 * the SAME reference on every miss. Selectors should hand callers these.
 */
export const EMPTY_SESSIONS: UnifiedSession[] = [];
export const EMPTY_MESSAGES: AgentMessageLike[] = [];
export const EMPTY_STRING = "";
export const EMPTY_COMPACTIONS: CompactionEvent[] = [];

/**
 * Per-session pending streaming-text delta buffer + RAF id. We accumulate
 * `message_update` text deltas here and flush at most once per animation
 * frame. Without this, fast-token providers (200+ tokens/sec) trigger a
 * Zustand `set` per token → React re-render storm → visible UI jank.
 *
 * Module-scoped (not in store state) on purpose — this is render-rate
 * machinery, not user-facing data, and shouldn't trigger Zustand
 * subscribers.
 */
const pendingDeltas = new Map<string, string>();
const pendingRaf = new Map<string, number>();

/**
 * Inflight messages-refetch state per session. We refetch on intra-turn
 * milestones (message_end, tool_execution_end, tool_result) so toolCall
 * blocks and tool results materialize WHILE the agent is running, not
 * only at agent_end. Without these refetches, a long bash followed by a
 * read followed by a write would all appear in one batch when the turn
 * ends — the user has no idea what's happening in the meantime.
 *
 * Coalescing rules:
 *   - inflight = true while a fetch is in flight; concurrent triggers
 *     just set queued = true so we run exactly one more pass after.
 *   - the fetch itself uses the same merge as agent_end: replace the
 *     authoritative messages array. Streaming text/active-tool are
 *     untouched here.
 */
interface RefetchState {
  inflight: boolean;
  queued: boolean;
}
const refetchState = new Map<string, RefetchState>();

/**
 * Coalesced session-list refetch. Multiple callers requesting a refresh
 * for the same projectId within the same event-loop turn share one
 * HTTP request — same pattern as scheduleMessagesRefetch for messages.
 *
 * Why: agent_end, session_list_changed, snapshot-guard timeout, and
 * cross-tab events can all fire in quick succession, each triggering
 * loadSessionsForProject. Without coalescing this stacks N identical
 * GET /sessions requests.
 */
interface ListRefetchState {
  inflight: boolean;
  queued: boolean;
}
const listRefetchState = new Map<string, ListRefetchState>();

const listFetchTimestamps = new Map<string, number>();
const LIST_FRESH_MS = 2_000;

function scheduleListRefetch(projectId: string): void {
  const st = listRefetchState.get(projectId) ?? { inflight: false, queued: false };
  if (st.inflight) {
    st.queued = true;
    listRefetchState.set(projectId, st);
    return;
  }
  st.inflight = true;
  listRefetchState.set(projectId, st);

  const run = (): Promise<void> =>
    useSessionStore
      .getState()
      .loadSessionsForProject(projectId)
      .finally(() => {
        const cur = listRefetchState.get(projectId);
        if (cur === undefined) return;
        if (cur.queued) {
          cur.queued = false;
          cur.inflight = false;
          listRefetchState.set(projectId, cur);
          scheduleListRefetch(projectId);
        } else {
          listRefetchState.delete(projectId);
        }
      });

  void run();
}

/**
 * Per-session AbortController for the open SSE stream. Module-scoped
 * (not in Zustand state) for the same reason as `pendingDeltas` /
 * `pendingRaf`: it's plumbing, not data. Keeping it inside Zustand
 * state would be a foot-gun — anyone who later subscribed via
 * `useStore(s => s.controllers)` would get a stable Map reference and
 * never re-render, because we mutate the Map imperatively rather than
 * through `set()`.
 */
/**
 * At most one active SSE stream at any time. This prevents HTTP/1.1
 * connection-pool exhaustion — aborting a fetch on one slot and
 * immediately opening another on the same domain can race with TCP
 * close, so we defer the new fetch to a microtask via
 * Promise.resolve().then() in setActiveSession.
 */
let streamCtrl: AbortController | undefined;
let streamSessionId: string | undefined;

let sessionAbortCtrl = new AbortController();
let sessionVersion = 0;

export function getSessionAbortSignal(): AbortSignal {
  return sessionAbortCtrl.signal;
}

export function getSessionVersion(): number {
  return sessionVersion;
}

/**
 * Snapshot-fed streaming guard: per-session one-shot timer that fires
 * when a `snapshot` event arrives with `isStreaming: true` but no
 * real `agent_start` or `agent_end` follows within 30 seconds.
 *
 * Why this exists: the server's `session.isStreaming` can get stuck
 * at `true` after an agent turn completes (server-side race). When
 * the client reconnects (page refresh, tab switch, network blip), the
 * `snapshot` copies that stuck flag → the sidebar shows "Thinking…"
 * forever with no way to clear it, because no `agent_end` will ever
 * arrive.
 *
 * The existing stale-streaming recovery only handles sessions whose
 * SSE controller has been removed from the `controllers` Map. This
 * guard handles the other case: the controller IS present (SSE stream
 * is healthy) but the server's flag is wrong.
 *
 * A legitimate, long-running agent will start a turn (agent_start →
 * timer cancelled) or finish (agent_end → timer cancelled) within the
 * window. If neither arrives, the streaming state is almost certainly
 * stale and safe to force-clear.
 */
const snapshotGuardTimers = new Map<string, ReturnType<typeof setTimeout>>();
const SNAPSHOT_GUARD_MS = 30_000;

function clearSnapshotGuard(sessionId: string): void {
  const t = snapshotGuardTimers.get(sessionId);
  if (t !== undefined) {
    clearTimeout(t);
    snapshotGuardTimers.delete(sessionId);
  }
}

/**
 * Tracks when each session's streamingBySession was last set to true.
 * Used by snapshot guard and future timeout mechanisms.
 */
const streamingStartTimestamps = new Map<string, number>();

function touchStreamingStart(sessionId: string): void {
  if (!streamingStartTimestamps.has(sessionId)) {
    streamingStartTimestamps.set(sessionId, Date.now());
  }
}
function clearStreamingStart(sessionId: string): void {
  streamingStartTimestamps.delete(sessionId);
}

/**
 * Global event stream — listens for cross-session broadcasts (agent_end,
 * session_list_changed) so the sidebar stays up-to-date even when the user
 * has switched away from a running session.
 *
 * Replaces the previous 15-s background-poll approach: instead of the
 * client asking "is anyone done?" every 15 s, the server pushes
 * "session X finished" the instant it happens.
 *
 * Cost: 1 long-lived SSE connection + ~100 bytes/s heartbeat.
 */
let globalEventsController: AbortController | undefined;

function connectGlobalEvents(): void {
  if (globalEventsController !== undefined) return;
  const ctrl = new AbortController();
  globalEventsController = ctrl;

  void streamSSE<IncomingEvent>("/api/v1/events", {
    signal: ctrl.signal,
    onEvent: (_event) => {
      const event = _event as { type?: string; sessionId?: string; projectId?: string };
      if (event.type === "agent_end" && event.sessionId) {
        const state = useSessionStore.getState();
        const sid = event.sessionId;
        const wasStreaming = !!state.streamingBySession[sid];
        useSessionStore.setState((s) => ({
          streamingBySession: { ...s.streamingBySession, [sid]: false },
          activeToolBySession: { ...s.activeToolBySession, [sid]: undefined },
          unacknowledgedEnds: { ...s.unacknowledgedEnds, [sid]: true },
        }));
        if (wasStreaming) {
          clearStreamingStart(sid);
          clearSnapshotGuard(sid);
        }
        const pid = findProjectIdForSession(state, sid);
        if (pid) scheduleListRefetch(pid);
      }
      if (event.type === "session_list_changed" && event.projectId) {
        scheduleListRefetch(event.projectId);
      }
    },
    onClose: () => {
      globalEventsController = undefined;
    },
  });
}

function disconnectGlobalEvents(): void {
  if (globalEventsController !== undefined) {
    globalEventsController.abort();
    globalEventsController = undefined;
  }
}

/**
 * Phase 8 keeps the message type loose — pi's AgentMessage union is rich
 * (UserMessage, AssistantMessage with content blocks, ToolResultMessage,
 * BashExecutionMessage, etc.) and the chat view rendering matches on
 * `role`/`type` shapes at runtime. A typed import from
 * `@earendil-works/pi-agent-core` would couple the client bundle to the SDK
 * version and bloat it; the runtime check at the renderer boundary is
 * cheaper.
 */
export interface AgentMessageLike {
  role?: string;
  type?: string;
  [k: string]: unknown;
}

/**
 * Per-compaction archive shipped by GET /sessions/:id/compactions.
 * Server-derived from the JSONL entries — see
 * packages/server/src/compaction-history.ts. The chat view splices a
 * card at `insertBeforeIndex` in the post-compaction messages array;
 * `archivedMessages` renders behind a disclosure when the user wants
 * the detail.
 */
export interface CompactionEvent {
  id: string;
  timestamp: string;
  summary: string;
  tokensBefore: number;
  insertBeforeIndex: number;
  archivedMessages: AgentMessageLike[];
}

/**
 * Compact summary of the tool currently running on the agent. We pull a
 * one-line summary out of the SDK's `tool_execution_start` event so the
 * chat view can render "running `bash`: `ls`" instead of "Thinking…".
 */
export interface ActiveTool {
  name: string;
  /** Optional one-line context (filename, command, etc.) — best-effort. */
  summary?: string;
}

/**
 * Wire-shape of an SSE event from the bridge. `snapshot` carries the full
 * messages array on connect; everything else is an AgentSessionEvent
 * variant whose `type` discriminates how the store handles it.
 */
export interface IncomingEvent {
  type: string;
  sessionId?: string;
  projectId?: string;
  messages?: AgentMessageLike[];
  isStreaming?: boolean;
  // assistant-message events carry incremental updates the renderer
  // hydrates by replaying snapshot's `messages` array.
  [k: string]: unknown;
}

/**
 * Walk an optimistic user message and revoke any blob URLs it owns
 * before discarding it. Optimistic image attachments are stored as
 * `{ type: "image", data: <blob URL>, __blobUrl: true }`; without
 * `URL.revokeObjectURL` the URL retains the entire `File` for the
 * lifetime of the page. Called on rollback, on canonical refetch,
 * and on dispose so the same URL never outlives its usefulness.
 */
function revokeOptimisticBlobUrls(messages: readonly AgentMessageLike[]): void {
  for (const m of messages) {
    if (m.role !== "user") continue;
    if (!Array.isArray(m.content)) continue;
    for (const block of m.content) {
      const b = block as { type?: unknown; data?: unknown; __blobUrl?: unknown };
      if (b.type === "image" && b.__blobUrl === true && typeof b.data === "string") {
        try {
          URL.revokeObjectURL(b.data);
        } catch {
          // ignore — already revoked, or non-browser environment
        }
      }
    }
  }
}

/**
 * Build a partial-state update that removes every per-session entry
 * a session keeps: messages, streaming flags, banner, streaming text,
 * active-tool, agent-end count, queued, and the byProject list entry.
 * Does NOT touch HTTP — that's the caller's job (`disposeSession`
 * issues DELETE; the SSE-404 path doesn't need to).
 *
 * Also clears `activeSessionId` if it pointed at the removed session.
 * Caller is responsible for clearing the localStorage `active-session-id`
 * if appropriate (see disposeSession).
 *
 * Revokes blob URLs in the soon-to-be-discarded messages so optimistic
 * image attachments that never got refetched don't leak.
 */
function findProjectIdForSession(state: SessionState, sessionId: string): string | undefined {
  for (const [pid, list] of Object.entries(state.byProject)) {
    if (list.some((u) => u.sessionId === sessionId)) return pid;
  }
  return undefined;
}

function removeSessionFromState(current: SessionState, sessionId: string): Partial<SessionState> {
  const stale = current.messagesBySession[sessionId];
  if (stale !== undefined) revokeOptimisticBlobUrls(stale);
  const nextMessages = { ...current.messagesBySession };
  delete nextMessages[sessionId];
  const nextStreaming = { ...current.streamingBySession };
  delete nextStreaming[sessionId];
  const nextBanner = { ...current.bannerBySession };
  delete nextBanner[sessionId];
  const nextDismissed = { ...current.dismissedErrorBySession };
  delete nextDismissed[sessionId];
  const nextStreamingText = { ...current.streamingTextBySession };
  delete nextStreamingText[sessionId];
  const nextActiveTool = { ...current.activeToolBySession };
  delete nextActiveTool[sessionId];
  const nextAgentEndCount = { ...current.agentEndCountBySession };
  delete nextAgentEndCount[sessionId];
  const nextQueued = { ...current.queuedBySession };
  delete nextQueued[sessionId];
  const byProject: Record<string, UnifiedSession[]> = {};
  for (const [pid, list] of Object.entries(current.byProject)) {
    byProject[pid] = list.filter((u) => u.sessionId !== sessionId);
  }
  return {
    messagesBySession: nextMessages,
    streamingBySession: nextStreaming,
    bannerBySession: nextBanner,
    dismissedErrorBySession: nextDismissed,
    streamingTextBySession: nextStreamingText,
    activeToolBySession: nextActiveTool,
    agentEndCountBySession: nextAgentEndCount,
    queuedBySession: nextQueued,
    byProject,
    activeSessionId: current.activeSessionId === sessionId ? undefined : current.activeSessionId,
  };
}

interface SessionState {
  /** Sessions per project, deduped + recency-sorted (matches GET /sessions). */
  byProject: Record<string, UnifiedSession[]>;
  /** Active session id (persisted across reload). */
  activeSessionId: string | undefined;
  /** Per-session SSE-fed message arrays, keyed by sessionId. */
  messagesBySession: Record<string, AgentMessageLike[]>;
  /**
   * Per-session compaction archive — one entry per pi compact() call.
   * Sourced from the GET /sessions/:id/compactions REST endpoint
   * (NOT the SSE stream — fetched on session open and on every
   * compaction_end event). The chat view splices a CompactionCard
   * into messagesBySession at each event's `insertBeforeIndex`,
   * letting the user expand the archive that the SDK summarised
   * away. See packages/server/src/compaction-history.ts for the
   * shape contract.
   */
  compactionsBySession: Record<string, CompactionEvent[]>;
  /**
   * Per-session pending input draft set by setPendingDraft and
   * consumed by ChatInput's session-change effect (one-shot). Used
   * to seed the input after fork-with-edit so the user message
   * being retried lands in the textarea ready to mutate.
   */
  pendingDraftBySession: Record<string, string>;
  /** Per-session streaming state from snapshot/agent_start/agent_end. */
  streamingBySession: Record<string, boolean>;
  /**
   * Sessions whose agent_end was received via the global event channel
   * while the user was on a different session.  The sidebar shows a
   * green checkmark (✓) for these until the user clicks to acknowledge.
   */
  unacknowledgedEnds: Record<string, boolean>;
  /** Per-session last-known toolEvent + retry banners (lightly modelled). */
  bannerBySession: Record<string, string | undefined>;
  /**
   * Tracks the last error banner that was dismissed (either manually or
   * via model switch) per session. When `agent_end` fires with the same
   * error message, it is treated as a stale residue from a previous agent
   * round and suppressed. Cleared when a new `agent_start` fires (new
   * turn = fresh state) or the error changes.
   */
  dismissedErrorBySession: Record<string, string | undefined>;
  /**
   * Live assistant text being streamed in by message_update events. Reset on
   * agent_start, accumulates deltas, cleared on agent_end (the authoritative
   * messages array refetched by `getMessages` then carries the final text).
   */
  streamingTextBySession: Record<string, string>;
  /**
   * Per-session "agent is currently running tool X" indicator. Set on
   * tool_execution_start, cleared on tool_execution_end. The chat view
   * surfaces this in place of the generic "Thinking…" placeholder so the
   * user sees what the agent is actually doing (running bash, reading a
   * file, etc.) instead of an opaque spinner.
   */
  activeToolBySession: Record<string, ActiveTool | undefined>;
  /**
   * Per-session monotonic counter incremented on every `agent_end`
   * event the client observes. Components that need to react to
   * "the agent just finished" (e.g. the file-tree refresh in App.tsx)
   * key effects on this counter instead of on a derived signal like
   * messages.length, which fires on benign array-replacement refetches
   * too. Cheap to compare; no allocations.
   */
  agentEndCountBySession: Record<string, number>;
  changedFilesBySession: Record<string, string[]>;
  /**
   * Per-session monotonic counter incremented on every
   * `compaction_end` event. Mirrors `agentEndCountBySession` for
   * compaction events specifically — components that need to react to
   * "compaction just happened" (e.g. ContextInspectorPanel re-fetching
   * token usage, since the SDK rewrites context size on compaction)
   * key off this counter. Separate from agentEndCount so we don't
   * cascade unrelated agent_end-only side effects.
   */
  compactionEndCountBySession: Record<string, number>;
  /**
   * Per-session queued-message snapshot from the SDK's `queue_update`
   * event. `steering` and `followUp` arrays mirror the SDK's two
   * queues — Pi delivers steering at the next agent decision point
   * (mid-tool boundary), followUp once the agent goes fully idle.
   * Cleared by an empty queue_update from the SDK; we don't try to
   * pop entries optimistically.
   */
  queuedBySession: Record<string, { steering: string[]; followUp: string[] } | undefined>;
  /**
   * Per-session pending scroll target (zero-based message index) set
   * by the global search bar when a result is clicked. ChatView reads
   * this on session activation, scrolls to the matching message, then
   * calls `consumePendingScroll` so a subsequent activation of the
   * same session doesn't re-trigger the scroll.
   */
  pendingScrollByMessageIndex: Record<string, number>;
  /** Errors surfaced from API calls (sticky until next successful op). */
  error: string | undefined;
  loadingList: boolean;
  /**
   * Session id that should auto-enter rename mode on next render.
   * Set by `createSession` so the sidebar immediately shows an
   * editable name input for the newly created session. Consumed
   * (cleared) by `consumePendingRename` once the SessionList picks
   * it up.
   */
  pendingRenameSessionId: string | undefined;

  loadSessionsForProject: (projectId: string) => Promise<void>;
  createSession: (projectId: string) => Promise<SessionSummary>;
  renameSession: (sessionId: string, name: string) => Promise<void>;
  setActiveSession: (sessionId: string | undefined) => void;
  openStream: (sessionId: string) => void;
  closeStream: (sessionId: string) => void;
  acknowledgeEnd: (sessionId: string) => void;
  /**
   * Force a one-shot messages refetch for a session, independent of
   * the SSE event loop. Used after operations that change the
   * server-side leaf without firing an agent event (e.g. tree
   * navigation) — without this, the chat surface stays stuck on the
   * pre-navigate message list until the next agent_end.
   */
  reloadMessages: (sessionId: string) => void;
  /**
   * Fetch the per-compaction archive for a session and stash it in
   * `compactionsBySession`. Called on session open + after every
   * `compaction_end` event. Failures are non-fatal — the chat
   * still renders without the cards.
   */
  loadCompactions: (sessionId: string) => Promise<void>;
  /**
   * Pre-fill the chat input on next render for `sessionId`. Used by
   * the session tree's "edit & resubmit" fork flow: we fork from a
   * user message's parent (so the user message is NOT in the new
   * session's history) then prefill the input with the original
   * text so the user can edit and send. Consumed once by
   * ChatInput's session-change effect and cleared via
   * `consumePendingDraft`.
   */
  setPendingDraft: (sessionId: string, draft: string) => void;
  consumePendingDraft: (sessionId: string) => void;
  /** Consume + clear the pending rename signal for a newly created session. */
  consumePendingRename: () => string | undefined;
  /** Set the pending scroll target for `sessionId` (used by global search). */
  requestScrollToMessage: (sessionId: string, messageIndex: number) => void;
  /** Consume + clear the pending scroll target for `sessionId`. */
  consumePendingScroll: (sessionId: string) => number | undefined;
  sendPrompt: (sessionId: string, text: string, attachments?: File[]) => Promise<void>;
  sendSteer: (sessionId: string, text: string, mode?: "steer" | "followUp") => Promise<void>;
  abortSession: (sessionId: string) => Promise<void>;
  disposeSession: (sessionId: string) => Promise<void>;
  /**
   * User-initiated dismiss of the per-session amber banner. Just sets
   * `bannerBySession[sessionId]` to undefined — the next agent event
   * (auto-retry, compaction, stream error) is free to set a new value,
   * which is the intended behaviour: dismissing acknowledges THIS
   * banner, not the underlying state. If the cause is still active
   * the banner reappears on the next event.
   */
  clearBanner: (sessionId: string) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  byProject: {},
  activeSessionId: localStorage.getItem(ACTIVE_SESSION_KEY) ?? undefined,
  messagesBySession: {},
  compactionsBySession: {},
  pendingDraftBySession: {},
  streamingBySession: {},
  unacknowledgedEnds: {},
  bannerBySession: {},
  dismissedErrorBySession: {},
  streamingTextBySession: {},
  activeToolBySession: {},
  agentEndCountBySession: {},
  changedFilesBySession: {},
  compactionEndCountBySession: {},
  queuedBySession: {},
  pendingScrollByMessageIndex: {},
  error: undefined,
  loadingList: false,
  pendingRenameSessionId: undefined,

  loadSessionsForProject: async (projectId) => {
    const lastFetch = listFetchTimestamps.get(projectId) ?? 0;
    if (Date.now() - lastFetch < LIST_FRESH_MS) return;
    listFetchTimestamps.set(projectId, Date.now());
    set({ loadingList: true, error: undefined });
    try {
      const { sessions } = await api.listSessions(projectId);
      const sorted = [...sessions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      set((s) => ({
        byProject: { ...s.byProject, [projectId]: sorted },
        loadingList: false,
      }));
    } catch (err) {
      set({
        loadingList: false,
        error: err instanceof ApiError ? err.code : (err as Error).message,
      });
    }
  },

  createSession: async (projectId) => {
    set({ error: undefined });
    try {
      const summary = await api.createSession(projectId);
      // Optimistic insert into the project's session list so the sidebar
      // updates immediately without a refetch.
      const unified: UnifiedSession = {
        sessionId: summary.sessionId,
        projectId: summary.projectId,
        isLive: true,
        workspacePath: summary.workspacePath,
        lastActivityAt: summary.lastActivityAt,
        createdAt: summary.createdAt,
        messageCount: summary.messageCount,
        firstMessage: "",
      };
      if (summary.name !== undefined) unified.name = summary.name;
      set((s) => {
        const existing = s.byProject[projectId] ?? [];
        return {
          byProject: { ...s.byProject, [projectId]: [unified, ...existing] },
          pendingRenameSessionId: summary.sessionId,
        };
      });
      get().setActiveSession(summary.sessionId);
      // Cross-tab: tell other browser tabs viewing this project so
      // their sidebar inserts the new session immediately. Without
      // this, tab B doesn't know about tab A's session until the
      // user manually refreshes.
      postCrossTab({
        type: "session_created",
        projectId,
        session: unified as unknown as Record<string, unknown>,
      });
      return summary;
    } catch (err) {
      set({ error: err instanceof ApiError ? err.code : (err as Error).message });
      throw err;
    }
  },

  renameSession: async (sessionId, name) => {
    set({ error: undefined });
    try {
      const summary = await api.renameSession(sessionId, name);
      // Propagate the new name into every project's session list so the
      // sidebar updates without a refetch. The summary's `name` is
      // undefined when cleared — mirror that into the unified shape.
      set((s) => {
        const byProject: Record<string, UnifiedSession[]> = {};
        for (const [pid, list] of Object.entries(s.byProject)) {
          byProject[pid] = list.map((u) => {
            if (u.sessionId !== sessionId) return u;
            const next: UnifiedSession = { ...u };
            if (summary.name !== undefined) next.name = summary.name;
            else delete next.name;
            return next;
          });
        }
        return { byProject };
      });
      // Cross-tab: other browser tabs reflect the rename in their
      // sidebar without a refetch.
      postCrossTab({ type: "session_renamed", sessionId, name: summary.name });
    } catch (err) {
      set({ error: err instanceof ApiError ? err.code : (err as Error).message });
      throw err;
    }
  },

  reloadMessages: (sessionId) => {
    // Goes through the same coalesced refetch path the SSE event
    // loop uses, so a navigate-then-stream race can't double-fetch.
    scheduleMessagesRefetch(set, sessionId);
  },

  loadCompactions: async (sessionId) => {
    try {
      const r = await api.getCompactions(sessionId);
      set((s) => ({
        compactionsBySession: {
          ...s.compactionsBySession,
          [sessionId]: r.compactions,
        },
      }));
    } catch {
      // Non-fatal — chat just renders without the cards. Don't
      // surface as `error` because that's the noisy global banner;
      // a missing compaction archive isn't worth interrupting the
      // user's session for.
    }
  },

  setPendingDraft: (sessionId, draft) =>
    set((s) => ({
      pendingDraftBySession: { ...s.pendingDraftBySession, [sessionId]: draft },
    })),

  consumePendingDraft: (sessionId) =>
    set((s) => {
      if (s.pendingDraftBySession[sessionId] === undefined) return {};
      const next = { ...s.pendingDraftBySession };
      delete next[sessionId];
      return { pendingDraftBySession: next };
    }),

  consumePendingRename: () => {
    const id = get().pendingRenameSessionId;
    if (id !== undefined) set({ pendingRenameSessionId: undefined });
    return id;
  },

  requestScrollToMessage: (sessionId, messageIndex) =>
    set((s) => ({
      pendingScrollByMessageIndex: {
        ...s.pendingScrollByMessageIndex,
        [sessionId]: messageIndex,
      },
    })),

  consumePendingScroll: (sessionId) => {
    const value = get().pendingScrollByMessageIndex[sessionId];
    if (value === undefined) return undefined;
    set((s) => {
      const next = { ...s.pendingScrollByMessageIndex };
      delete next[sessionId];
      return { pendingScrollByMessageIndex: next };
    });
    return value;
  },

  setActiveSession: (sessionId) => {
    const prev = get().activeSessionId;
    if (prev !== undefined && prev !== sessionId) {
      if (streamCtrl) {
        streamCtrl.abort();
        streamCtrl = undefined;
        streamSessionId = undefined;
      }
      sessionAbortCtrl.abort();
      sessionAbortCtrl = new AbortController();
      sessionVersion++;
      clearStreamingStart(prev);
      clearSnapshotGuard(prev);
    }
    if (sessionId !== undefined) localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
    else localStorage.removeItem(ACTIVE_SESSION_KEY);
    set((s) => {
      const ue = sessionId ? { ...s.unacknowledgedEnds } : s.unacknowledgedEnds;
      if (sessionId) delete ue[sessionId];
      return {
        activeSessionId: sessionId,
        unacknowledgedEnds: ue,
        ...(prev !== undefined && prev !== sessionId
          ? { activeToolBySession: { ...s.activeToolBySession, [prev]: undefined } }
          : {}),
      };
    });
    if (sessionId !== undefined && sessionId !== prev) {
      void Promise.resolve().then(() => {
        if (get().activeSessionId !== sessionId) return;
        get().openStream(sessionId);
      });
    }
  },

  openStream: (sessionId) => {
    if (streamSessionId === sessionId && streamCtrl && !streamCtrl.signal.aborted) return;
    if (streamCtrl) streamCtrl.abort();
    const ctrl = new AbortController();
    streamCtrl = ctrl;
    streamSessionId = sessionId;

    const onTerminate = (): void => {
      if (streamCtrl === ctrl) {
        streamCtrl = undefined;
        streamSessionId = undefined;
      }
    };

    void streamSSE<IncomingEvent>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/stream`, {
      signal: ctrl.signal,
      onEvent: (event) => applyEvent(set, get, sessionId, event),
      onClose: onTerminate,
      onReconnect: ({ attempt, delayMs, reason }) => {
        set((s) => ({
          bannerBySession: {
            ...s.bannerBySession,
            [sessionId]: `Reconnecting (attempt ${attempt}, ${Math.round(delayMs / 1000)}s) — ${reason}`,
          },
        }));
      },
    }).catch((err: unknown) => {
      if (err instanceof ApiError && err.status === 404) {
        set((s) => removeSessionFromState(s, sessionId));
        if (get().activeSessionId === undefined) {
          localStorage.removeItem(ACTIVE_SESSION_KEY);
        }
        onTerminate();
        return;
      }
      const code = err instanceof ApiError ? err.code : (err as Error).message;
      set((s) => ({
        bannerBySession: { ...s.bannerBySession, [sessionId]: `stream error: ${code}` },
      }));
      onTerminate();
    });
  },

  closeStream: (sessionId) => {
    if (streamSessionId === sessionId && streamCtrl) {
      streamCtrl.abort();
      streamCtrl = undefined;
      streamSessionId = undefined;
    }
  },

  acknowledgeEnd: (sessionId: string) => {
    set((s) => {
      if (!s.unacknowledgedEnds[sessionId]) return s;
      const next = { ...s.unacknowledgedEnds };
      delete next[sessionId];
      return { unacknowledgedEnds: next };
    });
  },

  sendPrompt: async (sessionId, text, attachments) => {
    set({ error: undefined });
    // Optimistically append the user message so the chat reflects the input
    // immediately. If the server rejects (no API key, no model, etc.) the
    // catch below rolls it back. If it accepts, the eventual messages
    // refetch on agent_end will replace this with the canonical entry.
    //
    // For attachments, we render image thumbnails inline and chips for
    // text files. The optimistic shape mirrors what the SDK produces
    // for user messages with attachments — text content + image
    // blocks — so the renderer doesn't have to special-case the
    // pre-refetch state.
    const optimisticContent: Record<string, unknown>[] = [{ type: "text", text }];
    if (attachments !== undefined) {
      for (const f of attachments) {
        if (f.type.startsWith("image/")) {
          // Use a blob URL for the optimistic preview — cheap to
          // render and gets garbage-collected when the canonical
          // refetch replaces this entry.
          optimisticContent.push({
            type: "image",
            mimeType: f.type,
            data: URL.createObjectURL(f),
            // Mark this is a blob URL the renderer should treat as a
            // direct src rather than re-prefixing with `data:...`.
            __blobUrl: true,
          });
        } else {
          optimisticContent.push({
            type: "file",
            filename: f.name,
            size: f.size,
          });
        }
      }
    }
    const optimistic: AgentMessageLike = {
      role: "user",
      content: optimisticContent,
      timestamp: Date.now(),
    };
    set((s) => ({
      messagesBySession: {
        ...s.messagesBySession,
        [sessionId]: [...(s.messagesBySession[sessionId] ?? []), optimistic],
      },
    }));
    try {
      const opts: Parameters<typeof api.prompt>[2] = {};
      if (attachments !== undefined && attachments.length > 0) opts.attachments = attachments;
      await api.prompt(sessionId, text, opts);
    } catch (err) {
      // Roll back the optimistic append on failure. Revoke any blob
      // URLs the optimistic message owns BEFORE we drop the
      // reference, otherwise they stay alive forever.
      revokeOptimisticBlobUrls([optimistic]);
      set((s) => {
        const cur = s.messagesBySession[sessionId] ?? [];
        return {
          messagesBySession: {
            ...s.messagesBySession,
            [sessionId]: cur.filter((m) => m !== optimistic),
          },
          error: err instanceof ApiError ? err.code : (err as Error).message,
          bannerBySession: {
            ...s.bannerBySession,
            [sessionId]:
              err instanceof ApiError
                ? `prompt rejected: ${err.code}${err.message !== `${err.status} ${err.code}` ? ` — ${err.message}` : ""}`
                : `prompt rejected: ${(err as Error).message}`,
          },
        };
      });
      throw err;
    }
  },

  sendSteer: async (sessionId, text, mode) => {
    set({ error: undefined });
    try {
      await api.steer(sessionId, text, mode);
    } catch (err) {
      set({ error: err instanceof ApiError ? err.code : (err as Error).message });
      throw err;
    }
  },

  abortSession: async (sessionId) => {
    set({ error: undefined });
    try {
      await api.abort(sessionId);
    } catch (err) {
      set({ error: err instanceof ApiError ? err.code : (err as Error).message });
    }
  },

  disposeSession: async (sessionId) => {
    set({ error: undefined });
    try {
      get().closeStream(sessionId);
      // Capture projectId before we wipe the entry — cross-tab
      // listeners only need the id, but we may want to filter by
      // project later.
      const priorProjectId = findProjectIdForSession(get(), sessionId);
      await api.disposeSession(sessionId);
      set((s) => removeSessionFromState(s, sessionId));
      if (get().activeSessionId === undefined) {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
      // Cross-tab: other browser tabs drop the session from their
      // sidebar without waiting for their SSE to 404 on next
      // reconnect (the SSE 404 path stays in place as a safety net
      // for sessions deleted out-of-band — server restart, manual
      // JSONL cleanup, etc.).
      if (priorProjectId !== undefined) {
        postCrossTab({ type: "session_deleted", projectId: priorProjectId, sessionId });
        // Cascade refetch: the server hard-delete also rm -rf's any
        // pi-subagents child session JSONLs sitting under the
        // parent's directory (see deleteColdSession in
        // session-registry.ts). The local removeSessionFromState
        // above only knows about the parent id — without a refetch,
        // those children linger in byProject as sidebar orphans
        // pointing at deleted files.
        scheduleListRefetch(priorProjectId);
      }
    } catch (err) {
      set({ error: err instanceof ApiError ? err.code : (err as Error).message });
    }
  },
  clearBanner: (sessionId) => {
    set((s) => {
      const current = s.bannerBySession[sessionId];
      return {
        bannerBySession: { ...s.bannerBySession, [sessionId]: undefined },
        dismissedErrorBySession:
          current !== undefined
            ? { ...s.dismissedErrorBySession, [sessionId]: current }
            : s.dismissedErrorBySession,
      };
    });
  },
}));

const storedId = localStorage.getItem(ACTIVE_SESSION_KEY);
if (storedId) {
  useSessionStore.getState().openStream(storedId);
}

/**
 * Single dispatch point for SSE events. The bridge sends a `snapshot` first;
 * subsequent events are AgentSessionEvent variants. We coarsely re-fetch the
 * session's messages array on terminal events (agent_end, tool_result, etc.)
 * to stay correct without modelling every incremental delta — the bandwidth
 * is fine for chat-tier traffic and avoids drift between SDK message shapes.
 */
function applyEvent(
  set: (update: Partial<SessionState> | ((s: SessionState) => Partial<SessionState>)) => void,
  get: () => SessionState,
  sessionId: string,
  event: IncomingEvent,
): void {
  // Any SSE activity indicates the stream is alive and the server-side
  // session is progressing — reset the orphan guard to avoid false
  // positives on legitimately running agents.
  clearSnapshotGuard(sessionId);

  if (event.type === "snapshot") {
    // Clear any "Reconnecting…" banner — snapshot arriving means we're
    // back online with fresh server state. Active-tool also resets:
    // tool execution events fire fresh after a reconnect; an old badge
    // would otherwise stick around indefinitely.
    const incoming = event.messages ?? [];
    set((s) => {
      const existing = s.messagesBySession[sessionId];
      const sameLength =
        existing !== undefined && existing.length === incoming.length;
      return {
        messagesBySession: {
          ...s.messagesBySession,
          [sessionId]: sameLength ? existing : incoming,
        },
        streamingBySession: {
          ...s.streamingBySession,
          [sessionId]: event.isStreaming ?? false,
        },
        bannerBySession: { ...s.bannerBySession, [sessionId]: undefined },
        activeToolBySession: { ...s.activeToolBySession, [sessionId]: undefined },
      };
    });
    // Snapshot-fed streaming guard: if the server reports isStreaming
    // but no real agent_start/agent_end follows within the window,
    // the server flag is probably stuck — force-clean below.
    clearSnapshotGuard(sessionId);
    if (event.isStreaming ?? false) {
      touchStreamingStart(sessionId);
      snapshotGuardTimers.set(
        sessionId,
        setTimeout(() => {
          const state = useSessionStore.getState();
          if (state.streamingBySession[sessionId] !== true) return;
          useSessionStore.setState((s) => ({
            streamingBySession: { ...s.streamingBySession, [sessionId]: false },
            activeToolBySession: { ...s.activeToolBySession, [sessionId]: undefined },
          }));
          clearStreamingStart(sessionId);
          const pid = findProjectIdForSession(useSessionStore.getState(), sessionId);
          if (pid !== undefined) scheduleListRefetch(pid);
        }, SNAPSHOT_GUARD_MS),
      );
    } else {
      clearStreamingStart(sessionId);
    }
    return;
  }

  if (event.type === "agent_start") {
    const stale = pendingRaf.get(sessionId);
    if (stale !== undefined) cancelAnimationFrame(stale);
    pendingRaf.delete(sessionId);
    pendingDeltas.delete(sessionId);
    clearSnapshotGuard(sessionId);
    touchStreamingStart(sessionId);
    set((s) => {
      const ue = { ...s.unacknowledgedEnds };
      delete ue[sessionId];
      return {
        streamingBySession: { ...s.streamingBySession, [sessionId]: true },
        streamingTextBySession: { ...s.streamingTextBySession, [sessionId]: "" },
        bannerBySession: { ...s.bannerBySession, [sessionId]: undefined },
        unacknowledgedEnds: ue,
        changedFilesBySession: { ...s.changedFilesBySession, [sessionId]: [] },
      };
    });
    return;
  }

  if (event.type === "agent_end") {
    // Capture the business time of the agent finish from the server-supplied
    // timestamp. This becomes post-agent.createdAt so the snapshot's
    // createdAt reflects "agent finished" rather than the delayed moment
    // createSnapshot happens to finish running on disk.
    const agentEndTime = typeof event.agentEndTime === "string" ? event.agentEndTime : undefined;
    // Cancel the pending RAF — the post-end refetch supersedes any
    // unflushed deltas.
    const raf = pendingRaf.get(sessionId);
    if (raf !== undefined) cancelAnimationFrame(raf);
    pendingRaf.delete(sessionId);
    pendingDeltas.delete(sessionId);
    // Agent finished normally — clear the orphan guard regardless of
    // whether it was set by snapshot or agent_start.
    clearSnapshotGuard(sessionId);
    clearStreamingStart(sessionId);
    // Read the server-enriched errorMessage if present (the SDK's
    // native agent_end carries no error field; session-registry merges
    // `live.session.errorMessage` in on fan-out). We surface it as an
    // amber banner so context-overflow / 401 / provider 5xx errors
    // are visible instead of disappearing into a silent empty
    // assistant message.
    const agentErr = (event as { errorMessage?: unknown }).errorMessage;
    const errorBanner =
      typeof agentErr === "string" && agentErr.length > 0 ? `Agent error: ${agentErr}` : undefined;
    // Refetch authoritative messages, then clear streaming state. Order
    // matters — the messages array must be in place before the renderer
    // drops the streamingText bubble or we'd see a momentary gap.
    const projectId = findProjectIdForSession(get(), sessionId);
    const isActive = get().activeSessionId === sessionId;

    if (!isActive) {
      set((s) => ({
        streamingBySession: { ...s.streamingBySession, [sessionId]: false },
        streamingTextBySession: { ...s.streamingTextBySession, [sessionId]: "" },
        activeToolBySession: { ...s.activeToolBySession, [sessionId]: undefined },
        unacknowledgedEnds: { ...s.unacknowledgedEnds, [sessionId]: true },
        agentEndCountBySession: {
          ...s.agentEndCountBySession,
          [sessionId]: (s.agentEndCountBySession[sessionId] ?? 0) + 1,
        },
      }));
      if (projectId !== undefined) scheduleListRefetch(projectId);
      if (projectId !== undefined) {
        const files = get().changedFilesBySession[sessionId];
        void useSnapshotStore
          .getState()
          .snapAfterAgent(
            projectId,
            "post-agent",
            sessionId,
            agentEndTime,
            files?.length ? files : undefined,
          );
      }
      return;
    }

    // ACTIVE session: immediately show green checkmark in sidebar,
    // then refetch messages in background.
    set((s) => ({
      streamingBySession: { ...s.streamingBySession, [sessionId]: false },
      streamingTextBySession: { ...s.streamingTextBySession, [sessionId]: "" },
      activeToolBySession: { ...s.activeToolBySession, [sessionId]: undefined },
      unacknowledgedEnds: { ...s.unacknowledgedEnds, [sessionId]: true },
      agentEndCountBySession: {
        ...s.agentEndCountBySession,
        [sessionId]: (s.agentEndCountBySession[sessionId] ?? 0) + 1,
      },
    }));

    void api
      .getMessages(sessionId)
      .then(({ messages }) => {
        set((s) => {
          const stale = s.messagesBySession[sessionId];
          if (stale !== undefined) revokeOptimisticBlobUrls(stale);
          const existingBanner = s.bannerBySession[sessionId];
          const dismissed = s.dismissedErrorBySession[sessionId];
          const nextBanner =
            errorBanner !== undefined && errorBanner === dismissed
              ? undefined
              : (errorBanner ?? existingBanner);
          const nextDismissed =
            errorBanner === undefined ? undefined : s.dismissedErrorBySession[sessionId];
          return {
            messagesBySession: { ...s.messagesBySession, [sessionId]: messages },
            bannerBySession: { ...s.bannerBySession, [sessionId]: nextBanner },
            dismissedErrorBySession: { ...s.dismissedErrorBySession, [sessionId]: nextDismissed },
          };
        });
        // Refresh session list so isLive / lastActivityAt etc. sync
        // from server — without this the sidebar spinner may stay
        // stuck or the session metadata goes stale.
        if (projectId !== undefined) scheduleListRefetch(projectId);
        // Post-agent snapshot: capture the AI's result on disk after this turn.
        // Fire-and-forget is safe here — the snapshot is a bonus record that
        // doesn't need to block the UI from re-enabling.
        if (projectId !== undefined) {
          const lastMsg = messages[messages.length - 1];
          const label =
            typeof lastMsg?.content === "string" ? lastMsg.content.slice(0, 60) : "post-agent";
          const files = get().changedFilesBySession[sessionId];
          void useSnapshotStore
            .getState()
            .snapAfterAgent(
              projectId,
              label,
              sessionId,
              agentEndTime,
              files?.length ? files : undefined,
            );
        }
      })
      .catch(() => {
        // If the refetch fails, at least flip streaming off so the
        // input re-enables. The chat view stays out-of-date until
        // the next interaction. Bump the counter regardless — consumers
        // (file-tree refresh, etc.) should still react even if the
        // refetch failed: the on-disk state likely changed.
        //
        // Surface a per-session banner so the user knows the chat
        // they're looking at is stale — without this, the spinner
        // disappears and the chat looks healthy when it isn't.
        set((s) => ({
          streamingBySession: { ...s.streamingBySession, [sessionId]: false },
          activeToolBySession: { ...s.activeToolBySession, [sessionId]: undefined },
          bannerBySession: {
            ...s.bannerBySession,
            // If the agent reported an error, that's the more useful
            // message to show; otherwise surface the refetch failure.
            [sessionId]:
              errorBanner ?? "Couldn't refresh messages after the agent finished — reload to sync",
          },
          agentEndCountBySession: {
            ...s.agentEndCountBySession,
            [sessionId]: (s.agentEndCountBySession[sessionId] ?? 0) + 1,
          },
        }));
        // Still try to refresh the list on failure — the session likely
        // ended even if we couldn't pull fresh messages.
        if (projectId !== undefined) scheduleListRefetch(projectId);
        // Still create post-agent snapshot even when messages refetch fails —
        // the agent already finished and changed files on disk.
        if (projectId !== undefined) {
          const files = get().changedFilesBySession[sessionId];
          void useSnapshotStore
            .getState()
            .snapAfterAgent(
              projectId,
              "post-agent",
              sessionId,
              agentEndTime,
              files?.length ? files : undefined,
            );
        }
      });
    return;
  }

  if (event.type === "queue_update") {
    const ev = event as { steering?: unknown; followUp?: unknown };
    const steering = Array.isArray(ev.steering)
      ? (ev.steering as unknown[]).filter((v): v is string => typeof v === "string")
      : [];
    const followUp = Array.isArray(ev.followUp)
      ? (ev.followUp as unknown[]).filter((v): v is string => typeof v === "string")
      : [];
    set((s) => ({
      queuedBySession: {
        ...s.queuedBySession,
        // Drop the entry entirely when both queues are empty so the
        // badge unmounts cleanly rather than rendering "queued: 0".
        [sessionId]:
          steering.length === 0 && followUp.length === 0 ? undefined : { steering, followUp },
      },
    }));
    return;
  }

  if (event.type === "tool_execution_start") {
    const name = typeof event.toolName === "string" ? event.toolName : "tool";
    const input = ((event as Record<string, unknown>).args ?? {}) as Record<string, unknown>;
    const summary = summarizeToolInput(name, input);
    const tool: ActiveTool = summary !== undefined ? { name, summary } : { name };
    set((s) => {
      const updates: Record<string, unknown> = {
        activeToolBySession: { ...s.activeToolBySession, [sessionId]: tool },
      };
      if (name === "write" || name === "edit") {
        const filePath = summary;
        if (filePath !== undefined) {
          const prev = s.changedFilesBySession[sessionId] ?? [];
          if (!prev.includes(filePath)) {
            updates.changedFilesBySession = {
              ...s.changedFilesBySession,
              [sessionId]: [...prev, filePath],
            };
          }
        }
      }
      return updates;
    });
    scheduleMessagesRefetch(set, sessionId);
    return;
  }

  if (event.type === "tool_execution_end") {
    set((s) => ({
      activeToolBySession: { ...s.activeToolBySession, [sessionId]: undefined },
    }));
    // Refetch so the toolResult message (and any updated assistant
    // bubble) shows up before the next tool fires. Without this the
    // user sees a stretch of "running …" badges with no output.
    scheduleMessagesRefetch(set, sessionId);
    // (Session-list refresh for session-creating tools is now handled
    // server-side via `session_list_changed` — see the handler below.)
    return;
  }

  if (event.type === "session_list_changed") {
    // Server-pushed nudge that a session was created (or otherwise
    // mutated) in a project we're watching. Sent by
    // `orchestrate_spawn_worker` immediately after creating the
    // worker so the sidebar updates without waiting for the
    // supervisor's enclosing turn to finish.
    const pid = typeof event.projectId === "string" ? event.projectId : undefined;
    if (pid !== undefined) scheduleListRefetch(pid);
    return;
  }

  if (event.type === "message_end" || event.type === "tool_result") {
    // Fallbacks for SDK variants that don't emit tool_execution_end (or
    // that finalize an assistant message containing a toolCall before
    // any execution event fires).
    scheduleMessagesRefetch(set, sessionId);
    // openai-completions and a few other provider adapters surface
    // upstream errors as `message_end` with stopReason="error" rather
    // than throwing — so it's the only signal we get for several
    // failure modes (provider 401/402/5xx mid-tool-chain, context-
    // overflow that pi's auto-compaction couldn't recover from).
    // Surface the embedded errorMessage as a banner.
    //
    // Also drop the streaming buffer (and any in-flight RAF /
    // pendingDeltas) when an assistant message_end fires MID-TURN:
    // the refetch above has just promoted those bytes into a real
    // message, so leaving them in the streaming bubble shows the
    // text twice. Worse, the next assistant message's text_delta
    // events APPEND to the existing buffer, so the bottom bubble
    // would show "<prior message text> + <currently streaming text>"
    // until agent_end finally clears it.
    if (event.type === "message_end") {
      const msg = (
        event as { message?: { stopReason?: unknown; errorMessage?: unknown; role?: unknown } }
      ).message;
      if (msg?.stopReason === "error") {
        const m = typeof msg.errorMessage === "string" ? msg.errorMessage : "";
        if (m.length > 0) {
          set((s) => ({
            bannerBySession: { ...s.bannerBySession, [sessionId]: `Agent error: ${m}` },
          }));
        }
      }
      if (msg?.role === "assistant") {
        const raf = pendingRaf.get(sessionId);
        if (raf !== undefined) cancelAnimationFrame(raf);
        pendingRaf.delete(sessionId);
        pendingDeltas.delete(sessionId);
      }
    }
    return;
  }

  if (event.type === "ask_user_question") {
    const requestId = typeof event.requestId === "string" ? event.requestId : undefined;
    const questions = Array.isArray(event.questions) ? event.questions : undefined;
    if (requestId === undefined || questions === undefined) return;
    useAskUserQuestionStore.getState().setPending({
      requestId,
      sessionId,
      questions: questions as PendingAskQuestion["questions"],
    });
    set((s) => ({
      streamingBySession: { ...s.streamingBySession, [sessionId]: false },
      streamingTextBySession: { ...s.streamingTextBySession, [sessionId]: "" },
    }));
    clearStreamingStart(sessionId);
    return;
  }

  if (event.type === "ask_user_question_cancelled") {
    const requestId = typeof event.requestId === "string" ? event.requestId : undefined;
    useAskUserQuestionStore.getState().clearPending(sessionId, requestId);
    return;
  }

  if (event.type === "todo_update") {
    const tasks = Array.isArray(event.tasks) ? (event.tasks as TodoTaskShape[]) : [];
    const nextId = typeof event.nextId === "number" ? event.nextId : 1;
    useTodoStore.getState().set(sessionId, { tasks, nextId });
    return;
  }

  if (event.type === "process_update") {
    const processes = Array.isArray(event.processes) ? (event.processes as ProcessShape[]) : [];
    useProcessesStore.getState().setProcesses(sessionId, processes);
    return;
  }

  if (event.type === "process_watch") {
    // The match envelope carries enough metadata to render an
    // alert without a separate refetch. We push into the in-memory
    // ring (capped); the panel reads it for the alert badge.
    const match = event.match as
      | {
          processId?: unknown;
          processName?: unknown;
          source?: unknown;
          line?: unknown;
          watch?: { pattern?: unknown };
        }
      | undefined;
    if (
      match !== undefined &&
      typeof match.processId === "string" &&
      typeof match.processName === "string" &&
      (match.source === "stdout" || match.source === "stderr") &&
      typeof match.line === "string" &&
      typeof match.watch?.pattern === "string"
    ) {
      useProcessesStore.getState().pushWatch(sessionId, {
        processId: match.processId,
        processName: match.processName,
        source: match.source,
        line: match.line,
        pattern: match.watch.pattern,
        at: Date.now(),
      });
    }
    return;
  }

  if (event.type === "process_output") {
    // Throttle-debounce-friendly hook for the panel's focused
    // process: store consumers refetch on their own schedule.
    // We don't push the output payload (would saturate SSE for
    // chatty processes). No store mutation here.
    return;
  }

  if (event.type === "user_bash_result") {
    // Cross-tab: another tab on the same session ran a `!` exec. Refetch
    // so the BashExecutionMessage shows up in this tab's transcript too.
    // The acting tab refetches off the HTTP response directly and
    // doesn't wait for this round-trip.
    scheduleMessagesRefetch(set, sessionId);
    return;
  }

  if (event.type === "message_update") {
    // Accumulate text deltas into the streaming bubble. The pi SDK's
    // message_update wraps an `assistantMessageEvent` with `type: "text_delta"`
    // and a `delta` string for incremental tokens. Other delta types
    // (thinking, tool_call) we ignore here — they show up in the
    // refetched messages array on agent_end.
    const inner = event.assistantMessageEvent;
    if (
      typeof inner === "object" &&
      inner !== null &&
      (inner as { type?: string }).type === "text_delta" &&
      typeof (inner as { delta?: unknown }).delta === "string"
    ) {
      const delta = (inner as { delta: string }).delta;
      // RAF-coalesce: accumulate the delta in a module-scope buffer; flush
      // once per frame (~16ms) instead of once per token. Cuts re-render
      // pressure under fast-token providers without changing the final
      // displayed text.
      pendingDeltas.set(sessionId, (pendingDeltas.get(sessionId) ?? "") + delta);
      if (!pendingRaf.has(sessionId)) {
        const raf = requestAnimationFrame(() => {
          pendingRaf.delete(sessionId);
          const buffered = pendingDeltas.get(sessionId) ?? "";
          if (buffered.length === 0) return;
          pendingDeltas.delete(sessionId);
          set((s) => ({
            streamingTextBySession: {
              ...s.streamingTextBySession,
              [sessionId]: (s.streamingTextBySession[sessionId] ?? "") + buffered,
            },
          }));
        });
        pendingRaf.set(sessionId, raf);
      }
    }
    return;
  }

  if (event.type === "compaction_start") {
    set((s) => ({
      bannerBySession: { ...s.bannerBySession, [sessionId]: "Compacting context…" },
    }));
    return;
  }
  if (event.type === "compaction_end") {
    // Pi triggers auto-compaction on context overflow. If compaction
    // can't recover (e.g. even after summarisation the prompt still
    // exceeds the model's window), the SDK emits compaction_end with
    // an `errorMessage` field. Without surfacing it, the user briefly
    // sees "Compacting context…" then a clear banner — and an empty
    // assistant message — with no idea what went wrong. Show the
    // error if present; otherwise clear the "Compacting…" banner as
    // before.
    const compactErr = (event as { errorMessage?: unknown }).errorMessage;
    const errorBanner =
      typeof compactErr === "string" && compactErr.length > 0
        ? `Agent error: ${compactErr}`
        : undefined;
    set((s) => ({
      bannerBySession: { ...s.bannerBySession, [sessionId]: errorBanner },
      // Bump the compaction-end counter so panels that need to
      // react (ContextInspectorPanel re-fetches token usage,
      // anything else watching compaction state) get a stable
      // dependency-array signal without re-rendering on every
      // unrelated event.
      compactionEndCountBySession: {
        ...s.compactionEndCountBySession,
        [sessionId]: (s.compactionEndCountBySession[sessionId] ?? 0) + 1,
      },
    }));
    // Refetch the per-compaction archive so the chat can render a
    // CompactionCard for the just-completed event. Fire-and-forget;
    // a transient failure is fine — the next session reload picks
    // it up.
    void useSessionStore.getState().loadCompactions(sessionId);
    // Also force a messages refetch — the SDK has rewritten
    // live.session.messages to the post-compaction shape (older
    // entries archived, plus a synthesized compaction-summary
    // message), but the client's messagesBySession cache is still
    // the pre-compaction array. Without this, the user sees the
    // CompactionCard appear above stale content that the agent no
    // longer has in its context. Same coalesced refetch path the
    // agent_end handler uses.
    scheduleMessagesRefetch(set, sessionId);
    return;
  }
  if (event.type === "auto_retry_start") {
    const attempt = typeof event.attempt === "number" ? event.attempt : "?";
    const max = typeof event.maxAttempts === "number" ? event.maxAttempts : "?";
    set((s) => ({
      bannerBySession: {
        ...s.bannerBySession,
        [sessionId]: `Retrying (${attempt}/${max})…`,
      },
    }));
    // Auto-abort if retry has exceeded 5 attempts — prevent the SDK
    // from retrying indefinitely when the provider keeps failing.
    if (typeof attempt === "number" && attempt > 5) {
      void get().abortSession(sessionId);
    }
    return;
  }
  if (event.type === "auto_retry_end") {
    // SDK retried until the cap was hit. `success: false` means we
    // exhausted retries — keep the failure visible instead of
    // clearing the "Retrying…" banner. `finalError` carries the
    // last provider message.
    const succeeded = (event as { success?: unknown }).success !== false;
    const finalErr = (event as { finalError?: unknown }).finalError;
    const errorBanner =
      !succeeded && typeof finalErr === "string" && finalErr.length > 0
        ? `Agent error: ${finalErr}`
        : undefined;
    set((s) => ({
      bannerBySession: { ...s.bannerBySession, [sessionId]: errorBanner },
    }));
    return;
  }
  // (The former second `message_end` handler that lived here was
  // unreachable — the earlier `message_end || tool_result` branch
  // matched first and returned. Its error-surfacing logic has been
  // folded into that earlier branch.)

  // For message_*/tool_*/turn_* events the chat surface in Phase 8 displays
  // the latest authoritative state by re-fetching on agent_end (above).
  // Phase 9+ can add finer-grained delta application if streaming feels
  // janky on slow connections.
  void event;
  void get;
}

/**
 * Coalesced messages refetch. Fires getMessages and writes the result
 * into messagesBySession. While a fetch is inflight, additional triggers
 * mark `queued` and the same fetcher runs once more after the in-flight
 * one resolves — so a burst of tool_execution_end events collapses into
 * at most two fetches instead of N.
 */
function scheduleMessagesRefetch(
  set: (update: Partial<SessionState> | ((s: SessionState) => Partial<SessionState>)) => void,
  sessionId: string,
): void {
  const st = refetchState.get(sessionId) ?? { inflight: false, queued: false };
  if (st.inflight) {
    st.queued = true;
    refetchState.set(sessionId, st);
    return;
  }
  st.inflight = true;
  refetchState.set(sessionId, st);

  const run = (): Promise<void> =>
    api
      .getMessages(sessionId)
      .then(({ messages }) => {
        set((s) => ({
          messagesBySession: { ...s.messagesBySession, [sessionId]: messages },
        }));
      })
      .catch(() => {
        // Refetch failures are non-fatal — the next event (or
        // agent_end) will resync. The chat just stays a beat stale.
      });

  void run().finally(() => {
    const cur = refetchState.get(sessionId);
    if (cur === undefined) return;
    if (cur.queued) {
      cur.queued = false;
      cur.inflight = false;
      refetchState.set(sessionId, cur);
      scheduleMessagesRefetch(set, sessionId);
    } else {
      refetchState.delete(sessionId);
    }
  });
}

/**
 * Best-effort one-line context for the active-tool badge. Pi's tool
 * input shapes are tool-specific; we try the common fields and fall
 * back to undefined (the badge then renders the tool name only).
 */
function summarizeToolInput(name: string, input: Record<string, unknown>): string | undefined {
  const get = (k: string): string | undefined => {
    const v = input[k];
    return typeof v === "string" && v.length > 0 ? v : undefined;
  };
  switch (name) {
    case "bash":
      return get("command");
    case "read":
    case "write":
    case "edit":
      return get("filePath") ?? get("path") ?? get("file");
    case "grep":
      return get("pattern");
    case "glob":
      return get("pattern") ?? get("path");
    default: {
      // Generic fallback: first string-valued field that looks human-friendly.
      for (const key of ["path", "file", "filePath", "command", "pattern", "query", "url"]) {
        const v = get(key);
        if (v !== undefined) return v;
      }
      return undefined;
    }
  }
}

// ----- cross-tab session sync -----
//
// Listens for `session_created` / `session_deleted` / `session_renamed`
// broadcasts from sibling browser tabs and applies them to this tab's
// store. Server state IS the source of truth — broadcasts are pure
// hints. A tab that misses one (e.g. opened later) still recovers via
// the existing refetch paths (project-switch reload, SSE 404 catch).
//
// Module-level (not per-store-construction) so HMR re-evaluating the
// module doesn't accumulate listeners. Same pattern auth-store uses
// for its onUnauthorized handler.
declare global {
  var __piForgeSessionCrossTabRegistered: boolean | undefined;
  var __piForgeSessionCrossTabCleanup: (() => void) | undefined;
}
if (!globalThis.__piForgeSessionCrossTabRegistered) {
  globalThis.__piForgeSessionCrossTabCleanup = subscribeCrossTab((msg) => {
    if (msg.type === "session_created") {
      // Insert the new session into this tab's local list. Idempotent
      // — if we already know about it (race with our own next refetch),
      // skip. The payload is a plain object — coerce defensively to
      // UnifiedSession; missing fields fall back to safe defaults so a
      // malformed broadcast can't crash the sidebar.
      const s = msg.session;
      const sessionId = typeof s.sessionId === "string" ? s.sessionId : undefined;
      if (sessionId === undefined) return;
      const unified: UnifiedSession = {
        sessionId,
        projectId: msg.projectId,
        isLive: s.isLive === true,
        workspacePath: typeof s.workspacePath === "string" ? s.workspacePath : "",
        lastActivityAt:
          typeof s.lastActivityAt === "string" ? s.lastActivityAt : new Date().toISOString(),
        createdAt: typeof s.createdAt === "string" ? s.createdAt : new Date().toISOString(),
        messageCount: typeof s.messageCount === "number" ? s.messageCount : 0,
        firstMessage: typeof s.firstMessage === "string" ? s.firstMessage : "",
      };
      if (typeof s.name === "string") unified.name = s.name;
      useSessionStore.setState((st) => {
        const existing = st.byProject[msg.projectId] ?? [];
        if (existing.some((u) => u.sessionId === sessionId)) return {};
        return {
          byProject: { ...st.byProject, [msg.projectId]: [unified, ...existing] },
        };
      });
      return;
    }
    if (msg.type === "session_deleted") {
      // Same cleanup path as the local disposeSession action — drops
      // the session from byProject + every per-session map and clears
      // activeSessionId if it pointed there.
      useSessionStore.setState((st) => removeSessionFromState(st, msg.sessionId));
      if (useSessionStore.getState().activeSessionId === undefined) {
        try {
          localStorage.removeItem(ACTIVE_SESSION_KEY);
        } catch {
          // private-mode storage failure — fine
        }
      }
      // Cross-tab counterpart to the cascade refetch in
      // disposeSession: the server has rm -rf'd any pi-subagents
      // child JSONLs under the deleted parent. The local
      // removeSessionFromState above only knows about the parent
      // id — without this, children stay in byProject in the
      // receiving tab until its next mount.
      void scheduleListRefetch(msg.projectId);
      return;
    }
    if (msg.type === "session_renamed") {
      useSessionStore.setState((st) => {
        const byProject: Record<string, UnifiedSession[]> = {};
        for (const [pid, list] of Object.entries(st.byProject)) {
          byProject[pid] = list.map((u) => {
            if (u.sessionId !== msg.sessionId) return u;
            const next: UnifiedSession = { ...u };
            if (msg.name !== undefined) next.name = msg.name;
            else delete next.name;
            return next;
          });
        }
        return { byProject };
      });
      return;
    }
  });
  globalThis.__piForgeSessionCrossTabRegistered = true;
}

connectGlobalEvents();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (globalThis.__piForgeSessionCrossTabCleanup) {
      globalThis.__piForgeSessionCrossTabCleanup();
    }
    globalThis.__piForgeSessionCrossTabRegistered = false;
    globalThis.__piForgeSessionCrossTabCleanup = undefined;
    disconnectGlobalEvents();
  });
}
