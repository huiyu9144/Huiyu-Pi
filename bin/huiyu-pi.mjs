#!/usr/bin/env node

import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, "..");

// Published layout:  dist/server/   (flat npm package)
// Local dev layout:  packages/server/dist/  (monorepo)
function serverDistDir() {
  const published = resolve(packageRoot, "dist", "server");
  if (existsSync(join(published, "index.js"))) return published;
  return resolve(packageRoot, "packages", "server", "dist");
}

function clientDistDir() {
  const published = resolve(packageRoot, "dist", "client");
  if (existsSync(join(published, "index.html"))) return published;
  return resolve(packageRoot, "packages", "client", "dist");
}

const serverDir = serverDistDir();
process.env.CLIENT_DIST_PATH ??= clientDistDir();
process.env.NODE_ENV ??= "production";

const cliEntry = join(serverDir, "cli.js");
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

const serverEntry = join(serverDir, "index.js");
const { start } = await import(pathToFileURL(serverEntry).href);
await start();
