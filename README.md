<p align="center">
  <img src="packages/client/public/icons/logo-rounded.png" alt="Huiyu Pi" width="120">
</p>

<h1 align="center">Huiyu Pi</h1>

<p align="center">
  <a href="README.zh.md">🇨🇳 中文说明</a> · <a href="https://www.huiyu.ai">🌐 官网</a>
</p>

<p align="center">
  <b>100% Free · Open Source · Self-Hosted</b><br>
  A local open-source Agent tool that lets you build your own Harness system from scratch.<br>
  Built on Pi and pi-forge — context reduced to near-zero, speed boosted dramatically.<br>
  Build from scratch cleanly without platform restrictions.
</p>

<p align="center">
  <a href="https://discord.gg/BdJDs4AKbS"><img src="https://img.shields.io/discord/1334932402172137576?style=flat-square&logo=discord&logoColor=white&label=Discord&color=5865F2" alt="Discord"></a>
  <a href="https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/stargazers"><img src="https://img.shields.io/github/stars/huiyu9144/Huiyu-PiwebUI-Forge?style=flat-square&logo=github&color=f1c40f&labelColor=555555" alt="GitHub Stars"></a>
  <a href="https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/network/members"><img src="https://img.shields.io/github/forks/huiyu9144/Huiyu-PiwebUI-Forge?style=flat-square&logo=github&color=20B2AA&label=Forks" alt="GitHub Forks"></a>
  <a href="https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/blob/main/LICENSE"><img src="https://img.shields.io/github/license/huiyu9144/Huiyu-PiwebUI-Forge?style=flat-square&color=20B2AA" alt="MIT License"></a>
  <a href="https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/releases"><img src="https://img.shields.io/github/v/release/huiyu9144/Huiyu-PiwebUI-Forge?style=flat-square&color=20B2AA" alt="Release"></a>
  <a href="https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/issues"><img src="https://img.shields.io/github/issues/huiyu9144/Huiyu-PiwebUI-Forge?style=flat-square&color=20B2AA" alt="Issues"></a>
</p>

<p align="center">
  <i>Built on top of <a href="https://github.com/Devin-Marks/pi-forge">pi-forge</a> and <a href="https://github.com/earendil-works/pi">pi</a>.</i>
</p>

<p align="center">
  <img src="docs/images/demo.gif" alt="Huiyu Pi Demo" width="100%">
</p>

---

## Why Choose Huiyu Pi?

Built on pi and pi-forge, fixing their lack of a frontend WebUI and clunky interaction details. It's blazing fast and feels great to use — that's why I'm sharing it.

| | Advantage | Details |
|---|---|---|
| **1** | **Faster Performance** | Default context and prompts compressed from ~20K tokens to near zero. AI response time is dramatically shorter. |
| **2** | **Lower Token Consumption** | Most unused context stripped away, drastically reducing per-request API costs. |
| **3** | **Less Context, More Focus** | Less context = AI stays focused on core instructions for more precise execution. |
| **4** | **Local Deployment = Safe** | Fully local — API keys and data never leave your machine. Zero data leak risk. |
| **5** | **Build Your AI Empire** | Build your own Harness and Agent from scratch. Full control, fully customizable. |
| **6** | **Fixing the Original's Gaps** | Fixes pi's lack of WebUI and pi-forge's interaction issues. Blazing fast, incredibly smooth. |

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

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="docs/images/screenshot-session.jpg" alt="Session Management"></td>
    <td width="50%"><img src="docs/images/screenshot-terminal.jpg" alt="Integrated Terminal"></td>
  </tr>
  <tr>
    <td align="center"><b>Session Management</b></td>
    <td align="center"><b>Integrated Terminal</b></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/images/screenshot-files.png" alt="File Browser + Editor"></td>
    <td width="50%"><img src="docs/images/screenshot-git.jpg" alt="Git Integration"></td>
  </tr>
  <tr>
    <td align="center"><b>File Browser + Editor</b></td>
    <td align="center"><b>Git Integration</b></td>
  </tr>
</table>

---

## Quick Start

### One-click Start (No Install)

```bash
npx huiyu-piwebui-forge
```

Open `http://localhost:9144` in your browser. Configure API keys in **Settings → Providers**.

### Global Install (Faster Subsequent Starts)

```bash
npm install -g huiyu-piwebui-forge
huiyu-piwebui-forge

# Override defaults:
huiyu-piwebui-forge --port 4000 --workspace-path ~/Code
huiyu-piwebui-forge --help       # View all options
```

### Manual Start (Development)

```bash
git clone https://github.com/huiyu9144/Huiyu-PiwebUI-Forge.git
cd Huiyu-PiwebUI-Forge
npm install && cd server && npm install && cd ..
npm run dev:all
```

- Frontend: http://localhost:9144
- Backend: http://localhost:9145

### Windows One-click

Clone the repo, double-click `start.bat` — installs everything and opens your browser.

---

## API Key Setup

Create `~/.pi/agent/auth.json`:

```json
{
  "deepseek": {
    "type": "api_key",
    "key": "sk-your-api-key-here"
  }
}
```

Or set an environment variable:

```bash
# Windows
set DEEPSEEK_API_KEY=sk-your-api-key

# macOS/Linux
export DEEPSEEK_API_KEY=sk-your-api-key
```

**Supported providers:** Anthropic, OpenAI, DeepSeek, Google, Mistral, Groq, xAI, OpenRouter, and more.

---

## Customization

The theme is controlled by CSS custom properties in `src/globals.css`. Override the variables to create your own skin:

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

- 💬 [Join our Discord](https://discord.gg/BdJDs4AKbS) — ask questions, share tips, connect with users and contributors.
- ⭐ [Star us on GitHub](https://github.com/huiyu9144/Huiyu-PiwebUI-Forge) — it helps others discover the project.
- 🌐 [Visit our Website](https://www.huiyu.ai) — learn more about Huiyu Pi.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Acknowledgments

This project is built on top of two open-source projects:

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) by [Devin Marks](https://github.com/Devin-Marks) and contributors — the self-hosted browser UI for the Pi coding agent.
- [**pi**](https://github.com/earendil-works/pi) by [earendil-works](https://github.com/earendil-works) and contributors — the core Pi coding agent SDK and CLI.

## License

[MIT](LICENSE) — see the upstream projects for their licenses:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)
