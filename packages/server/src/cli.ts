import { parseArgs as nodeParseArgs, type ParseArgsConfig } from "node:util";

interface CliFlag {
  short?: string;
  type: "string" | "boolean";
  default?: string | boolean;
  description: string;
  envVar: string;
}

export const FLAGS: Record<string, CliFlag> = {
  port: {
    short: "p",
    type: "string",
    default: "9144",
    description: "HTTP listen port",
    envVar: "PORT",
  },
  host: {
    type: "string",
    default: "127.0.0.1",
    description: "HTTP listen address (0.0.0.0 for LAN)",
    envVar: "HOST",
  },
  "cors-origin": {
    type: "string",
    description: "Access-Control-Allow-Origin value",
    envVar: "CORS_ORIGIN",
  },
  "trust-proxy": {
    type: "boolean",
    description: "Trust X-Forwarded-For / X-Forwarded-Proto",
    envVar: "TRUST_PROXY",
  },
  "workspace-path": {
    type: "string",
    description: "Directory for project data (~/.huiyu-pi/workspace)",
    envVar: "WORKSPACE_PATH",
  },
  "pi-config-dir": {
    type: "string",
    description: "pi SDK config dir (~/.pi/agent)",
    envVar: "PI_CONFIG_DIR",
  },
  "forge-data-dir": {
    type: "string",
    description: "Forge-owned data dir (~/.huiyu-pi)",
    envVar: "FORGE_DATA_DIR",
  },
  "session-dir": {
    type: "string",
    description: "Session storage dir (defaults under workspace-path)",
    envVar: "SESSION_DIR",
  },
  "client-dist-path": {
    type: "string",
    description: "Path to built client static files",
    envVar: "CLIENT_DIST_PATH",
  },
  "ui-password": {
    type: "string",
    description: "Browser login password (sensitive; supports @/path)",
    envVar: "UI_PASSWORD",
  },
  "api-key": {
    type: "string",
    description: "Programmatic Bearer token (sensitive; supports @/path)",
    envVar: "API_KEY",
  },
  "jwt-secret": {
    type: "string",
    description: "JWT signing key (auto-generated if unset and auth enabled)",
    envVar: "JWT_SECRET",
  },
  "serve-client": {
    type: "boolean",
    default: true,
    description: "Serve the built client UI (disable for API-only)",
    envVar: "SERVE_CLIENT",
  },
  "minimal-ui": {
    type: "boolean",
    description: "Hide terminal/git/providers settings in the UI",
    envVar: "MINIMAL_UI",
  },
  "log-level": {
    type: "string",
    default: "info",
    description: "Server log level (trace, debug, info, warn, error, fatal)",
    envVar: "LOG_LEVEL",
  },
  "expose-docs": {
    type: "boolean",
    default: true,
    description: "Serve OpenAPI docs at /api/docs",
    envVar: "EXPOSE_DOCS",
  },
};

export interface ParsedCli {
  helpRequested: boolean;
  versionRequested: boolean;
  pairs: { envVar: string; value: string | undefined }[];
}

export function parseCliArgs(raw: string[]): ParsedCli {
  const options: ParseArgsConfig["options"] = {};
  for (const [long, flag] of Object.entries(FLAGS)) {
    const entry: { type: "string" | "boolean"; short?: string; default?: string | boolean } = {
      type: flag.type,
    };
    if (flag.short !== undefined) entry.short = flag.short;
    if (flag.default !== undefined) entry.default = flag.default;
    options[long] = entry;
  }
  options.help = { type: "boolean", short: "h" };
  options.version = { type: "boolean" };

  const parsed = nodeParseArgs({
    args: raw,
    options,
    allowPositionals: false,
  });

  const helpRequested = parsed.values.help === true || raw.includes("--help");
  const versionRequested = parsed.values.version === true || raw.includes("--version");

  const pairs: { envVar: string; value: string | undefined }[] = [];
  for (const [long, flag] of Object.entries(FLAGS)) {
    const cliValue = parsed.values[long];
    if (cliValue === undefined) {
      // Flag not provided on CLI — leave whatever's already in process.env
      continue;
    }
    // `parseArgs` returns "string | string[] | undefined" for string type.
    // We never use `multiple: true`, so string[] doesn't happen here
    // (and if it somehow did, the cast preserves it as the env value).
    const stringValue = Array.isArray(cliValue)
      ? cliValue.join(",")
      : (cliValue as string | undefined);
    if (stringValue === undefined && flag.type === "boolean") {
      // Boolean flag passed without value: --serve-client → true.
      // parseArgs already set it to the default (true).
      pairs.push({ envVar: flag.envVar, value: "true" });
    } else if (stringValue !== undefined) {
      pairs.push({ envVar: flag.envVar, value: stringValue });
    }
  }

  return { helpRequested, versionRequested, pairs };
}

export function applyCliEnv(parsed: ParsedCli): void {
  for (const { envVar, value } of parsed.pairs) {
    if (value === undefined) {
      delete process.env[envVar];
    } else {
      process.env[envVar] = value;
    }
  }
}

export function buildHelpText(): string {
  const lines: string[] = [
    "huiyu-pi — Self-hosted browser workbench for the pi coding agent",
    "",
    "Usage:",
    "  huiyu-pi [options]",
    "  npx huiyu-pi [options]",
    "",
    "Options:",
  ];

  const sorted = Object.entries(FLAGS).sort(([a], [b]) => a.localeCompare(b));
  for (const [long, flag] of sorted) {
    const shortFlag = flag.short ? `-${flag.short}, ` : "    ";
    const defaultStr = flag.default !== undefined ? ` (default: ${flag.default})` : "";
    const envStr = ` [env: ${flag.envVar}]`;
    lines.push(`  ${shortFlag}--${long.padEnd(22)} ${flag.description}${defaultStr}${envStr}`);
  }

  lines.push("");
  lines.push("  -h, --help                 Show this help message");
  lines.push("  --version                  Show version number");
  lines.push("");
  lines.push("Sensitive values (@/path):");
  lines.push("  --ui-password, --api-key, --jwt-secret support reading from a file");
  lines.push("  by prefixing the value with @. Example: --api-key @/run/secrets/api-key");
  lines.push("");
  lines.push("Examples:");
  lines.push("  huiyu-pi");
  lines.push("  huiyu-pi --port 4000 --workspace-path ~/Code");
  lines.push("  huiyu-pi --api-key @/run/secrets/api-key --no-expose-docs");

  return lines.join("\n");
}
