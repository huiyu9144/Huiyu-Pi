import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * PWA 缓存策略：
 *  - `devOptions.enabled: false` 让 `npm run dev`（你平时用的 9145）**完全不注册 SW**，
 *    HMR / 热更新零干扰；
 *  - 生产构建（`start.bat` 跑的 `node packages/server/dist/index.js`，端口 9144）会自动
 *    启用 SW，给用户离线访问 + 二次打开秒开。
 * 这样不需要在 start bat 里写任何判断，环境本身已经分得开。
 *
 * 缓存规则参考上游 `pi-forge-main`：
 *  - `/api/v1/*` 全部 NetworkOnly，绝不缓存接口（避免看到过期会话列表）；
 *  - `navigate` 请求 NetworkFirst + 3s 超时 + 离线兜底 `/offline.html`；
 *  - SSE 端点（`/api/v1/sessions/:id/stream`）走 NetworkOnly 不会被卡住。
 */

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
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/icon.svg",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-maskable-512.png",
        "offline.html",
      ],
      // 留空 manifest 会让 VitePWA 读取 public/manifest.webmanifest（已存在）。
      workbox: {
        // SSE 端点排除在缓存外 —— 缓存流式响应会直接断流。
        // 其它 `/api/v1/*` 全部 NetworkOnly，动态数据永不命中缓存。
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/v1/"),
            handler: "NetworkOnly",
          },
          {
            // 导航请求的最终兜底：网络 + precache 都失败时回退到 /offline.html。
            // NetworkFirst + 3s 超时，避免在网络明显不通时还傻等。
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "huiyu-navigation",
              networkTimeoutSeconds: 3,
              precacheFallback: { fallbackURL: "/offline.html" },
            },
          },
        ],
      },
      devOptions: {
        // 关键：dev 模式下完全关闭 SW，HMR / 热更新才能正常工作。
        // 只有 `npm run build` 出来的产物会注册 SW。
        enabled: false,
      },
    }),
  ],
  server: {
    port: 9145,
    strictPort: true,
    allowedHosts: parseAllowedHosts(process.env.VITE_DEV_ALLOWED_HOSTS),
    proxy: {
      "/api": {
        target: devApiTarget(),
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            const onResClose = (): void => {
              if (!proxyReq.destroyed) {
                proxyReq.destroy();
              }
            };
            res.on("close", onResClose);
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: process.env.NODE_ENV === "production" ? false : true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/react") || id.includes("node_modules/zustand")) return "vendor";
          if (id.includes("node_modules/lucide-react") || id.includes("node_modules/react-markdown") || id.includes("node_modules/katex") || id.includes("node_modules/rehype-katex") || id.includes("node_modules/remark-gfm") || id.includes("node_modules/remark-math") || id.includes("node_modules/refractor") || id.includes("node_modules/prism-react-renderer")) return "ui";
          if (id.includes("node_modules/react-diff-view")) return "diff";
          if (id.includes("node_modules/@xterm")) return "terminal";
          if (id.includes("node_modules/codemirror")) return "codemirror";
        },
      },
    },
  },
});
