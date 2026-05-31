# Agent Notes: Architecture

Read this when changing project structure, high-level data flow, package boundaries, or core data models.

## What This Project Is

pi-forge is a browser UI for the pi coding agent (github.com/badlogic/pi-mono).
It is an HTTP server that embeds the `@earendil-works/pi-coding-agent` SDK and exposes
it to a browser over REST + Server-Sent Events.

It is NOT a reimplementation of the agent, tools, session logic, or LLM communication.
All of that comes from the pi SDK. This project is the HTTP bridge and the UI on top.

Single-tenant by design. One container, one workspace root, one user. No multi-user
auth or isolation is needed or planned.

---

## Repository Layout

```
pi-forge/
├── packages/
│   ├── server/                          # Fastify HTTP server (Node.js + TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts                 # App entry: builds Fastify, registers plugins + routes, starts server
│   │   │   ├── cli.ts                   # CLI arg parser; single source of truth for env↔flag mapping
│   │   │   ├── config.ts                # ALL process.env reads — import `config` from here, nowhere else
│   │   │   ├── auth.ts                  # JWT sign/verify + scrypt password hashing
│   │   │   ├── session-registry.ts      # In-memory AgentSession store — THE central module
│   │   │   ├── sse-bridge.ts            # AgentSessionEvent → SSE serialization
│   │   │   ├── project-manager.ts       # projects.json read/write
│   │   │   ├── config-manager.ts        # pi config files read/write (models/auth/settings)
│   │   │   ├── config-export.ts         # tar.gz backup export + import (Settings → Backup)
│   │   │   ├── file-manager.ts          # Workspace filesystem ops — path validation lives HERE
│   │   │   ├── file-searcher.ts         # Workspace ripgrep wrapper (file content search)
│   │   │   ├── file-references.ts       # `@path` expansion at prompt-send time
│   │   │   ├── git-runner.ts            # git command execution wrapper
│   │   │   ├── turn-diff-builder.ts     # Aggregate file diff from one session turn
│   │   │   ├── pty-manager.ts           # node-pty lifecycle for the integrated terminal
│   │   │   ├── diagnostics.ts           # Optional fetch-wrap + agent-event verbose log
│   │   │   ├── agent-resource-loader.ts # Skills + tools + prompts merged for createAgentSession
│   │   │   ├── extensions-discovery.ts  # Walks `<dir>/skills/`, `<dir>/prompts/`, etc.
│   │   │   ├── skill-overrides.ts       # Per-project skill enable/disable (forge-private)
│   │   │   ├── tool-overrides.ts        # Per-project tool enable/disable (forge-private)
│   │   │   ├── prompt-overrides.ts      # Per-project pi-prompt enable/disable (forge-private)
│   │   │   ├── compaction-history.ts    # Per-session compaction event log
│   │   │   ├── concurrency.ts           # Async-mutex helpers for serialized writes
│   │   │   ├── attachment-converters.ts # Image/text attachment normalization for prompt route
│   │   │   ├── skills-export.ts         # Skills archive export
│   │   │   ├── mcp/                     # MCP client manager + customTools bridge — see docs/mcp.md
│   │   │   ├── webhooks/                 # HTTPS webhook delivery for agent/session events
│   │   │   │   ├── store.ts             # webhooks.json + webhook-deliveries.json CRUD
│   │   │   │   ├── dispatcher.ts        # Match → POST → retry (1s/5s/30s) → record delivery
│   │   │   │   ├── event-bridge.ts      # SDK/forge events → dispatcher
│   │   │   │   ├── init.ts              # Boot-time wiring of ask-user-question + processes
│   │   │   │   └── types.ts             # WebhookConfig, DeliveryRecord, event union
│   │   │   ├── orchestration/            # Session-as-supervisor / session-as-worker (opt-in)
│   │   │   │   ├── store.ts             # session-orchestration.json + orchestrator-inbox.json
│   │   │   │   ├── tools.ts             # orchestrate_* ToolDefinition factory (8 tools)
│   │   │   │   ├── inbox.ts             # PUSH wakeup when supervisor idle + PULL drain
│   │   │   │   ├── event-bridge.ts      # Worker SDK/forge events → supervisor inbox
│   │   │   │   ├── init.ts              # Boot-time wiring of ask-user-question + processes
│   │   │   │   ├── config.ts            # ORCHESTRATION_ENABLED env + fanout cap
│   │   │   │   └── types.ts             # InboxItem, SupervisorRecord, WorkerRecord
│   │   │   └── routes/                  # auth, config, control, exec, files, git, health,
│   │   │                                #   mcp, projects, prompt, sessions, stream, terminal,
│   │   │                                #   webhooks, orchestration, _schemas (shared schemas)
│   │   └── package.json
│   └── client/                          # React + Vite frontend (TypeScript)
│       ├── index.html                   # Viewport meta + theme-color (dark default; updated by theme.ts)
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx                  # Layout shell + mobile drawer/breakpoint chrome
│       │   ├── lib/
│       │   │   ├── api-client/          # Typed fetch wrapper — ALL HTTP calls go here
│       │   │   ├── sse-client.ts        # SSE connection manager (auto-reconnect)
│       │   │   ├── auth-client.ts       # Token storage and attachment
│       │   │   ├── theme.ts             # 5-theme registry + per-theme `theme-color` meta sync
│       │   │   ├── use-is-mobile.ts     # Reactive viewport hook (Tailwind md breakpoint)
│       │   │   ├── cross-tab.ts         # BroadcastChannel for cross-tab state sync
│       │   │   ├── diff-parser.ts       # Unified diff → structured hunks
│       │   │   ├── diff-highlight.ts    # Prism syntax highlighting in diffs
│       │   │   ├── git-graph.ts         # Branch/commit graph layout
│       │   │   └── subagent-parser.ts   # pi-subagents tool-result parsing for the rich card
│       │   ├── store/                   # Zustand stores: auth, project, session, file, mcp,
│       │   │                            #   terminal, ui, ui-config
│       │   └── components/              # ChatInput, ChatView, ProjectSidebar, EditorPanel,
│       │                                #   FileBrowserPanel, GitPanel, TerminalPanel,
│       │                                #   InstallPrompt (mobile PWA), SettingsPanel, …
│       └── package.json
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
├── docs/                                # User + operator docs — configuration, mobile,
│                                        #   mcp, deployment, architecture, sse-events, etc.
├── tests/                               # Integration test scripts (run via `npm run test:ci`)
├── bin/huiyu-pi.mjs                     # npm-bin entry; parses CLI args, imports server
├── scripts/                             # bump-version, build-publish-dir, run-tests
├── AGENTS.md                            # This file
└── CLAUDE.md                            # Symlink to AGENTS.md
```

---

## Architecture & Data Flow

### Request → Agent → Browser

```
Browser
  │
  ├─ POST /api/v1/sessions/:id/prompt  ─────────────────────────────────┐
  │                                                                   │
  │                                               session-registry.ts │
  │                                               session.prompt()    │
  │                                                    │              │
  │                                           pi SDK agent loop      │
  │                                                    │              │
  │                                           AgentSessionEvents      │
  │                                                    │              │
  │                                             sse-bridge.ts         │
  │                                                    │              │
  └─ GET /api/v1/sessions/:id/stream  ◄──────── SSE stream ◄────────────┘
```

### Session Lifecycle

1. `POST /api/sessions` → `session-registry.ts createSession(projectId, path)`
   → calls `createAgentSession()` from pi SDK with file-backed `SessionManager`
   → wires `session.subscribe()` to fan out events to all SSE clients
   → stores `LiveSession` in in-memory registry Map

2. On server restart, sessions are NOT in the registry. They are lazy-loaded:
   `GET /api/v1/sessions/:id/stream` calls `resumeSession()` if id is missing from
   registry. `resumeSession()` calls `createAgentSession()` with the existing
   JSONL file path, restoring full message history.

3. `discoverSessionsOnDisk(projectPath)` scans the sessions directory and parses
   only the first line (header) of each `.jsonl` file to build the session list
   shown in the sidebar — does NOT load full sessions into memory eagerly.

### SSE Snapshot on Connect

Every new SSE client immediately receives a `snapshot` event:
```json
{
  "type": "snapshot",
  "sessionId": "...",
  "projectId": "...",
  "messages": [...],
  "isStreaming": false
}
```
This hydrates the client's message list on connect or reconnect without needing a
separate HTTP call. The frontend SSE client must handle this event before all others.

### Prompt with Attachments

`POST /api/v1/sessions/:id/prompt` accepts both JSON and `multipart/form-data`:
- JSON: `{ text, streamingBehavior? }` — plain text prompt, no attachments
- Multipart: `text` field + `attachments[]` files
  - Image files → base64 → passed as `images` array to `session.prompt()`
  - Text files → read content → prepended to prompt as fenced code block

`session.prompt()` is always fire-and-forget from the HTTP perspective — returns
202 immediately. The actual response streams over SSE.

---

## Project Data Model

```typescript
interface Project {
  id: string;        // UUID — generated by project-manager.ts on creation
  name: string;      // Display name
  path: string;      // Absolute path, e.g. /workspace/my-repo
  createdAt: string; // ISO 8601 timestamp
}
```

Projects are stored in `FORGE_DATA_DIR/projects.json` as a JSON array.
A session belongs to a project when its `cwd` matches the project's `path`.
`WORKSPACE_PATH` is the root that the folder picker defaults to and the boundary
that all project paths must be inside. Reject any project path outside
`WORKSPACE_PATH` with a 403 — never with a 500.

---

## LiveSession Data Model

```typescript
interface LiveSession {
  session: AgentSession;   // pi SDK session object
  sessionId: string;       // Matches session.sessionId — UUID from JSONL header
  projectId: string;       // Which project this session belongs to
  workspacePath: string;   // Absolute project path — the cwd for tool execution
  clients: Set<SSEClient>; // All currently connected SSE listeners
  createdAt: Date;
  lastActivityAt: Date;    // Updated on every AgentSessionEvent
}
```

The registry is `Map<sessionId, LiveSession>`. It is an in-memory singleton in
`session-registry.ts`. There is no database. Sessions survive server restart because
their JSONL files persist on disk — the registry is rebuilt lazily as clients connect.

---

## Key Package Reference

### Server

| Package | Purpose |
|---|---|
| `@earendil-works/pi-coding-agent` | `AgentSession`, `createAgentSession`, `SessionManager`, `AuthStorage`, `ModelRegistry` |
| `@earendil-works/pi-agent-core` | `Agent`, `AgentSessionEvent` union type, `AgentMessage` types |
| `@earendil-works/pi-ai` | `getModel`, provider abstraction |
| `fastify` | HTTP server |
| `@fastify/static` | Serve built client files in production |
| `@fastify/cors` | CORS for dev (disabled in prod) |
| `@fastify/multipart` | File upload parsing for prompt attachments |
| `@fastify/rate-limit` | Login endpoint rate limiting |
| `@fastify/swagger` | Auto-generate OpenAPI spec from route schemas |
| `@fastify/swagger-ui` | Serve interactive API docs at `/api/docs` |
| `@fastify/websocket` | WebSocket support for terminal PTY (Phase 11) |
| `jsonwebtoken` | JWT sign/verify for browser auth |
| `node-pty` | PTY for integrated terminal (Phase 11) |

### Client

| Package | Purpose |
|---|---|
| `zustand` | State management |
| `react-markdown` + `remark-gfm` | Markdown rendering in chat |
| `react-diff-view` | Diff rendering — unified and side-by-side |
| `prism-react-renderer` | Syntax highlighting for diffs |
| `codemirror` + `@codemirror/*` | File editor |
| `@codemirror/theme-one-dark` | Editor theme |
| `xterm` + `@xterm/addon-fit` + `@xterm/addon-web-links` | Terminal emulator (Phase 11) |
| `lucide-react` | Icons throughout the UI |
| `vite-plugin-pwa` | PWA manifest + service worker (Phase 8) |

---


## Critical Conventions

**1. All AgentSession interactions go through session-registry.ts.**
Never import `AgentSession` or call `createAgentSession()` directly in route
handlers. Routes call functions on the registry. This is the single source of truth
for live session state.

**2. All filesystem operations go through file-manager.ts or git-runner.ts.**
Never call `fs.*` directly in route handlers. `file-manager.ts` enforces path
validation — all other code trusts it.

**3. Path validation is always enforced in file-manager.ts.**
Every method in `file-manager.ts` validates the target path is inside the project
root before executing. Route handlers must NEVER trust raw `path` query params or
body fields without running them through file-manager. Return 403 for any traversal
attempt — do not throw, do not 500.

**4. Auth config reads are read-only in routes.**
`config-manager.ts readAuthSummary()` returns ONLY which providers have credentials
(a boolean presence map plus the SDK-reported source). It NEVER returns actual key
values. This is enforced in `config-manager.ts` itself. Do not add any code path
that returns raw key values.

**5. All config file writes are atomic.**
Write to a `.tmp` file first, then `fs.rename()` to the target. This prevents
half-written config files on crash. This pattern is already in `config-manager.ts`
and `project-manager.ts` — follow it for any new file writes.

**6. No default exports.**
Use named exports everywhere in both server and client packages. This makes
refactoring and import tracing easier.

**7. Fastify plugins and routes are registered in index.ts only.**
Do not call `fastify.register()` in route files. Route files export a Fastify
plugin function; `index.ts` registers them with their route prefix.

**8. React state only through Zustand stores.**
Components do not hold significant local state. API calls are made through
`api-client.ts`. SSE events are dispatched into stores via `sse-client.ts`.
Components read from stores and dispatch actions.

**9. All HTTP calls from the client go through api-client.ts.**
Never call `fetch()` directly in components. `api-client.ts` handles auth token
attachment and 401 redirect. This is also where request/response types are defined.

**10. Auth is global with explicit opt-out — not opt-in.**
A single `preHandler` hook in `index.ts` enforces JWT/API-key auth for every
route under `/api/v1/`. Public routes opt out by setting
`config: { public: true }` on the route definition (currently:
`/api/v1/health`, `/api/v1/auth/*`, and `/api/v1/ui-config`). Adding a new
public route REQUIRES both: (a) the `config: { public: true }` opt-out, and
(b) `security: []` in the route's schema so the OpenAPI spec at `/api/docs`
reflects the public access. Forgetting either is a security/spec bug.

---
