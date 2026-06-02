<p align="center">
  <img src="packages/client/public/icons/logo-rounded.png" alt="Huiyu Pi" width="120">
</p>

<h1 align="center">Huiyu Pi</h1>

<p align="center">
  <a href="README.zh.md">🇨🇳 中文说明</a> · <a href="https://www.huiyu.ai">🌐 官网</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/context-~80_tokens-00d4aa?style=flat-square" alt="~80 tokens">
  <img src="https://img.shields.io/badge/first_token-~0.3s-60A5FA?style=flat-square" alt="~0.3s">
  <img src="https://img.shields.io/badge/cost-90%25%2B_cheaper-00d4aa?style=flat-square" alt="90%+ cheaper">
  <img src="https://img.shields.io/badge/deploy-local-brightgreen?style=flat-square" alt="Local">
  <img src="https://img.shields.io/github/license/huiyu9144/Huiyu-Pi?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/huiyu9144/Huiyu-Pi?style=flat-square" alt="Stars">
  <img src="https://img.shields.io/github/forks/huiyu9144/Huiyu-Pi?style=flat-square" alt="Forks">
  <img src="https://img.shields.io/github/issues/huiyu9144/Huiyu-Pi?style=flat-square" alt="Issues">
  <img src="https://img.shields.io/github/release/huiyu9144/Huiyu-Pi?style=flat-square" alt="Release">
</p>

<p align="center">
  <b>AI coding agent, stripped to essentials.</b><br>
  ~80 tokens system prompt · ~0.3s first token · 4 basic tools · 100% local
</p>

<p align="center" style="max-width:800px;margin:0 auto;color:#64748b;font-size:12px;line-height:1.6;">
  Huiyu Pi webUI, A local open-source Agent tool that lets you <b style="color:#00d4aa;">build your own Harness system</b> from scratch.
  Built on Pi and pi-forge, compared to IDE tools like Codex and Claude Code,
  <b style="color:#00d4aa;">context is reduced to nearly 0 with massive speed improvements</b>.
  Build cleanly without platform restrictions.
</p>

<table>
  <tr>
    <td width="100%"><img src="docs/images/ScreenShot_2026-06-02_161947_814.jpg" alt="Huiyu Pi Screenshot" width="100%"></td>
  </tr>
  <tr>
    <td width="100%"><img src="docs/images/demo.gif" alt="Huiyu Pi Demo" width="100%"></td>
  </tr>
</table>

<table>
  <tr>
    <td width="50%"><img src="docs/images/screenshot-session.jpg" alt="Session Management"></td>
    <td width="50%"><img src="docs/images/screenshot-terminal.jpg" alt="Integrated Terminal"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/images/screenshot-files.png" alt="File Browser + Editor"></td>
    <td width="50%"><img src="docs/images/screenshot-git.jpg" alt="Git Integration"></td>
  </tr>
</table>

---

## Why ~80 Tokens?

Most AI coding tools pack 15,000–28,000 tokens into every request — rules, tool definitions, role prompts, output formatting. The AI spends most of its attention reading boilerplate instead of solving your problem.

Huiyu Pi takes the opposite approach: strip everything non-essential. 4 basic tools. Clean canvas. No baggage.

| | Before (typical) | Huiyu Pi |
|---|---|---|
| System prompt overhead | 15K–28K tokens | **~80 tokens** |
| First token response | 2–10 seconds | **~0.3 seconds** |
| Per-request cost | $0.02–$0.10+ | **90%+ cheaper** |
| Tool definitions | 10–24+ | **4 essentials** |
| Client type | Heavy desktop / Electron | **Pure Web UI** |
| Data privacy | Cloud or hybrid | **100% local** |

---

## Why Choose Huiyu Pi?

Built on pi and pi-forge, fixing their lack of a frontend WebUI and clunky interaction details. Huiyu Pi is a browser-based webui for the pi coding agent — it's blazing fast and feels great to use — that's why I'm sharing it.

| | Advantage | Details |
|---|---|---|
| ⚡ | **Faster Performance** | Default context and prompts compressed from ~20K tokens to near zero. AI response time is dramatically shorter. |
| 💰 | **Lower Token Consumption** | Most unused context stripped away, drastically reducing per-request API costs. |
| 🎯 | **Less Context, More Focus** | Less context = AI stays focused on core instructions for more precise execution. |
| 🔒 | **Local Deployment = Safe** | Fully local — API keys and data never leave your machine. Zero data leak risk. |
| 🏗️ | **Build Your AI Empire** | Build your own Harness and Agent from scratch. Full control, fully customizable. |
| 🛠️ | **Fixing the Original's Gaps** | Fixes pi's lack of WebUI and pi-forge's interaction issues. Blazing fast, incredibly smooth. |

---

## Quick Start

```bash
npx huiyu-pi
```

Open `http://localhost:9144` in your browser, go to **Settings → Providers**, enter your API key, and start chatting.

*Also available as global npm install, manual clone, or platform scripts — see [Installation](#installation) below.*

---

## Features

### 🔐 Self-hosted & Private
Your code, API keys, and conversation history stay on your own machine. No cloud, no third party, no data leakage.

### 🧠 Multi-LLM Support
Works with Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter, and more — including local models.

### 📁 Full File Management
Built-in file browser with CodeMirror editor supporting 10+ languages. Create, edit, search files right in the browser.

### 🖥️ Integrated Terminal
Full terminal emulator via xterm.js + WebSocket. Multiple tabs, reconnect support, resizable layout.

### 🔀 Git Integration
View diffs, stage changes at hunk level, explore commit history with git-graph — all from the browser.

### 🔌 MCP Protocol Support
Connect external MCP servers and expose their tools to your coding agent. Supports both global and project-level configurations.

### 📱 Mobile-friendly + PWA
Responsive design works on iOS/Android. Install as a PWA for a native-like experience.

### 🎨 Fully Customizable Theme
Dark and light themes controlled by CSS variables. Create your own skin without rebuilding.

---

## Installation

**Prerequisites:** Node.js ≥ 20 ([download](https://nodejs.org/)). Build tools required for terminal support: install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows), `xcode-select --install` (macOS), or `build-essential` (Linux). The chat and file browser work without build tools — only the terminal tab requires them.

### Option A: npx (no install, runs once)

```bash
npx huiyu-pi
```

Downloads and runs the latest version. Subsequent `npx huiyu-pi` calls use the cached version. To force an update: `npx huiyu-pi@latest`.

### Option B: Global install (faster subsequent launches)

```bash
npm install -g huiyu-pi
huiyu-pi                    # start server
huiyu-pi --help             # show all flags
huiyu-pi --port 4000        # custom port
huiyu-pi --workspace-path ~/Code  # custom workspace
```

To update: `npm update -g huiyu-pi`. To uninstall: `npm uninstall -g huiyu-pi`.

### Option C: Platform scripts (clone + run)

Clone the repo, then run the start script for your platform:

| Platform | Command |
|---|---|
| **Windows** | Double-click `start.bat`, or run in PowerShell: `.\start.bat` |
| **macOS / Linux** | Open Terminal, `cd` into the repo, then `bash start.sh` |

The start script handles everything: `npm install` → build server → build client → start. First run takes a few minutes; subsequent runs are fast.

**LAN access** (share on your local network):

| Platform | Command |
|---|---|
| **Windows** | `.\start-lan.bat` |
| **macOS / Linux** | `bash start-lan.sh` |

Or via flag: `huiyu-pi --host 0.0.0.0`

> ⚠️ **Security:** Binding to `0.0.0.0` exposes the agent's shell and filesystem to **everyone on your network**. Only use on trusted private networks.

### Option D: Manual (development)

```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi
npm install          # install all dependencies (first time may take a few minutes)
npm run dev          # start dev server with HMR (http://localhost:9145)
```

For production builds:

```bash
npm run build        # build server + client
npm run start        # start production server on port 9144
```

### Option E: Docker (recommended for production)

**Pull from registry** (no clone needed):
```bash
docker run -d \
  --name huiyu-pi \
  -p 9144:9144 \
  -v ~/.pi/agent:/home/pi/.pi/agent \
  -v ~/.huiyu-pi:/home/pi/.huiyu-pi \
  -v $(pwd)/workspace:/workspace \
  ghcr.io/huiyu9144/huiyu-pi:latest
```

**Or build locally** (for customization):
```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi/docker
cp .env.example .env
docker compose up -d --build
```

Open `http://localhost:9144` in your browser.

**Custom UID/GID** (fix permission issues on bind mounts):
```bash
docker compose build --build-arg PUID=$(id -u) --build-arg PGID=$(id -g)
docker compose up -d
```

For detailed Docker configuration, see [docker/README.md](docker/README.md).

---

## API Key Setup

Huiyu Pi manages provider API keys through the **Settings UI** and stores them in `~/.pi/agent/auth.json` (shared with the `pi` CLI if installed). Keys are never exposed to the browser — the server holds them in memory and proxies all LLM requests.

### Via Settings UI (Recommended)

1. Open `http://localhost:9144`
2. Go to **Settings → Providers**
3. Select your provider (Anthropic, OpenAI, DeepSeek, etc.)
4. Paste your API key and save

### Supported providers

Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter, and any OpenAI-compatible endpoint (vLLM, LiteLLM, Ollama, etc.).

### Custom OpenAI-compatible providers

For self-hosted or third-party endpoints, create `~/.pi/agent/models.json`:

```json
{
  "custom-gateway": {
    "protocol": "openai",
    "url": "http://localhost:11434/v1",
    "models": ["qwen2.5-coder-32b"]
  }
}
```

Then add the API key in **Settings → Providers → custom-gateway**.

### CLI flag (for scripts / CI)

```bash
huiyu-pi --api-key @/path/to/api-key.txt
```

The `@` prefix reads the key from a file. Useful for CI pipelines and Docker secrets.

---

## Configuration

All settings can be controlled via CLI flags, environment variables, or config files. CLI flags take priority over env vars, which take priority over config files.

### CLI flags

| Flag | Description | Default |
|---|---|---|
| `--port` | Server port | `9144` |
| `--host` | Bind address | `127.0.0.1` |
| `--workspace-path` | Root directory for projects | `~/huiyu-pi-workspace` |
| `--api-key` | Static API key (`@file` syntax supported) | — |
| `--ui-password` | Browser login password | — |
| `--jwt-secret` | JWT signing key (auto-generated if unset) | — |
| `--log-level` | Log level: `fatal` `error` `warn` `info` `debug` `trace` | `info` |
| `--no-expose-docs` | Hide Swagger UI from the browser | docs exposed |
| `--help` | Show all flags | — |

### Environment variables

| Variable | Description |
|---|---|
| `PORT` | Server port |
| `HOST` | Bind address (`0.0.0.0` for LAN) |
| `WORKSPACE_PATH` | Root directory for projects |
| `API_KEY` | Static API key |
| `UI_PASSWORD` | Browser login password |
| `JWT_SECRET` | JWT signing key |
| `LOG_LEVEL` | Log level |
| `EXPOSE_DOCS` | Set to `false` to hide Swagger UI |
| `FORGE_DATA_DIR` | Override state directory (default `~/.huiyu-pi/`) |

### Config files

| File | Purpose |
|---|---|
| `~/.pi/agent/auth.json` | Provider API keys (managed via Settings UI) |
| `~/.pi/agent/settings.json` | Agent settings (model, thinking level, etc.) |
| `~/.pi/agent/models.json` | Custom OpenAI-compatible providers |
| `~/.huiyu-pi/mcp.json` | Global MCP server configuration |

---

## Customization

The theme is controlled by CSS custom properties in `packages/client/src/index.css`:

```css
:root {
  --bg-primary: #0a0a0a;
  --accent: #60A5FA;
}

html[data-theme="light"] {
  --bg-primary: #ffffff;
  --accent: #2563EB;
}
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Zustand, CodeMirror 6 |
| **Backend** | Fastify 5, WebSocket, SSE, JWT |
| **Terminal** | xterm.js + node-pty |
| **Infrastructure** | GitHub Actions CI/CD |

---

## Community

- 💬 [Join our Discord](https://discord.gg/BdJDs4AKbS)
- ⭐ [Star us on GitHub](https://github.com/huiyu9144/Huiyu-Pi)
- 🌐 [Visit our Website](https://www.huiyu.ai)

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Acknowledgments

Built on top of two open-source projects:

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) by [Devin Marks](https://github.com/Devin-Marks) and contributors
- [**pi**](https://github.com/earendil-works/pi) by [earendil-works](https://github.com/earendil-works) and contributors

## Author

Follow the author on X (Twitter): [@huiyu91444](https://x.com/huiyu91444)

## License

[MIT](LICENSE) — see the upstream projects for their licenses:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)

Copyright (c) 2026 Huiyu Pi contributors
Copyright (c) 2026 Devin Marks and pi-forge contributors
Copyright (c) 2026 earendil-works and pi contributors
