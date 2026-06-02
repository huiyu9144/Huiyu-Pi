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
  ~80 tokens system prompt &middot; ~0.3s first token &middot; 7 basic tools &middot; 100% local
</p>

<p align="center">
  <img src="https://github.com/huiyu9144/Huiyu-Pi/releases/download/assets/before-after-hd.jpg" alt="Before vs After" width="100%">
</p>

---

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="https://github.com/huiyu9144/Huiyu-Pi/releases/download/assets/screenshot-session.jpg" alt="Session Management"></td>
    <td width="50%"><img src="https://github.com/huiyu9144/Huiyu-Pi/releases/download/assets/screenshot-terminal.jpg" alt="Integrated Terminal"></td>
  </tr>
  <tr>
    <td align="center"><b>Session Management</b></td>
    <td align="center"><b>Integrated Terminal</b></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://github.com/huiyu9144/Huiyu-Pi/releases/download/assets/screenshot-files.png" alt="File Browser + Editor"></td>
    <td width="50%"><img src="https://github.com/huiyu9144/Huiyu-Pi/releases/download/assets/screenshot-git.jpg" alt="Git Integration"></td>
  </tr>
  <tr>
    <td align="center"><b>File Browser + Editor</b></td>
    <td align="center"><b>Git Integration</b></td>
  </tr>
</table>

---

## Quick Start

```bash
npx huiyu-pi
```

Open `http://localhost:9144` in your browser, configure your API key in **Settings → Providers**, and go.

*Also available as global npm install, manual clone, or one-click scripts — see [Installation](#installation) below.*

---

## Why ~80 Tokens?

Most AI coding tools pack 15,000–28,000 tokens into every request — rules, tool definitions, role prompts, output formatting. The AI spends most of its attention reading boilerplate instead of solving your problem.

Huiyu Pi takes the opposite approach: strip everything non-essential. 7 basic tools. Clean canvas. No baggage.

| | Before (typical) | Huiyu Pi |
|---|---|---|
| System prompt overhead | 15K–28K tokens | **~80 tokens** |
| First token response | 2–10 seconds | **~0.3 seconds** |
| Per-request cost | $0.02–$0.10+ | **90%+ cheaper** |
| Tool definitions | 10–24+ | **7 essentials** |
| Client type | Heavy desktop / Electron | **Pure Web UI** |
| Data privacy | Cloud or hybrid | **100% local** |

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

### One-click (no install)

```bash
npx huiyu-pi
```

### Global install (faster subsequent launches)

```bash
npm install -g huiyu-pi
huiyu-pi

# Override defaults via flags:
huiyu-pi --port 4000 --workspace-path ~/Code
huiyu-pi --api-key @/run/secrets/api-key --no-expose-docs
huiyu-pi --help
```

By default Huiyu Pi listens on `http://localhost:9144`, reads provider config from `~/.pi/agent/` (shared with the host pi CLI if you have one), and stores its own state in `~/.huiyu-pi/`.

### Manual (development)

```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi
npm install
npm run dev
```

### Platform one-click scripts
Clone the repo, run `start.bat` (Windows) or `bash start.sh` (macOS/Linux).

### LAN access

```bash
start-lan.bat          # Windows
bash start-lan.sh      # macOS / Linux
```

Or via environment variable / CLI flag:
```bash
HOST=0.0.0.0 huiyu-pi          # npm global install
huiyu-pi --host 0.0.0.0        # CLI flag
```

> **Security note:** Binding to `0.0.0.0` exposes the agent's shell and filesystem to **everyone on your network**. Only enable on trusted private networks.

---

## API Key Setup

**Option 1: Via Settings UI** (Recommended)

Open `http://localhost:9144`, go to **Settings → Providers**, and enter your API key.

**Option 2: Config file**

```json
{
  "deepseek": {
    "type": "api_key",
    "key": "sk-your-api-key-here"
  }
}
```

**Option 3: Environment variable**

```bash
export DEEPSEEK_API_KEY=sk-your-api-key
```

**Option 4: CLI flag**

```bash
huiyu-pi --api-key @/path/to/api-key.txt
```

**Supported providers:** Anthropic, OpenAI, DeepSeek, Google, Mistral, Groq, xAI, OpenRouter, and more.

---

## Customization

The theme is controlled by CSS custom properties in `src/globals.css`:

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
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4, Zustand, CodeMirror 6 |
| **Backend** | Fastify 5, WebSocket, SSE, JWT |
| **Terminal** | xterm.js + node-pty |
| **Infrastructure** | Docker, docker-compose, Kubernetes, GitHub Actions |

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

## License

[MIT](LICENSE) — see the upstream projects for their licenses:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)
