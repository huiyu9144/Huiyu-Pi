import { useState } from "react";
import { Folder, Plus, X } from "lucide-react";
import { useProjectStore } from "../store/project-store";
import { useSessionStore } from "../store/session-store";
import { useUiStore } from "../store/ui-store";
import { ProjectPicker } from "./ProjectPicker";
import { SessionList } from "./SessionList";
import { Modal } from "./Modal";

export interface ProjectSidebarProps {
  /** Extra classes on the outer aside. Used by the App-level mobile
   *  drawer wrapper to layer in fixed-position transform classes
   *  without ProjectSidebar needing to know it's in a drawer. */
  className?: string;
}

export function ProjectSidebar({ className = "" }: ProjectSidebarProps = {}) {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const collapsed = useProjectStore((s) => s.collapsed);
  const setActive = useProjectStore((s) => s.setActive);
  const toggleCollapsed = useProjectStore((s) => s.toggleCollapsed);
  const remove = useProjectStore((s) => s.remove);
  const rename = useProjectStore((s) => s.rename);
  const reorder = useProjectStore((s) => s.reorder);
  const sessionsByProject = useSessionStore((s) => s.byProject);
  const createSession = useSessionStore((s) => s.createSession);
  const disposeSession = useSessionStore((s) => s.disposeSession);

  /**
   * Create a new session under `projectId`. Mirrors the project-
   * switch-then-create dance that lived in SessionList: switching
   * the active project FIRST so the right pane (Files / Changes /
   * Git) lines up by the time the session is selected.
   */
  const handleNewSession = async (projectId: string): Promise<void> => {
    if (activeProjectId !== projectId) setActive(projectId);
    try {
      await createSession(projectId);
    } catch {
      // store.error surfaces — no UI noise here
    }
  };
  const showPicker = useUiStore((s) => s.projectPickerOpen);
  const setShowPicker = useUiStore((s) => s.setProjectPickerOpen);
  const [renamingId, setRenamingId] = useState<string | undefined>();
  const [renameValue, setRenameValue] = useState("");
  const [draggingProjectId, setDraggingProjectId] = useState<string | undefined>();
  const [dragOverProjectId, setDragOverProjectId] = useState<string | undefined>();

  /**
   * Delete-project modal state. `liveCount` and `onDiskCount` are
   * captured at open time so the dialog copy stays stable while the
   * user reads it (a session ending mid-read shouldn't change the
   * number shown). `acknowledged` gates the Delete button when there
   * are session files to remove — a required confirmation step
   * rather than an opt-in toggle. Empty projects don't need the
   * acknowledgement and the button is enabled immediately.
   */
  const [deleteDialog, setDeleteDialog] = useState<
    | {
        id: string;
        name: string;
        liveCount: number;
        onDiskCount: number;
        acknowledged: boolean;
        submitting: boolean;
      }
    | undefined
  >(undefined);

  /**
   * Open the delete confirmation modal. No live-sessions block: any
   * live sessions for this project get disposed as part of the
   * delete (in `submitDelete` below), which matches the user's
   * mental model of "delete project = make it go away" without the
   * extra "dispose all live sessions first" dance.
   */
  const handleDelete = (id: string, name: string): void => {
    const list = sessionsByProject[id] ?? [];
    const liveCount = list.filter((s) => s.isLive).length;
    const onDiskCount = list.filter((s) => !s.isLive).length;
    setDeleteDialog({ id, name, liveCount, onDiskCount, acknowledged: false, submitting: false });
  };

  const submitDelete = async (): Promise<void> => {
    if (deleteDialog === undefined) return;
    const { id } = deleteDialog;
    // Dispose any live sessions FIRST so the registry doesn't try to
    // hold onto them while the server rm -rf's their JSONLs out from
    // under them. The server's session-dir wipe also cleans up the
    // JSONL files, so dispose here is the "release the in-memory
    // handle + close SSE connections" half — best-effort, runs in
    // parallel, errors don't block the project delete.
    setDeleteDialog({ ...deleteDialog, submitting: true });
    const liveIds = (sessionsByProject[id] ?? []).filter((s) => s.isLive).map((s) => s.sessionId);
    if (liveIds.length > 0) {
      await Promise.all(liveIds.map((sid) => disposeSession(sid).catch(() => undefined)));
    }
    setDeleteDialog(undefined);
    void remove(id);
  };

  const submitRename = async (id: string): Promise<void> => {
    const v = renameValue.trim();
    if (v.length === 0) {
      setRenamingId(undefined);
      return;
    }
    try {
      await rename(id, v);
    } finally {
      setRenamingId(undefined);
      setRenameValue("");
    }
  };

  const resetDragState = (): void => {
    setDraggingProjectId(undefined);
    setDragOverProjectId(undefined);
  };

  const handleDrop = async (targetId: string): Promise<void> => {
    const sourceId = draggingProjectId;
    resetDragState();
    if (sourceId === undefined || sourceId === targetId) return;
    const sourceIndex = projects.findIndex((p) => p.id === sourceId);
    const targetIndex = projects.findIndex((p) => p.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const ids = projects.map((p) => p.id);
    const [moved] = ids.splice(sourceIndex, 1);
    if (moved === undefined) return;
    ids.splice(targetIndex, 0, moved);
    try {
      await reorder(ids);
    } catch {
      // store.error surfaces; optimistic ordering rolls back in the store.
    }
  };

  return (
    <aside
      className={`flex h-full w-64 flex-col border-r-[0.5px] border-neutral-800 bg-neutral-900 ${className}`}
      // Safe-area-aware top + bottom padding so the drawer chrome
      // (header, sessions list) doesn't slide under iPhone notches /
      // Android cutouts when the drawer is fullscreen-tall on
      // mobile. env() returns 0 on devices without insets, so this
      // is a no-op on desktop and on non-notched phones.
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="custom-scrollbar flex-1 overflow-y-auto py-1">
        {projects.length === 0 && (
          <p className="px-3 py-4 text-sm font-semibold text-[#545454] light:text-neutral-500">No projects yet.</p>
        )}
        {projects.map((p) => {
          const isActive = p.id === activeProjectId;
          const isCollapsed = collapsed[p.id] ?? false;
          return (
            <div
              key={p.id}
              className={`mt-1 px-2 ${draggingProjectId === p.id ? "opacity-60" : ""}`}
              draggable={renamingId !== p.id}
              onDragStart={(e) => {
                if (renamingId === p.id) {
                  e.preventDefault();
                  return;
                }
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", p.id);
                setDraggingProjectId(p.id);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                if (draggingProjectId !== undefined && draggingProjectId !== p.id) {
                  setDragOverProjectId(p.id);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDragEnd={resetDragState}
              onDrop={(e) => {
                e.preventDefault();
                void handleDrop(p.id);
              }}
            >
              <div
                className={`group flex items-center gap-1 rounded-md px-2 py-1 ring-inset transition-colors ${
                  dragOverProjectId === p.id
                    ? "ring-1 ring-cyan-500/70"
                    : isActive
                      ? "text-neutral-100"
                      : "text-[#545454] light:text-neutral-500"
                }`}
              >
                {renamingId === p.id ? (
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => void submitRename(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void submitRename(p.id);
                      if (e.key === "Escape") setRenamingId(undefined);
                    }}
                    autoFocus
                    className="flex-1 rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5 text-xs"
                  />
                ) : (
                  <button
                    onClick={() => {
                      if (activeProjectId !== p.id) setActive(p.id);
                      toggleCollapsed(p.id);
                    }}
                    onDoubleClick={() => {
                      setRenamingId(p.id);
                      setRenameValue(p.name);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-xs font-semibold text-[#545454] light:text-neutral-500 transition-colors hover:text-neutral-100"
                    title={`${p.name} — ${p.path}`}
                  >
                    <Folder size={12} className="shrink-0" />
                    <span className="w-full truncate">{p.name}</span>
                  </button>
                )}
                <button
                  onClick={() => void handleNewSession(p.id)}
                  className="inline-flex p-1 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-white light:hover:text-neutral-950 transition-opacity"
                  title="New session in this project"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="inline-flex items-center p-1 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-white light:hover:text-neutral-950 transition-opacity"
                  title="Delete project (blocked while live sessions exist)"
                >
                  <X size={14} />
                </button>
              </div>
              {!isCollapsed && <SessionList projectId={p.id} />}
            </div>
          );
        })}
      </div>

      {showPicker && <ProjectPicker onClose={() => setShowPicker(false)} />}
      <Modal
        open={deleteDialog !== undefined}
        onClose={() => setDeleteDialog(undefined)}
        title={
          deleteDialog !== undefined ? `Delete project "${deleteDialog.name}"` : "Delete project"
        }
      >
        {deleteDialog !== undefined &&
          (() => {
            const totalSessions = deleteDialog.liveCount + deleteDialog.onDiskCount;
            const requiresAck = totalSessions > 0;
            const canSubmit =
              !deleteDialog.submitting && (!requiresAck || deleteDialog.acknowledged);
            return (
              <div className="flex flex-col gap-3 px-4 py-3">
                <p className="text-xs text-neutral-300">
                  Remove "{deleteDialog.name}" from Huiyu Pi.
                </p>
                <ul className="ml-4 list-disc space-y-0.5 text-[11px] text-neutral-400">
                  <li>
                    Project record + the project's session directory (
                    <code className="font-mono text-[10px] text-neutral-400">
                      .pi/sessions/{deleteDialog.id}/
                    </code>
                    ) will be deleted.
                  </li>
                  {deleteDialog.liveCount > 0 && (
                    <li>
                      {deleteDialog.liveCount} live session
                      {deleteDialog.liveCount === 1 ? "" : "s"} will be disposed first.
                    </li>
                  )}
                  <li>
                    The project's workspace folder on disk is <strong>not</strong> touched.
                  </li>
                </ul>
                {requiresAck && (
                  <label className="flex items-start gap-2 rounded border border-red-900/40 bg-red-950/30 px-2 py-1.5 text-xs text-red-200 light:border-red-300 light:bg-red-50 light:text-red-800">
                    <input
                      type="checkbox"
                      checked={deleteDialog.acknowledged}
                      onChange={(e) =>
                        setDeleteDialog((d) =>
                          d === undefined ? d : { ...d, acknowledged: e.target.checked },
                        )
                      }
                      className="mt-0.5 h-3 w-3"
                    />
                    <span>
                      Yes, I understand this will delete {totalSessions} session
                      {totalSessions === 1 ? "" : "s"}
                      {deleteDialog.liveCount > 0 && deleteDialog.onDiskCount > 0
                        ? ` (${deleteDialog.liveCount} live, ${deleteDialog.onDiskCount} on disk)`
                        : deleteDialog.liveCount > 0
                          ? ` (${deleteDialog.liveCount} live)`
                          : ""}
                      . This can't be undone.
                    </span>
                  </label>
                )}
                <footer className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDeleteDialog(undefined)}
                    disabled={deleteDialog.submitting}
                    className="rounded-md px-3 py-1 text-xs text-neutral-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void submitDelete()}
                    disabled={!canSubmit}
                    className="rounded-md bg-red-700 px-3 py-1 text-xs font-medium text-red-50 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-700"
                  >
                    {deleteDialog.submitting ? "Deleting…" : "Delete"}
                  </button>
                </footer>
              </div>
            );
          })()}
      </Modal>
    </aside>
  );
}

