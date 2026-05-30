#!/usr/bin/env node

import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, "..");

// Point the server at the bundled client dist. The publish layout is:
//   bin/huiyu-piwebui-forge.mjs       ← this file
//   dist/server/index.js               ← compiled server
//   dist/client/index.html             ← built Vite SPA
// When running from source (npm run dev), this is the same path as
// packages/client/dist — in that case the packageRoot is the monorepo
// root and dist/client/ just doesn't exist yet. The server's own
// fallback (CLIENT_DIST_PATH in config.ts) points at
// packages/client/dist for the dev flow.
process.env.CLIENT_DIST_PATH ??= resolve(packageRoot, "dist", "client");
process.env.NODE_ENV ??= "production";

const cliEntry = resolve(packageRoot, "dist", "server", "cli.js");
const { parseCliArgs, applyCliEnv, buildHelpText } = await import(pathToFileURL(cliEntry).href);

const parsed = parseCliArgs(process.argv.slice(2));

if (parsed.helpRequested) {
  console.log(buildHelpText());
  process.exit(0);
}

if (parsed.versionRequested) {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const pkg = require(resolve(packageRoot, "package.json"));
  console.log(pkg.version);
  process.exit(0);
}

applyCliEnv(parsed);

const serverEntry = resolve(packageRoot, "dist", "server", "index.js");
const { start } = await import(pathToFileURL(serverEntry).href);
await start();
