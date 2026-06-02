import { memo, useEffect, useState, type RefObject } from "react";
import { ResizableDivider } from "./ResizableDivider";
import { FileBrowserPanel } from "./FileBrowserPanel";
import { SearchPanel } from "./SearchPanel";
import { TurnDiffPanel } from "./TurnDiffPanel";
import { GitPanel } from "./GitPanel";
import { ContextInspectorPanel } from "./ContextInspectorPanel";
import { PreviewPanel } from "./PreviewPanel";
import { ProcessesPanel } from "./ProcessesPanel";
import { TodoPanel } from "./TodoPanel";
import { useUiStore } from "../store/ui-store";
import { countRunning, selectProcesses, useProcessesStore } from "../store/processes-store";
import { useGitStatus } from "../hooks/useGitStatus";
import { useActiveProject } from "../store/project-store";

interface Props {
  chatOpen: boolean;
  editorVisible: boolean;
  minimal: boolean;
  todoPanelOpen: boolean;
  activeSessionId: string | undefined;
  todoPanelHeight: number;
  filesWidth: number;
  filesPanelRef: RefObject<HTMLDivElement | null>;
  filesWidthRef: RefObject<number>;
  setTodoPanelHeight: (h: number) => void;
  setFilesWidth: (w: number) => void;
}

const MIN_CHAT_WIDTH = 320;
const MIN_EDITOR_WIDTH = 280;
const MIN_FILES_WIDTH = 200;
const MIN_TODO_PANEL_HEIGHT = 80;

export const FilesPanelLayer = memo(function FilesPanelLayer({
  chatOpen,
  editorVisible,
  minimal,
  todoPanelOpen,
  activeSessionId,
  todoPanelHeight,
  filesWidth,
  filesPanelRef,
  filesWidthRef,
  setTodoPanelHeight,
  setFilesWidth,
}: Props) {
  const chatColumnVisible = chatOpen;
  const filesIsLeftmost = !chatColumnVisible && !editorVisible;
  const rightTab = useUiStore((s) => s.rightTab);
  const filesOpen = useUiStore((s) => s.filesOpen);

  // Read git badge and process badge counts from store directly
  // instead of receiving them as props — that way store updates
  // don't break React.memo by changing prop references.
  const activeProject = useActiveProject();
  const gitStatus = useGitStatus(activeProject?.id);
  const gitChangedCount = gitStatus.status?.files.length ?? 0;
  const sessionProcesses = useProcessesStore((s) => selectProcesses(s, activeSessionId));
  const runningProcessCount = countRunning(sessionProcesses);

  // Cache viewport size so the render path doesn't call
  // window.innerWidth / window.innerHeight (forced reflow).
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  useEffect(() => {
    const onResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const filesContent = (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {rightTab === "files" ? (
            <FileBrowserPanel />
          ) : rightTab === "search" ? (
            <SearchPanel />
          ) : !minimal && rightTab === "changes" ? (
            <TurnDiffPanel />
          ) : !minimal && rightTab === "git" ? (
            <GitPanel />
          ) : rightTab === "context" ? (
            <ContextInspectorPanel />
          ) : rightTab === "preview" ? (
            <PreviewPanel />
          ) : rightTab === "processes" && activeSessionId !== undefined ? (
            <ProcessesPanel sessionId={activeSessionId} />
          ) : (
            <FileBrowserPanel />
          )}
        </div>
        {todoPanelOpen && activeSessionId !== undefined && (
          <>
            <ResizableDivider
              orientation="horizontal"
              getStartSize={() => todoPanelHeight}
              onResize={(next) => setTodoPanelHeight(next)}
              direction={-1}
              minSize={MIN_TODO_PANEL_HEIGHT}
              maxSize={Math.max(MIN_TODO_PANEL_HEIGHT, windowHeight * 0.7)}
            />
            <div
              className="shrink-0 overflow-hidden border-t border-neutral-800 light:border-neutral-200"
              style={{ height: `${todoPanelHeight}px` }}
            >
              <TodoPanel
                sessionId={activeSessionId}
                onClose={() => useUiStore.getState().setTodoPanelOpen(false)}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex border-t border-neutral-800 bg-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {(minimal
          ? (["files", "search", "processes", "context"] as const)
          : (["preview", "files", "search", "changes", "git", "processes", "context"] as const)
        ).map((t) => (
          <button
            key={t}
            onClick={() => useUiStore.getState().setRightTab(t)}
            className={`flex items-center gap-1 px-3 py-1.5 text-[11px] uppercase tracking-wider ${
              rightTab === t ? "text-neutral-100" : "text-neutral-400"
            }`}
          >
            {t === "files"
              ? "Files"
              : t === "search"
                ? "Search"
                : t === "changes"
                  ? "Turn"
                  : t === "git"
                    ? "Git"
                    : t === "processes"
                      ? "Processes"
                      : t === "preview"
                        ? "Preview"
                        : "Context"}
            {t === "git" && gitChangedCount > 0 && (
              <span className="rounded bg-amber-900/40 px-1 py-0.5 text-[9px] text-amber-300 light:bg-amber-100 light:text-amber-800">
                {gitChangedCount}
              </span>
            )}
            {t === "processes" && runningProcessCount > 0 && (
              <span className="rounded bg-emerald-900/40 px-1 py-0.5 text-[9px] text-emerald-300 light:bg-emerald-100 light:text-emerald-800">
                {runningProcessCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  );

  if (filesIsLeftmost) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-neutral-900 group">
        {filesContent}
      </div>
    );
  }

  return (
    <>
      <ResizableDivider
        getStartSize={() => filesWidthRef.current}
        onResize={(next) => {
          if (filesPanelRef.current) {
            filesPanelRef.current.style.width = `${next}px`;
          }
          filesWidthRef.current = next;
        }}
        onDragEnd={(finalSize) => {
          localStorage.setItem("huiyu-pi/files-width", String(finalSize));
          setFilesWidth(finalSize);
        }}
        direction={-1}
        minSize={MIN_FILES_WIDTH}
        maxSize={Math.max(
          MIN_FILES_WIDTH,
          windowWidth - MIN_CHAT_WIDTH - 240 - (editorVisible ? MIN_EDITOR_WIDTH : 0),
        )}
      />
      <div
        ref={filesPanelRef}
        className="group flex shrink-0 flex-col border-l-[0.5px] border-neutral-800 bg-neutral-900"
        style={{
          width: filesOpen ? `${filesWidth}px` : "0px",
          overflow: "hidden",
        }}
      >
        {filesContent}
      </div>
    </>
  );
});
