import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Parse the `VITE_DEV_ALLOWED_HOSTS` env into the shape Vite's
 * `server.allowedHosts` expects. Returns `undefined` when unset (Vite
 * falls back to its default allowlist), `true` for `"all"` (disable
 * the check entirely), or a string[] for a comma-separated list. See
 * the comment on the `server.allowedHosts` field below for the
 * security trade-offs of each shape.
 */
function parseAllowedHosts(raw: string | undefined): true | string[] | undefined {
  if (raw === undefined) return undefined;
  if (raw.trim().toLowerCase() === "all") return true;
  const entries = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return entries.length > 0 ? entries : undefined;
}

function devApiTarget(): string {
  const port = process.env.VITE_API_PORT ?? process.env.PORT ?? "9144";
  const host = process.env.VITE_API_HOST ?? "localhost";
  return `http://${host}:${port}`;
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 9145,
    strictPort: true,
    allowedHosts: parseAllowedHosts(process.env.VITE_DEV_ALLOWED_HOSTS),
    proxy: {
      "/api": {
        target: devApiTarget(),
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
