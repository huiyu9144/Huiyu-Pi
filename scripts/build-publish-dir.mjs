#!/usr/bin/env node

/**
 * build-publish-dir.mjs — Assemble a flat npm-publishable directory from
 * the monorepo's build output.
 *
 * Prerequisites: `npm run build` (server tsc + client vite build) has
 * been run and both `packages/server/dist/` and `packages/client/dist/`
 * exist.
 *
 * Produces a `publish/` directory at the repo root with the layout:
 *
 *   publish/
 *     bin/huiyu-piwebui-forge.mjs   ← CLI entry (npm bin)
 *     bin/fix-pty-perms.mjs          ← postinstall helper
 *     dist/server/index.js           ← compiled server
 *     dist/client/index.html         ← built Vite SPA
 *     package.json                   ← synthetic, not a copy
 *     README.md                      ← copy from root
 *     LICENSE                        ← copy from root
 */

import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const publishDir = join(root, "publish");

// ── Validate prerequisites ──────────────────────────────────────────
const serverDist = join(root, "packages", "server", "dist");
const clientDist = join(root, "packages", "client", "dist");

if (!existsSync(join(serverDist, "index.js"))) {
  console.error("[publish] packages/server/dist/index.js not found. Run `npm run build` first.");
  process.exit(1);
}
if (!existsSync(join(clientDist, "index.html"))) {
  console.error("[publish] packages/client/dist/index.html not found. Run `npm run build` first.");
  process.exit(1);
}

// ── Clean + create publish dir ──────────────────────────────────────
if (existsSync(publishDir)) {
  // Simple rimraf — rm -rf on the publish dir
  cpSync(publishDir, join(root, "publish-tmp"), { recursive: true, force: true });
}

mkdirSync(join(publishDir, "bin"), { recursive: true });
mkdirSync(join(publishDir, "dist", "server"), { recursive: true });
mkdirSync(join(publishDir, "dist", "client"), { recursive: true });

// ── Copy assets ─────────────────────────────────────────────────────
cpSync(serverDist, join(publishDir, "dist", "server"), { recursive: true, force: true });
cpSync(clientDist, join(publishDir, "dist", "client"), { recursive: true, force: true });
copyFileSync(join(root, "bin", "huiyu-piwebui-forge.mjs"), join(publishDir, "bin", "huiyu-piwebui-forge.mjs"));
copyFileSync(join(root, "bin", "fix-pty-perms.mjs"), join(publishDir, "bin", "fix-pty-perms.mjs"));

for (const file of ["README.md", "LICENSE"]) {
  const src = join(root, file);
  if (existsSync(src)) copyFileSync(src, join(publishDir, file));
}

// ── Read root + server package.json ─────────────────────────────────
const rootPkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const serverPkg = JSON.parse(readFileSync(join(root, "packages", "server", "package.json"), "utf8"));

// ── Write synthetic package.json ────────────────────────────────────
const publishPkg = {
  name: "huiyu-piwebui-forge",
  version: rootPkg.version,
  description: rootPkg.description ?? "Self-hosted browser workbench for the pi coding agent",
  type: "module",
  bin: {
    "huiyu-piwebui-forge": "bin/huiyu-piwebui-forge.mjs",
  },
  files: ["bin/", "dist/", "README.md", "LICENSE"],
  engines: {
    node: ">=20",
  },
  scripts: {
    postinstall: "node bin/fix-pty-perms.mjs",
  },
  dependencies: serverPkg.dependencies,
  publishConfig: {
    access: "public",
    provenance: true,
  },
  license: rootPkg.license ?? "MIT",
};

writeFileSync(join(publishDir, "package.json"), JSON.stringify(publishPkg, null, 2) + "\n");

console.log(`[publish] Assembled in ${publishDir}`);
console.log(`[publish] Package: huiyu-piwebui-forge@${rootPkg.version}`);
console.log(`[publish] Run:  cd publish && npm publish`);
