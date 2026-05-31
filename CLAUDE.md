# AGENTS.md

This file is the always-loaded entrypoint for coding agents working on pi-forge.
Keep it short and reliable. Detailed guidance has been split into `docs/agent/*`;
read the relevant file(s) before touching that area.

---

## What This Project Is

pi-forge is a browser UI for the pi coding agent (`github.com/badlogic/pi-mono`).
It is an HTTP server that embeds the `@earendil-works/pi-coding-agent` SDK and
exposes it to a browser over REST + Server-Sent Events.

It is NOT a reimplementation of the agent, tools, session logic, or LLM
communication. Those come from the pi SDK. This project is the HTTP bridge and UI.

Single-tenant by design: one container, one workspace root, one user. No multi-user
auth or isolation is needed or planned.

Config ownership: `PI_CONFIG_DIR` (default `~/.pi/agent`) is pi SDK territory;
`FORGE_DATA_DIR` (default `~/.huiyu-pi`) is pi-forge territory.

---

## Required Reading

Before making changes, read the relevant `docs/agent/*.md` for that area:
- architecture / server / client / api / sessions / config / filesystem / terminal / mcp / testing / releases / prs

Do not move files under `docs/` when updating agent guides.

---

## Build & Dev Commands

```bash
npm install          # Install all workspace deps (run from root)
npm run build        # Compile server TS + Vite client build
npm run dev          # Start server (:3000) + Vite client (:5173)
npm run dev:remote   # Bind both to 0.0.0.0; set auth before exposing
npm run check        # tsc + eslint + prettier (requires npm run build first)
npm run format:check # Prettier formatting check
npm run test:ci      # CI test loop (skips test-docker)
npm run test         # Local full loop (no CI skip list)

# Single/subset tests while debugging:
npx tsx tests/test-session.ts
scripts/run-tests.sh --only session,terminal
```

Use the runner before opening a PR. Run Prettier/format checks for docs-only or
config-only changes when full checks are unnecessary. When product behavior changes,
update the relevant integration test in the same PR.

## Version Management (Important!)

**NEVER hand-edit version numbers in package.json files.** The project has 4
files that must stay in sync (root/client/server/package-lock.json). Use the
automated tools below.

### Everyday push (no release)
```bash
git add -A && git commit -m "your message" && git push
```

### Push + create a new release
Only do this when the user explicitly asks to "release" or "publish a version":

```bash
release.bat <new-version>
# Example: release.bat 1.1.0
```

This automatically:
1. Updates all 4 version files in lockstep
2. Commits, tags (v1.1.0), and pushes
3. Triggers GitHub Actions to build Docker images + create Release

If the script fails with "CHANGELOG is empty", add `--allow-empty`:
```bash
release.bat 1.1.0 --allow-empty
```

### Safety checks built into the script
The `scripts/bump-version.sh` called by release.bat protects against:
- ❌ Version regression (e.g. 1.0.0 → 0.9.9)
- ❌ Invalid SemVer format
- ❌ Dirty working tree (uncommitted changes)
- ❌ Version drift between the 4 files
- ❌ Missing CHANGELOG entries (requires --allow-empty to bypass)

So you can safely run it without worrying about mistakes.

---

## Critical Conventions

1. **No default exports.** Use named exports everywhere.
2. **Never return raw secrets.** `config-manager.ts readAuthSummary()` returns only
   provider presence/source, never actual key values.
3. **All filesystem operations go through `file-manager.ts` or `git-runner.ts`.**
   Do not trust raw path params without file-manager validation.
4. **All config/data writes are atomic.** Write a `.tmp` file, then `rename()`.
5. **React state goes through Zustand stores.** Components should not hold
   significant local state.

See `docs/agent/architecture.md` for the remaining conventions.

---

## Efficiency Rules

- When creating a file, overwrite if it already exists. Do not rename or create variants.
- Do not list directories or check existing files before creating — just create directly.
- Do not suggest using open-file or ask if the user wants to open the file. Just mention the path and content.

---

## Pi SDK Facts That Are Easy To Get Wrong

- `createAgentSession()` is async and must be awaited.
- `session.prompt()` resolves only after the full agent run finishes. Prompt routes
  should fire-and-forget and return 202; output streams over SSE.
- `session.subscribe()` returns an unsubscribe function. Call it on dispose.
- `AgentSessionEvent` is a union. Always switch on `event.type`.
- Session JSONL first line is the header. Parse it for metadata without loading the
  whole file.
- `session.fork()` creates a new session file. `session.navigateTree()` mutates the
  current session file in place.
- Pi has no native MCP; pi-forge translates MCP tools into pi `customTools`.
- Pi has no native sub-agent support; pi-forge surfaces `pi-subagents` child JSONLs.

Read `docs/agent/sessions.md` and `docs/agent/mcp.md` for details.

---

## Output Deliverables

- Save deliverables as `.md` or `.html` files in the project directory.
- After writing, mention the file path so the user can click to preview.
- For HTML: ensure it's a complete, standalone page.
- For MD: use proper markdown formatting for best preview quality.

---

## End-of-Session PR Summaries

When preparing a PR description or merge-ready handoff, read
`docs/agent/prs.md` and use its Summary / Usage / What changed / Test plan
structure.
