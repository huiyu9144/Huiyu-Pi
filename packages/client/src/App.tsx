import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  CircleCheck,
  Code,
  Download,
  FileDown,
  Globe,
  Menu,
  MessageCircle,
  Monitor,
  MousePointerClick,
  SquareTerminal,
  Plus,
  Settings,
  Coffee,
  Sparkles,
} from "lucide-react";
import { useIsMobile } from "./lib/use-is-mobile";
import { useAuthStore } from "./store/auth-store";
import { useActiveProject, useProjectStore } from "./store/project-store";
import { useSessionStore } from "./store/session-store";
import { useFileStore } from "./store/file-store";
import { useUiConfigStore } from "./store/ui-config-store";
import { useQuickActionsStore } from "./store/quick-actions-store";
import { LoginScreen } from "./components/LoginScreen";
import { ChangePasswordScreen } from "./components/ChangePasswordScreen";
import { InstallPrompt } from "./components/InstallPrompt";
import { ProjectSidebar } from "./components/ProjectSidebar";
import { ProjectPicker } from "./components/ProjectPicker";
import { ChatView } from "./components/ChatView";
import { ChatInput } from "./components/ChatInput";
import { SettingsPanel } from "./components/SettingsPanel";
import { AskUserQuestionPanel } from "./components/AskUserQuestionPanel";
import { FilesPanelLayer } from "./components/FilesPanelLayer";
import { EditorPanel } from "./components/EditorPanel";
import { TerminalPanel } from "./components/TerminalPanel";
import { GlobalSearchBar } from "./components/GlobalSearchBar";
import { McpStatusBadge } from "./components/McpStatusBadge";
import { useMcpStore } from "./store/mcp-store";
import { useUiStore, type SettingsTab } from "./store/ui-store";
import { ResizableDivider } from "./components/ResizableDivider";
import { useInstallPrompt } from "./hooks/useInstallPrompt";

/* Persisted pane widths. Stored in localStorage so the user-tuned
   layout survives reloads. Defaults err on the side of "the chat is the
   primary surface" — files is narrow, editor is medium. */
const FILES_WIDTH_KEY = "huiyu-pi/files-width";
const EDITOR_WIDTH_KEY = "huiyu-pi/editor-width";
const TERMINAL_HEIGHT_KEY = "huiyu-pi/terminal-height";
const TODO_PANEL_HEIGHT_KEY = "huiyu-pi/todo-panel-height";
const LAYOUT_VERSION_KEY = "huiyu-pi/layout-version";
const LAYOUT_VERSION = 2;
const DEFAULT_FILES_WIDTH = 560;
const DEFAULT_EDITOR_WIDTH = 960;
const DEFAULT_TERMINAL_HEIGHT = 280;
const DEFAULT_TODO_PANEL_HEIGHT = 200;
const MIN_EDITOR_WIDTH = 320;
const MIN_CHAT_WIDTH = 320;
const MIN_TERMINAL_HEIGHT = 140;

function readPersistedWidth(key: string, fallback: number): number {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function App() {
  const ready = useAuthStore((s) => s.ready);

  try {
    const storedVersion = Number.parseInt(localStorage.getItem(LAYOUT_VERSION_KEY) ?? "0", 10);
    if (storedVersion < LAYOUT_VERSION) {
      localStorage.removeItem(FILES_WIDTH_KEY);
      localStorage.removeItem(EDITOR_WIDTH_KEY);
      localStorage.setItem(LAYOUT_VERSION_KEY, String(LAYOUT_VERSION));
    }
  } catch {
    /* layout version migration */
  }
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mustChangePassword = useAuthStore((s) => s.mustChangePassword);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  const projects = useProjectStore((s) => s.projects);
  const projectsLoaded = useProjectStore((s) => !s.loading);
  const loadProjects = useProjectStore((s) => s.load);
  const active = useActiveProject();
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const activeSessionId = useSessionStore((s) => s.activeSessionId);

  /* Mobile drawer state. The sidebar slides off-screen at < 768 px and
     reappears via the hamburger button OR a left-edge swipe gesture.
     `useIsMobile` reacts to viewport changes so resize / orientation
     flip / "Request Desktop Site" all transition cleanly. */
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coffeeHover, setCoffeeHover] = useState(false);
  const coffeeTimerRef = useRef<number | undefined>(undefined);
  const [activeQR, setActiveQR] = useState<"wechat" | "alipay" | "paypal">("wechat");

  const onCoffeeEnter = (): void => {
    if (coffeeTimerRef.current !== undefined) {
      clearTimeout(coffeeTimerRef.current);
      coffeeTimerRef.current = undefined;
    }
    setCoffeeHover(true);
  };
  const onCoffeeLeave = (): void => {
    coffeeTimerRef.current = window.setTimeout(() => {
      coffeeTimerRef.current = undefined;
      setCoffeeHover(false);
    }, 300);
  };

  const { canInstall, showInstall, install } = useInstallPrompt();
  const [installTooltip, setInstallTooltip] = useState(false);
  const installTooltipRef = useRef<HTMLDivElement>(null);

  const [terminalOpen, setTerminalOpen] = useState<boolean>(
    () => localStorage.getItem("huiyu-pi/terminal-open") === "true",
  );
  const setTerminalOpenPersisted = (v: boolean): void => {
    setTerminalOpen(v);
    localStorage.setItem("huiyu-pi/terminal-open", v ? "true" : "false");
  };

  // Chat pane visibility — defaults to OPEN (the chat is the Huiyu Pi's
  // primary surface), and the persistence key is absence-means-open so a
  // user who has never touched the toggle gets the chat. Hide is for the
  // "I just want to use the file editor + terminal" focus mode.
  const [chatOpen, setChatOpen] = useState<boolean>(
    () => localStorage.getItem("huiyu-pi/chat-open") !== "false",
  );
  const setChatOpenPersisted = (v: boolean): void => {
    setChatOpen(v);
    localStorage.setItem("huiyu-pi/chat-open", v ? "true" : "false");
  };

  // Editor pane visibility — independent of `filesOpen` (the file
  // browser tree). Defaults to OPEN so a user with persisted tabs from
  // the previous session sees them on reload. Tabs themselves persist
  // in sessionStorage via file-store; this toggle just controls
  // visibility of the rendered pane.
  const [editorOpen, setEditorOpen] = useState<boolean>(
    () => localStorage.getItem("huiyu-pi/editor-open") !== "false",
  );
  const setEditorOpenPersisted = (v: boolean): void => {
    setEditorOpen(v);
    localStorage.setItem("huiyu-pi/editor-open", v ? "true" : "false");
  };

  // First-run picker dismissal. When no projects exist we render the
  // ProjectPicker by default, but the user can dismiss it to take a
  // look around the empty Huiyu Pi. Re-opens via the sidebar's
  // "+ New project" button. Reset whenever a project is created so
  // the picker doesn't reappear if the user later deletes all
  // projects in the same browser tab.
  const [setupPickerDismissed, setSetupPickerDismissed] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState<number>(() =>
    readPersistedWidth(TERMINAL_HEIGHT_KEY, DEFAULT_TERMINAL_HEIGHT),
  );
  const terminalHeightRef = useRef(terminalHeight);
  useEffect(() => {
    terminalHeightRef.current = terminalHeight;
    localStorage.setItem(TERMINAL_HEIGHT_KEY, String(terminalHeight));
  }, [terminalHeight]);

  // Todo-panel height (bottom strip of the right pane). Persisted
  // independently of the other panes' sizes — same pattern as
  // terminalHeight.
  const [todoPanelHeight, setTodoPanelHeight] = useState<number>(() =>
    readPersistedWidth(TODO_PANEL_HEIGHT_KEY, DEFAULT_TODO_PANEL_HEIGHT),
  );
  const todoPanelHeightRef = useRef(todoPanelHeight);
  useEffect(() => {
    todoPanelHeightRef.current = todoPanelHeight;
    localStorage.setItem(TODO_PANEL_HEIGHT_KEY, String(todoPanelHeight));
  }, [todoPanelHeight]);

  // Auto-open the right pane when the user toggles the todo panel
  // on from a chat-only view. Without this, clicking the todo
  // icon would set `todoPanelOpen=true` but nothing visible would
  // change — the panel lives inside the right pane.
  const todoPanelOpen = useUiStore((s) => s.todoPanelOpen);
  useEffect(() => {
    if (todoPanelOpen && !useUiStore.getState().filesOpen && !isMobile) {
      useUiStore.getState().setFilesOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todoPanelOpen]);

  // Same auto-open behavior for the processes badge in the chat
  // input: bumping `openProcessesTabSeq` means "show me processes
  // now" — open the right pane if collapsed, switch to the tab.
  const openProcessesTabSeq = useUiStore((s) => s.openProcessesTabSeq);
  useEffect(() => {
    if (openProcessesTabSeq === 0) return; // initial value, no request
    if (!useUiStore.getState().filesOpen && !isMobile) useUiStore.getState().setFilesOpen(true);
    useUiStore.getState().setRightTab("processes");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProcessesTabSeq]);

  // Opening a file from the file viewer/search should make the editor
  // visible even if the user previously toggled the editor pane off.
  const openEditorPaneSeq = useUiStore((s) => s.openEditorPaneSeq);
  useEffect(() => {
    if (openEditorPaneSeq === 0) return;
    setEditorOpenPersisted(true);
  }, [openEditorPaneSeq]);

  // Pane widths (px). Persisted on every drag-end via the ref; we keep
  // the live value in state so drags re-render the layout, and mirror
  // it through the ref so the divider can read the start width without
  // a stale-closure bug across drags.
  const [filesWidth, setFilesWidth] = useState<number>(() =>
    readPersistedWidth(FILES_WIDTH_KEY, DEFAULT_FILES_WIDTH),
  );
  const [editorWidth, setEditorWidth] = useState<number>(() =>
    readPersistedWidth(EDITOR_WIDTH_KEY, DEFAULT_EDITOR_WIDTH),
  );
  const filesWidthRef = useRef(filesWidth);
  const filesPanelRef = useRef<HTMLDivElement>(null);
  const editorWidthRef = useRef(editorWidth);
  useEffect(() => {
    filesWidthRef.current = filesWidth;
    localStorage.setItem(FILES_WIDTH_KEY, String(filesWidth));
  }, [filesWidth]);
  useEffect(() => {
    editorWidthRef.current = editorWidth;
    localStorage.setItem(EDITOR_WIDTH_KEY, String(editorWidth));
  }, [editorWidth]);

  // Cache window.innerWidth in state so the render path (divider
  // maxSize, IIFE branching) doesn't trigger forced reflow on every
  // render by reading the DOM synchronously.
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

  const openFilesCount = useFileStore((s) => s.openFiles.length);
  const editorVisible = editorOpen && openFilesCount > 0;

  // Refresh the file tree on every agent_end the active project hears,
  // since the agent commonly writes/edits files mid-turn. The session
  // store bumps `agentEndCountBySession[id]` exactly once per agent_end,
  // so this effect fires once per turn — no false positives from
  // benign array-replacement refetches that would trip a length proxy.
  const agentEndCount = useSessionStore((s) =>
    activeSessionId !== undefined ? (s.agentEndCountBySession[activeSessionId] ?? 0) : 0,
  );
  const isStreaming = useSessionStore((s) =>
    activeSessionId !== undefined ? (s.streamingBySession[activeSessionId] ?? false) : false,
  );
  const loadFileTree = useFileStore((s) => s.loadTree);
  const restoreTabs = useFileStore((s) => s.restoreTabs);
  const refreshOpenFiles = useFileStore((s) => s.refreshOpenFiles);
  // After every agent turn, reconcile the open editor tabs against
  // on-disk state. The file tree loads on-demand when the user opens
  // the Files tab — no need to burn a connection here.
  useEffect(() => {
    if (active === undefined || isStreaming) return;
    void refreshOpenFiles(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, isStreaming, agentEndCount]);

  // Re-open the editor tabs persisted for this project. No-op if any
  // tabs are already open, so a project hot-switch doesn't fight a
  // user who's mid-edit. Runs only on project change (not on every
  // agent_end / streaming flip the tree refresh keys off of).
  useEffect(() => {
    if (active === undefined) return;
    void restoreTabs(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

  useEffect(() => {
    if (!installTooltip) return;
    const onClick = (e: MouseEvent): void => {
      if (installTooltipRef.current && !installTooltipRef.current.contains(e.target as Node)) {
        setInstallTooltip(false);
      }
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setInstallTooltip(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [installTooltip]);

  /* Mobile drawer: close when the user picks something. Watching the
     two active-id values catches every selection path (project click,
     session click, new-session creation that auto-selects). A first-
     mount ref guard skips the initial restoration so the drawer
     doesn't auto-open-then-close on page load. */
  const drawerFirstMount = useRef(true);
  useEffect(() => {
    if (drawerFirstMount.current) {
      drawerFirstMount.current = false;
      return;
    }
    if (drawerOpen) setDrawerOpen(false);
    // Intentional: respond to selection changes only, not to drawerOpen
    // toggling (would create a self-closing loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId, activeSessionId]);

  /* Esc key closes the drawer. Body scroll lock prevents the page
     scrolling behind the open drawer on iOS Safari (where the address
     bar's scroll-to-top can otherwise pull the chat out from under
     the user's finger). */
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  /* Auto-close when leaving mobile (resize, rotate, "Request Desktop
     Site"). Without this, a drawer left open while flipping to desktop
     keeps the open-state in memory; harmless visually because the CSS
     forces it visible at md+, but it'd resurrect as "open" if the
     viewport re-narrowed. */
  useEffect(() => {
    if (!isMobile && drawerOpen) setDrawerOpen(false);
  }, [isMobile, drawerOpen]);

  // ui-store: ChatInput's `/settings`, `/skills`, `/mcp`, `/providers`
  // slash commands set `settingsRequest` here. We open the panel and
  // (if a tab was specified) hand the requested tab to SettingsPanel
  // via `initialTab`. Cleared after handling so a second request to
  // the same tab still fires (the seq counter on the store guarantees
  // re-render even when tab is identical).
  const settingsRequest = useUiStore((s) => s.settingsRequest);
  const clearSettingsRequest = useUiStore((s) => s.clearSettingsRequest);
  const [pendingSettingsTab, setPendingSettingsTab] = useState<SettingsTab | undefined>(undefined);
  useEffect(() => {
    if (settingsRequest === undefined) return;
    setSettingsOpen(true);
    if (settingsRequest.tab !== undefined) setPendingSettingsTab(settingsRequest.tab);
    clearSettingsRequest();
  }, [settingsRequest, clearSettingsRequest]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // ui-config has no auth requirement and gates which surfaces
  // we render — load it in parallel with auth bootstrap so the
  // first render after login already knows whether we're in
  // minimal mode (avoids a flash of full-UI elements that then
  // disappear).
  const loadUiConfig = useUiConfigStore((s) => s.load);
  const minimal = useUiConfigStore((s) => s.minimal);
  useEffect(() => {
    void loadUiConfig();
  }, [loadUiConfig]);

  useEffect(() => {
    // Don't fetch projects with a `must_change_password` token — that
    // call would 403 and (currently) does nothing useful for the user.
    // The change-password screen reloads projects on its own success
    // path by transitioning isAuthenticated→true with mustChange→false.
    if (isAuthenticated && !mustChangePassword) void loadProjects();
  }, [isAuthenticated, mustChangePassword, loadProjects]);

  // Quick-action chips load once after auth — same trigger as projects.
  // Failure is non-fatal (the store keeps `loaded: false` and the
  // chip simply never appears in the toolbar).
  const loadQuickActions = useQuickActionsStore((s) => s.load);
  useEffect(() => {
    if (isAuthenticated && !mustChangePassword) void loadQuickActions();
  }, [isAuthenticated, mustChangePassword, loadQuickActions]);

  // MCP status polling — single 30s ticker shared by the header badge
  // and the Settings MCP tab. Starts after auth (the route is
  // protected); stops on logout. Idempotent — safe to call repeatedly.
  const startMcpPolling = useMcpStore((s) => s.startPolling);
  const stopMcpPolling = useMcpStore((s) => s.stopPolling);
  useEffect(() => {
    if (isAuthenticated && !mustChangePassword) {
      startMcpPolling();
    } else {
      stopMcpPolling();
    }
  }, [isAuthenticated, mustChangePassword, startMcpPolling, stopMcpPolling]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-neutral-400">
        Loading…
      </main>
    );
  }

  if (!isAuthenticated) return <LoginScreen />;
  if (mustChangePassword) return <ChangePasswordScreen />;

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-neutral-100">
      {/* Top-of-viewport chrome respects iOS Dynamic Island / notch
          and Android cutouts via safe-area-inset-top. The viewport
          meta in index.html already opts in with `viewport-fit=cover`
          (PR 3); this is what actually consumes the inset so the
          hamburger + brand don't sit under the status bar. Combined
          with `py-2` so we have at least the original 8 px even on
          devices with no inset. */}
      <header
        className="absolute inset-x-0 top-0 z-50 flex items-center justify-between border-b-[0.5px] border-neutral-800 bg-neutral-950 px-4 py-2"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger — only at < md. Tapping toggles the drawer
              that wraps ProjectSidebar; the icon serves as the
              visible affordance complementing the left-edge swipe
              gesture. min-w-11 keeps the touch target ≥ 44px even
              on small phones. */}
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Close project sidebar" : "Open project sidebar"}
            aria-expanded={drawerOpen}
            className="-ml-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-neutral-400 md:hidden"
          >
            <Menu size={20} />
          </button>
          {/* Header brand: same SVG as the favicon / PWA icon, served
              from /icons/icon-192.png via the public dir. The inner gap-1.5
              keeps the logo + wordmark visually paired (tighter than
              the parent gap-3 used between brand and project picker). */}
          <div className="flex items-center gap-1.5">
            <a
              href="https://www.huiyu.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <img
                src="/icons/logo-rounded.png"
                alt=""
                className="h-6 w-6 rounded-md"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold tracking-tight">Huiyu Pi</span>
            </a>
            <button
              onClick={() => useUiStore.getState().setProjectPickerOpen(true)}
              className="ml-1 rounded-md p-0.5 text-neutral-400 hover:text-neutral-100 transition-colors"
              title="New project"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Pane-toggle buttons (Chat / Editor / Files / Terminal) hide
              at < md. The corresponding panes are also unmounted by the
              isMobile gates below, so the toggles would have nothing to
              act on anyway. `hidden md:contents` keeps the wrapper out
              of the flex layout at md+ so spacing stays identical to
              pre-mobile-PR behavior. */}
          <div className="hidden md:contents">
            <button
              onClick={() => setChatOpenPersisted(!chatOpen)}
              className={`flex items-center justify-center rounded-md p-1.5 ${
                chatOpen ? "text-neutral-100" : "text-neutral-400"
              }`}
              title="Toggle the chat pane"
            >
              <MessageCircle size={16} />
            </button>
            <button
              onClick={() => setEditorOpenPersisted(!editorOpen)}
              className={`flex items-center justify-center rounded-md p-1.5 ${
                editorOpen ? "text-neutral-100" : "text-neutral-400"
              }`}
              title="Toggle the editor pane (open tabs persist across reloads)"
            >
              <Code size={16} />
            </button>
            {!minimal && (
              <button
                onClick={() => setTerminalOpenPersisted(!terminalOpen)}
                className={`flex items-center justify-center rounded-md p-1.5 ${
                  terminalOpen ? "text-neutral-100" : "text-neutral-400"
                }`}
                title="Toggle the integrated terminal"
              >
                <SquareTerminal size={16} />
              </button>
            )}
          </div>
          {/* Global cross-session search. Hidden at < md to keep the
              mobile header compact — phone users can search via the
              session list. Sits to the LEFT of the status badges /
              Settings so it's the visual anchor when the user is
              looking for "where did I see that?" content. */}
          <div className="hidden md:block">
            <GlobalSearchBar />
          </div>
          <a
            href="https://github.com/huiyu9144/Huiyu-PiwebUI-Forge"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center justify-center rounded-md p-1.5 text-neutral-400 hover:text-neutral-100"
            title="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          {/* MCP status badge stays visible in minimal — operators
              still want to see whether MCP servers are connected,
              they just can't reconfigure them from a locked-down
              deploy (the Settings → MCP tab is hidden separately). */}
          <McpStatusBadge />
          {!isMobile && showInstall && (
            <div className="relative" ref={installTooltipRef}>
              <button
                onClick={() => {
                  if (canInstall) {
                    void install();
                  } else {
                    setInstallTooltip((v) => !v);
                  }
                }}
                className="flex items-center justify-center rounded-md p-1.5 text-neutral-400 hover:text-neutral-100"
                title="Install app (PWA)"
              >
                <Download size={16} />
              </button>
              {installTooltip && !canInstall && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-neutral-700/80 bg-neutral-900 shadow-2xl">
                  <div className="flex items-center gap-2.5 border-b border-neutral-800 bg-neutral-800/50 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                      <Monitor size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-100">Install Huiyu Pi</p>
                      <p className="text-[11px] text-neutral-500">
                        Add to your desktop for quick access
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <Sparkles size={12} className="text-amber-400" />
                      <span>Fullscreen</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <Globe size={12} className="text-emerald-400" />
                      <span>Offline</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <MousePointerClick size={12} className="text-violet-400" />
                      <span>One-click</span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                      How to install
                    </p>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
                          1
                        </div>
                        <div className="flex-1 text-xs text-neutral-300">
                          Look for the{" "}
                          <Download size={11} className="mx-0.5 inline text-neutral-400" /> icon in
                          the address bar — click it to install directly
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
                          2
                        </div>
                        <div className="flex-1 text-xs text-neutral-300">
                          Or click the <span className="font-medium text-neutral-200">⋮</span> menu
                          in the top-right corner of the browser
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
                          3
                        </div>
                        <div className="flex-1 text-xs text-neutral-300">
                          Find and open{" "}
                          <FileDown size={11} className="mx-0.5 inline text-neutral-400" />{" "}
                          <span className="font-medium text-neutral-200">
                            Cast, save, and share
                          </span>{" "}
                          in the menu
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
                          4
                        </div>
                        <div className="flex-1 text-xs text-neutral-300">
                          Click <span className="font-medium text-neutral-200">Install page</span>{" "}
                          (Chrome) or{" "}
                          <span className="font-medium text-neutral-200">
                            Install this site as an app
                          </span>{" "}
                          (Edge)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-800/30 px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <CircleCheck size={12} className="text-emerald-500" />
                      <span>Works on Chrome, Edge & Opera</span>
                    </div>
                    <button
                      onClick={() => setInstallTooltip(false)}
                      className="rounded px-2 py-0.5 text-[11px] text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center rounded-md p-1.5 text-neutral-400"
            title="Settings (providers, agent defaults, MCP, skills)"
          >
            <Settings size={16} />
          </button>
          <FilesToggleButton />
        </div>
      </header>

      {/* PWA install prompt — mobile-only, dismissable, hidden when
          already running standalone or after the user has dismissed
          once. Self-gated to render nothing on desktop. */}
      <InstallPrompt />

      {settingsOpen && (
        <SettingsPanel
          onClose={() => {
            setSettingsOpen(false);
            setPendingSettingsTab(undefined);
          }}
          {...(pendingSettingsTab !== undefined ? { initialTab: pendingSettingsTab } : {})}
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden pt-11">
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile drawer chrome (only renders at < md):
              - backdrop dims main content + closes on tap
              - left-edge swipe-target opens the drawer when closed
              Hidden on desktop via md:hidden so the layout stays
              identical at md+ — sidebar is in normal flow there. */}
          {drawerOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
          )}
          {isMobile && !drawerOpen && (
            <div
              className="fixed inset-y-0 left-0 z-20 w-5 md:hidden"
              aria-hidden
              onPointerDown={(e) => {
                /* Threshold-based open: ≥ 50px rightward drag from
                   the left edge opens the drawer. Listeners attach
                   to the window so the gesture isn't lost when the
                   pointer leaves this thin strip. */
                const startX = e.clientX;
                let opened = false;
                const onMove = (ev: PointerEvent): void => {
                  if (opened) return;
                  if (ev.clientX - startX > 50) {
                    setDrawerOpen(true);
                    opened = true;
                    cleanup();
                  }
                };
                const cleanup = (): void => {
                  window.removeEventListener("pointermove", onMove);
                  window.removeEventListener("pointerup", cleanup);
                  window.removeEventListener("pointercancel", cleanup);
                };
                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", cleanup);
                window.addEventListener("pointercancel", cleanup);
              }}
            />
          )}
          <ProjectSidebar
            className={
              // The drawer-slide translate is scoped with `max-md:` so
              // it ONLY applies on mobile. Earlier this was an
              // unscoped `translate-x-0` / `-translate-x-full` plus
              // `md:transform-none` on top, but `transform-none` does
              // not beat translate utilities in Tailwind's CSS source
              // order: the translate's emitted `transform: translateX(
              // ...)` won at md+, which (a) created a CSS containing
              // block on the sidebar — squishing every `fixed inset-0`
              // modal rendered inside it (ProjectPicker, project-delete,
              // session bulk-delete) into the sidebar's bounding box —
              // and (b) when we tried clearing it via removing the
              // `md:translate-x-0` counter, the closed-drawer base
              // `-translate-x-full` shoved the desktop sidebar off-
              // screen. `max-md:` on both conditional translates
              // emits no transform at md+ at all, so neither pathology
              // triggers and the sidebar lays out in its natural flow.
              "fixed inset-y-0 left-0 z-40 shadow-2xl transition-transform duration-200 ease-out " +
              "md:static md:inset-auto md:z-auto md:shadow-none md:transition-none " +
              (drawerOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full")
            }
          />
          <main className="flex flex-1 overflow-hidden">
            {/* Layout when files pane is open:
                  chat (flex) | divider | editor (when ≥1 tab) | divider | files
              The file browser is pinned to the far right; the editor
              materialises between chat and files only when at least
              one file is open. Both right-side panes are user-resizable
              via their dividers; widths persist in localStorage. */}
            {/* Chat column is suppressed when chatOpen=false — fully.
                Includes the empty-state branches (project picker,
                "no session" prompt). When chat is closed AND there's
                no project, the main area is empty and the user can
                re-open chat from the header to reach the picker, or
                use the sidebar's "+ New project" button. */}
            {chatOpen && (
              <div className="flex flex-1 flex-col overflow-hidden">
                {projectsLoaded && projects.length === 0 ? (
                  setupPickerDismissed ? (
                    // Picker dismissed — show a friendly empty state
                    // pointing back at the sidebar's + button. The
                    // header buttons (settings, theme, etc.) stay
                    // reachable from this state too.
                    <div className="flex flex-1 items-center justify-center px-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <img
                          src="/icons/logo-rounded.png"
                          alt=""
                          className="h-16 w-16 rounded-2xl"
                        />
                        <span className="text-xl font-semibold text-neutral-100">Huiyu Pi</span>
                        <div className="space-y-3 text-sm text-neutral-400 light:text-neutral-500">
                          <p>No projects yet.</p>
                          <button
                            onClick={() => setSetupPickerDismissed(false)}
                            className="rounded-md bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-300 light:bg-neutral-200 light:hover:bg-neutral-300 transition-colors"
                          >
                            + New project
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center">
                      <ProjectPicker onClose={() => setSetupPickerDismissed(true)} />
                    </div>
                  )
                ) : activeSessionId !== undefined ? (
                  <>
                    <ChatView sessionId={activeSessionId} />
                    {/* Inline panel for `ask_user_question` tool
                        calls. Renders directly above the composer
                        when the agent has asked something; null
                        otherwise. Lives in the chat-pane flex
                        column so the chat scroll stays usable
                        while answering. */}
                    <AskUserQuestionPanel sessionId={activeSessionId} />
                    <ChatInput sessionId={activeSessionId} />
                  </>
                ) : active ? (
                  <div className="flex flex-1 items-center justify-center px-6 text-center">
                    <div className="space-y-3 text-sm text-neutral-400">
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src="/icons/logo-rounded.png"
                          alt=""
                          className="h-16 w-16 rounded-2xl"
                        />
                        <span className="text-xl font-semibold text-neutral-100">Huiyu Pi</span>
                      </div>
                      <p>Pick a session from the sidebar — or start a new one here.</p>
                      <button
                        onClick={() => {
                          void useSessionStore.getState().createSession(active.id);
                        }}
                        className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
                      >
                        + New session
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-neutral-400">Select a project from the sidebar.</p>
                  </div>
                )}
              </div>
            )}

            {/* Layout rule when chat is hidden: whichever pane is
                LEFTMOST in the render order (editor, then files) takes
                flex-1 + drops its leading divider so the visible panes
                fill the entire main area with at most one slider
                between them. With chat visible, the chat column is
                always the flex-1 leftmost and editor + files keep
                their persisted widths + dividers as before.

                `chatColumnVisible` mirrors the rendering condition for
                the chat column above — strictly chatOpen now. */}
            {!isMobile &&
              editorVisible &&
              (() => {
                const chatColumnVisible = chatOpen;
                const editorIsLeftmost = !chatColumnVisible;
                if (editorIsLeftmost) {
                  return (
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <EditorPanel />
                    </div>
                  );
                }
                return (
                  <>
                    <ResizableDivider
                      getStartSize={() => editorWidthRef.current}
                      onResize={(next) => setEditorWidth(next)}
                      /* Pane is to the RIGHT of the divider, so drag-right
                       shrinks the editor. direction: -1 → grow as user drags left. */
                      direction={-1}
                      minSize={MIN_EDITOR_WIDTH}
                      maxSize={Math.max(
                        MIN_EDITOR_WIDTH,
                        windowWidth -
                          (useUiStore.getState().filesOpen ? filesWidth : 0) -
                          MIN_CHAT_WIDTH -
                          240, // 240 ≈ ProjectSidebar
                      )}
                    />
                    <div
                      className="flex shrink-0 flex-col border-l border-neutral-800"
                      style={{ width: `${editorWidth}px` }}
                    >
                      <EditorPanel />
                    </div>
                  </>
                );
              })()}

            {!isMobile && (
              <FilesPanelLayer
                chatOpen={chatOpen}
                editorVisible={editorVisible}
                minimal={minimal}
                todoPanelOpen={todoPanelOpen}
                activeSessionId={activeSessionId}
                todoPanelHeight={todoPanelHeight}
                filesWidth={filesWidth}
                filesPanelRef={filesPanelRef}
                filesWidthRef={filesWidthRef}
                setTodoPanelHeight={setTodoPanelHeight}
                setFilesWidth={setFilesWidth}
              />
            )}
          </main>
        </div>

        {!isMobile && !minimal && terminalOpen && (
          <>
            <ResizableDivider
              orientation="horizontal"
              getStartSize={() => terminalHeightRef.current}
              onResize={(next) => setTerminalHeight(next)}
              direction={-1}
              minSize={MIN_TERMINAL_HEIGHT}
              maxSize={Math.max(MIN_TERMINAL_HEIGHT, Math.floor(windowHeight * 0.7))}
            />
            <div
              className="relative z-[51] shrink-0 border-t border-neutral-800"
              style={{ height: `${terminalHeight}px` }}
            >
              <TerminalPanel onClose={() => setTerminalOpenPersisted(false)} />
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 z-50 w-64 border-r-[0.5px] border-t border-neutral-800 bg-neutral-900 px-2 pb-2 pt-1.5">
        <div className="flex flex-col" onMouseEnter={onCoffeeEnter} onMouseLeave={onCoffeeLeave}>
          {coffeeHover && (
            <div className="mb-1" onMouseEnter={onCoffeeEnter} onMouseLeave={onCoffeeLeave}>
              <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-2.5">
                <div className="mb-2.5 flex items-center justify-center gap-2.5">
                  <span
                    className={`cursor-pointer text-xs transition-colors ${
                      activeQR === "wechat"
                        ? "font-medium text-[#75B3CB] light:text-cyan-600"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                    onMouseEnter={() => setActiveQR("wechat")}
                  >
                    WeChat
                  </span>
                  <span className="text-[10px] text-neutral-700">|</span>
                  <span
                    className={`cursor-pointer text-xs transition-colors ${
                      activeQR === "alipay"
                        ? "font-medium text-[#75B3CB] light:text-cyan-600"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                    onMouseEnter={() => setActiveQR("alipay")}
                  >
                    Alipay
                  </span>
                  <span className="text-[10px] text-neutral-700">|</span>
                  <span
                    className={`cursor-pointer text-xs transition-colors ${
                      activeQR === "paypal"
                        ? "font-medium text-[#75B3CB] light:text-cyan-600"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                    onMouseEnter={() => setActiveQR("paypal")}
                  >
                    PayPal
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  {activeQR === "wechat" && (
                    <img
                      src="/images/wechat-qr.jpg"
                      alt="WeChat Pay"
                      className="h-32 w-32 rounded border border-neutral-700 bg-neutral-800 object-contain"
                    />
                  )}
                  {activeQR === "alipay" && (
                    <img
                      src="/images/alipay-qr.jpg"
                      alt="Alipay"
                      className="h-32 w-32 rounded border border-neutral-700 bg-neutral-800 object-contain"
                    />
                  )}
                  {activeQR === "paypal" && (
                    <img
                      src="/images/paypal-qr.jpg"
                      alt="PayPal"
                      className="h-32 w-32 rounded border border-neutral-700 bg-neutral-800 object-contain"
                    />
                  )}
                  <div className="flex h-[24px] items-center justify-center">
                    <a
                      href="https://www.paypal.com/ncp/payment/WBPVVVJRMZNHQ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-32 rounded-md bg-neutral-100 py-1 text-center text-[10px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-300"
                    >
                      PayPal
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-2.5 py-1.5 text-xs text-neutral-400"
            title="Buy me a coffee, cheers🍻"
          >
            <Coffee size={13} />
            Buy me a coffee, cheers🍻
          </span>
        </div>
      </div>
    </div>
  );
}

/** Toggle button for the right-side panel. Reads `filesOpen` from
 *  zustand reactively so App.tsx doesn't need to subscribe to it
 *  (avoiding a full App.tsx re-render on every open/close). */
function FilesToggleButton() {
  const open = useUiStore((s) => s.filesOpen);
  return (
    <button
      onClick={() => useUiStore.getState().setFilesOpen(!open)}
      className="flex items-center justify-center rounded-md p-1.5 text-neutral-400"
      title={open ? "Collapse right panel" : "Expand right panel"}
    >
      <ChevronLeft
        size={16}
        className={`transition-transform duration-150 ${open ? "" : "rotate-180"}`}
      />
    </button>
  );
}
