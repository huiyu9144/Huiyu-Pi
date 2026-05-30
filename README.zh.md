<p align="center">
  <img src="packages/client/public/icons/logo-rounded.png" alt="Huiyu PiwebUI Forge" width="120">
</p>

<h1 align="center">Huiyu PiwebUI Forge</h1>

<p align="center">
  <a href="README.md">🇬🇧 English</a>
</p>

<p align="center">
  一个本地开源的 Agent 工具，可以从 0 搭建自己的 Harness 系统。基于 Pi 和 pi-forge 的 WebUI，相比 Codex 及 Claude Code 等 IDE 工具，上下文减少到接近 0，速度提升巨大，从 0 搭建更加干净无需受限于平台。
</p>

<p align="center">
  <a href="https://discord.gg/BdJDs4AKbS"><img src="https://img.shields.io/discord/1334932402172137576?style=flat-square&logo=discord&logoColor=white&label=Discord&color=5865F2" alt="Discord"></a>
  <a href="https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/stargazers"><img src="https://img.shields.io/github/stars/huiyu9144/Huiyu-PiwebUI-Forge?style=flat-square&logo=github&color=f1c40f&labelColor=555555" alt="GitHub Stars"></a>
  <a href="https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-20B2AA?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/releases"><img src="https://img.shields.io/github/v/release/huiyu9144/Huiyu-PiwebUI-Forge?style=flat-square&color=blue" alt="Release"></a>
</p>

<p align="center">
  <i>基于 <a href="https://github.com/Devin-Marks/pi-forge">pi-forge</a> 和 <a href="https://github.com/earendil-works/pi">pi</a> 构建。</i>
</p>

<p align="center">
  <img src="docs/images/demo.gif" alt="Huiyu PiwebUI Forge 演示" width="100%">
</p>

<table>
  <tr>
    <td width="50%"><img src="docs/images/screenshot-session.jpg" alt="会话管理"></td>
    <td width="50%"><img src="docs/images/screenshot-terminal.jpg" alt="集成终端"></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/images/screenshot-files.png" alt="文件浏览器 + 编辑器"></td>
    <td width="50%"><img src="docs/images/screenshot-git.jpg" alt="Git 集成"></td>
  </tr>
</table>

---

## 功能特性

### 🔐 自托管 & 隐私安全
你的代码、API 密钥和对话历史都保存在本地机器上。无需云端，无第三方，无数据泄露。

### 🧠 多 LLM 支持
支持 Anthropic Claude、OpenAI GPT/o1/o3、DeepSeek、Google Gemini、Mistral、Groq、xAI、OpenRouter 等，包括本地模型。

### 📁 完整文件管理
内置文件浏览器和 CodeMirror 编辑器，支持 10+ 种编程语言。直接在浏览器中创建、编辑、搜索文件。

### 🖥️ 集成终端
通过 xterm.js + WebSocket 实现完整终端模拟器。多标签页、断线重连、可调整布局。

### 🔀 Git 集成
查看差异、按 hunk 级别暂存更改、通过 git-graph 浏览提交历史 — 全部在浏览器中完成。

### 🔌 MCP 协议支持
连接外部 MCP 服务器并将其工具暴露给你的编程 Agent。支持全局和项目级别配置。

### 📱 移动端友好 + PWA
响应式设计，支持 iOS/Android。可安装为 PWA，获得原生应用体验。

### 🎨 完全可定制主题
通过 CSS 变量控制深色和浅色主题。无需重新构建即可创建自己的皮肤。

### 📦 Docker & K8s 就绪
包含 Dockerfile、docker-compose、Kubernetes 和 OpenShift 部署清单。

---

## 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 18+
- 支持的提供商的 API 密钥（Anthropic、OpenAI、DeepSeek、Google 等）

### 一键启动 (Windows)

克隆仓库，双击 `start.bat` — 脚本会安装所有依赖并在浏览器中打开 `http://localhost:9144`。

### 手动启动

```bash
git clone https://github.com/huiyu9144/Huiyu-PiwebUI-Forge.git
cd Huiyu-PiwebUI-Forge
npm install && cd server && npm install && cd ..
npm run dev:all
```

- 前端: http://localhost:9144
- 后端: http://localhost:9145

### API 密钥配置

创建 `~/.pi/agent/auth.json`:

```json
{
  "deepseek": {
    "type": "api_key",
    "key": "sk-your-api-key-here"
  }
}
```

或设置环境变量:

```bash
# Windows
set DEEPSEEK_API_KEY=sk-your-api-key

# macOS/Linux
export DEEPSEEK_API_KEY=sk-your-api-key
```

**支持的提供商:** Anthropic、OpenAI、DeepSeek、Google、Mistral、Groq、xAI、OpenRouter 等。

---

## 自定义主题

主题通过 `src/globals.css` 中的 CSS 自定义属性控制。覆盖变量即可创建自己的皮肤:

```css
:root {
  --bg-primary: #0a0a0a;
  --accent: #60A5FA;
  /* ... */
}

html[data-theme="light"] {
  --bg-primary: #ffffff;
  --accent: #2563EB;
  /* ... */
}
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19, TypeScript, Vite 6, Tailwind CSS v4, Zustand, CodeMirror 6 |
| **后端** | Fastify 5, WebSocket, SSE, JWT |
| **终端** | xterm.js + node-pty |
| **基础设施** | Docker, docker-compose, Kubernetes, GitHub Actions |

---

## 社区

- 💬 [加入 Discord](https://discord.gg/BdJDs4AKbS) — 提问、分享技巧、与用户和贡献者交流。
- ⭐ [在 GitHub 上 Star](https://github.com/huiyu9144/Huiyu-PiwebUI-Forge) — 帮助更多人发现这个项目。

---

## 致谢

本项目基于两个开源项目构建:

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) 由 [Devin Marks](https://github.com/Devin-Marks) 和贡献者们开发 — Pi 编程 Agent 的自托管浏览器 UI。
- [**pi**](https://github.com/earendil-works/pi) 由 [earendil-works](https://github.com/earendil-works) 和贡献者们开发 — Pi 编程 Agent 的核心 SDK 和 CLI。

## 许可证

[MIT](LICENSE) — 上游项目的许可证:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)
