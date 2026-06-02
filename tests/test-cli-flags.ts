/**
 * CLI argument parser tests for `huiyu-pi --flag` support.
 *
 * Pure unit-style — imports `parseCliArgs` from the compiled
 * `dist/cli.js` and asserts flag parsing and env var mapping.
 *
 * Does NOT boot the server.
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

let failures = 0;

function assert(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

interface ParsedCli {
  helpRequested: boolean;
  versionRequested: boolean;
  pairs: { envVar: string; value: string | undefined }[];
}

interface CliFlag {
  short?: string;
  type: "string" | "boolean";
  default?: string | boolean;
  description: string;
  envVar: string;
}

const cliModule = (await import(resolve(repoRoot, "packages/server/dist/cli.js"))) as {
  parseCliArgs: (argv: string[]) => ParsedCli;
  applyCliEnv: (parsed: ParsedCli) => void;
  buildHelpText: () => string;
  FLAGS: Record<string, CliFlag>;
};
const { parseCliArgs, applyCliEnv, buildHelpText, FLAGS } = cliModule;

function envFor(parsed: ParsedCli, key: string): string | undefined {
  return parsed.pairs.find((w) => w.envVar === key)?.value;
}

function tryParse(argv: string[]): { parsed: ParsedCli; error: string | null } {
  try {
    return { parsed: parseCliArgs(argv), error: null };
  } catch (e) {
    return {
      parsed: { helpRequested: false, versionRequested: false, pairs: [] },
      error: String(e),
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 0. FLAGS exports
// ─────────────────────────────────────────────────────────────────────────────
console.log("FLAGS export");
{
  const names = Object.keys(FLAGS).sort();
  assert("FLAGS is a non-empty object", names.length > 0, `got ${names.length} flags`);
  assert("FLAGS includes port", names.includes("port"));
  assert("FLAGS includes api-key", names.includes("api-key"));
  assert("FLAGS includes ui-password", names.includes("ui-password"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. every declared flag round-trips to its env var
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nflag round-trip (string flags)");
{
  const argv: string[] = [];
  const expected = new Map<string, string>();
  for (const [name, flag] of Object.entries(FLAGS)) {
    if (flag.type !== "string") continue;
    argv.push(`--${name}`, `value-for-${name}`);
    expected.set(flag.envVar, `value-for-${name}`);
  }
  const { parsed, error } = tryParse(argv);
  assert("no parse errors when all string flags are set", error === null, error ?? "");
  for (const [envKey, want] of expected) {
    assert(`${envKey} → ${want}`, envFor(parsed, envKey) === want);
  }
}

console.log("\nflag round-trip (boolean flags)");
{
  const argv: string[] = [];
  const expected = new Map<string, string>();
  for (const [name, flag] of Object.entries(FLAGS)) {
    if (flag.type !== "boolean") continue;
    argv.push(`--${name}`);
    expected.set(flag.envVar, "true");
  }
  const { parsed, error } = tryParse(argv);
  assert("no parse errors when all boolean flags are set bare", error === null, error ?? "");
  for (const [envKey, want] of expected) {
    assert(`${envKey} → ${want}`, envFor(parsed, envKey) === want);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. boolean coercion
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nboolean coercion");
{
  const bare = parseCliArgs(["--minimal-ui"]);
  assert("bare --minimal-ui → true", envFor(bare, "MINIMAL_UI") === "true");

  const eqFalse = parseCliArgs(["--no-minimal-ui"]);
  assert("--no-minimal-ui → false", envFor(eqFalse, "MINIMAL_UI") === "false");

  const noFlag = parseCliArgs(["--no-serve-client"]);
  assert("--no-serve-client → false", envFor(noFlag, "SERVE_CLIENT") === "false");
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. --help and --version
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nhelp + version");
{
  const help = parseCliArgs(["--help"]);
  assert("--help is recognized", help.helpRequested === true);
  const helpShort = parseCliArgs(["-h"]);
  assert("-h is recognized", helpShort.helpRequested === true);
  const version = parseCliArgs(["--version"]);
  assert("--version is recognized", version.versionRequested === true);

  const helpText = buildHelpText();
  assert("buildHelpText returns text", helpText.length > 100);
  assert("buildHelpText mentions --port", helpText.includes("--port"));
  assert(
    "buildHelpText mentions @/path",
    helpText.includes("@/path") || helpText.includes("@<path>"),
  );
  assert("buildHelpText contains huiyu-pi", helpText.toLowerCase().includes("huiyu-pi"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. unknown flags + positionals are rejected
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nstrictness");
{
  const unknown = tryParse(["--made-up-flag", "value"]);
  assert("unknown flag is rejected", unknown.error !== null, unknown.error ?? "");

  const empty = tryParse([]);
  assert(
    "empty argv produces no error and no pairs",
    empty.error === null && empty.parsed.pairs.length === 0,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. flag overrides env
// ─────────────────────────────────────────────────────────────────────────────
console.log("\napplyCliEnv overrides existing env");
{
  const prev = process.env.PORT;
  try {
    process.env.PORT = "9999";
    const parsed = parseCliArgs(["--port", "8888"]);
    applyCliEnv(parsed);
    assert("--port wins over pre-existing PORT", process.env.PORT === "8888");

    const parsedNoPort = parseCliArgs(["--minimal-ui"]);
    process.env.PORT = "7777";
    applyCliEnv(parsedNoPort);
    assert("PORT is preserved when --port is absent", process.env.PORT === "7777");
  } finally {
    if (prev === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = prev;
    }
  }
}

console.log("");
if (failures > 0) {
  console.log(`FAIL  ${failures} assertion(s) failed`);
  process.exit(1);
}
console.log("PASS  test-cli-flags");
