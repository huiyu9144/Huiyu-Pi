<p align="center">
  <img src="packages/client/public/icons/logo-rounded.png" alt="Huiyu Pi" width="120">
</p>

<h1 align="center">Huiyu Pi</h1>

<p align="center">
  <a href="README.md">🇬🇧 English</a> · <a href="https://www.huiyu.ai">🌐 官网</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/系统提示-~80_tokens-00d4aa?style=flat-square" alt="~80 tokens">
  <img src="https://img.shields.io/badge/首字响应-~0.3s-60A5FA?style=flat-square" alt="~0.3s">
  <img src="https://img.shields.io/badge/成本-降低90%25+-00d4aa?style=flat-square" alt="90%+ cheaper">
  <img src="https://img.shields.io/badge/部署-本地-brightgreen?style=flat-square" alt="Local">
  <img src="https://img.shields.io/github/license/huiyu9144/Huiyu-Pi?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/huiyu9144/Huiyu-Pi?style=flat-square" alt="Stars">
  <img src="https://img.shields.io/github/forks/huiyu9144/Huiyu-Pi?style=flat-square" alt="Forks">
  <img src="https://img.shields.io/github/issues/huiyu9144/Huiyu-Pi?style=flat-square" alt="Issues">
  <img src="https://img.shields.io/github/release/huiyu9144/Huiyu-Pi?style=flat-square" alt="Release">
</p>

<p align="center">
  <b>AI 编程助手，极简到极致。</b><br>
  ~80 tokens 系统提示 · ~0.3s 首字响应 · 4 个基础工具 · 100% 本地部署
</p>

<p align="center" style="max-width:800px;margin:0 auto;color:#64748b;font-size:12px;line-height:1.6;">
  Huiyu Pi webUI，一个本地开源的 Agent 工具，让你从零 <b style="color:#00d4aa;">搭建自己的 Harness 系统</b>。
  基于 Pi 和 pi-forge 构建，相比传统 IDE 工具，
  <b style="color:#00d4aa;">上下文减少到接近于 0，速度大幅提升</b>。
  不受平台限制，从零搭建更干净。
</p>

<table>
  <tr>
    <td width="100%"><img src="docs/images/ScreenShot_2026-06-02_161947_814.jpg" alt="Huiyu Pi 截图" width="100%"></td>
  </tr>
  <tr>
    <td width="100%"><img src="docs/images/demo.gif" alt="Huiyu Pi 演示" width="100%"></td>
  </tr>
</table>

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

## 为什么是 ~80 tokens？

传统 AI 编程工具每次请求携带 15,000–28,000 tokens 的系统提示 — 规则、工具定义、角色提示、输出格式……AI 大部分注意力花在阅读说明书上，而不是解决你的问题。

Huiyu Pi 走相反的路线：去掉一切非必要的东西。4 个基础工具。干净的工作台。没有包袱。

| | 传统 AI 工具 | Huiyu Pi |
|---|---|---|
| 系统提示开销 | 15K–28K tokens | **~80 tokens** |
| 首字响应时间 | 2–10 秒 | **~0.3 秒** |
| 每次请求成本 | $0.02–$0.10+ | **降低 90%+** |
| 工具定义数量 | 10–24+ | **4 个基础工具** |
| 客户端类型 | 重型桌面 / Electron | **纯 Web UI** |
| 数据隐私 | 云端或混合 | **100% 本地** |

---

## 为什么选择 Huiyu Pi？

基于 pi 和 pi-forge 打造，弥补它们缺少前台 WebUI 和交互细节体验不足的问题。Huiyu Pi 是 Pi 编码代理的浏览器端 WebUI 前端 — 用起来快得飞起，非常顺手，所以分享给大家。

| | 核心优势 | 详情 |
|---|---|---|
| ⚡ | **性能更快** | 默认上下文及 Prompt 从 ~20K 压缩到接近于 0，仅保留最基础的几个命令。AI 响应时长大幅缩短。 |
| 💰 | **Token 消耗更少** | 去除了绝大多数不常用的上下文，使得每次的 Token 消耗都大幅度降低。 |
| 🎯 | **上下文越少，AI 越专注** | 极少上下文让 AI 聚焦核心指令，执行更精准。 |
| 🔒 | **本地部署安全** | 纯粹本地部署，API Key 和数据永不离机，零泄露风险。 |
| 🏗️ | **从 0 搭建你的 AI 帝国** | 从 0 搭建自己的 Harness 和 Agent，完全自定义，完全掌控。 |
| 🛠️ | **弥补原版不足，体验更丝滑** | 弥补 pi 缺少前台 WebUI 以及 pi-forge 交互细节体验不方便等问题。 |

---

## 快速开始

```bash
npx huiyu-pi
```

在浏览器中打开 `http://localhost:9144`，进入 **设置 → 提供商** 配置 API 密钥即可使用。

*也支持全局 npm 安装、手动克隆、一键脚本 — 详见下方的 [安装方式](#安装方式)。*

---

## 功能特性

### 🔐 自托管 & 隐私安全
你的代码、API 密钥和对话历史都保存在本地机器上。无需云端，无第三方，无数据泄露。

### 🧠 多 LLM 支持
支持 Anthropic Claude、OpenAI GPT/o1/o3、DeepSeek、Google Gemini、Mistral、Groq、xAI、OpenRouter 等 30+ 提供商，包括本地模型。

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

---

## 安装方式

**前置要求：** Node.js ≥ 20（[下载](https://nodejs.org/)）。如需终端功能需安装构建工具：[Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)（Windows）、`xcode-select --install`（macOS）或 `build-essential`（Linux）。聊天和文件浏览无需构建工具也可正常使用。

### 一键启动（无需安装）

```bash
npx huiyu-pi
```

### 全局安装（后续启动更快）

```bash
npm install -g huiyu-pi
huiyu-pi

# 通过参数覆盖默认配置：
huiyu-pi --port 4000 --workspace-path ~/Code
huiyu-pi --api-key @/run/secrets/api-key --no-expose-docs
huiyu-pi --help       # 查看全部参数
```

默认监听 `http://localhost:9144`，从 `~/.pi/agent/` 读取提供商配置（如果安装了 pi CLI 则共享配置），状态数据存储在 `~/.huiyu-pi/`。

### 手动启动（开发模式）

```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi
npm install
npm run dev
```

### 平台一键脚本
克隆仓库，运行 `start.bat`（Windows）或 `bash start.sh`（macOS/Linux）。

### 局域网访问

```bash
start-lan.bat                 # Windows
bash start-lan.sh             # macOS / Linux
```

或通过环境变量 / CLI 参数：
```bash
HOST=0.0.0.0 huiyu-pi          # npm 全局安装
huiyu-pi --host 0.0.0.0        # CLI 参数
```

> **安全提醒：** 绑定 `0.0.0.0` 会将 Agent 的终端和文件系统暴露给 **网络上的所有人**，请仅在可信的私有网络中启用。

### Docker 部署（推荐生产环境使用）

**从镜像仓库拉取**（无需克隆）：
```bash
docker run -d \
  --name huiyu-pi \
  -p 9144:9144 \
  -v ~/.pi/agent:/home/pi/.pi/agent \
  -v ~/.huiyu-pi:/home/pi/.huiyu-pi \
  -v $(pwd)/workspace:/workspace \
  ghcr.io/huiyu9144/huiyu-pi:latest
```

**或本地构建**（适合自定义）：
```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi/docker
cp .env.example .env
docker compose up -d --build
```

打开 `http://localhost:9144` 即可使用。

**自定义 UID/GID**（解决挂载目录权限问题）：
```bash
docker compose build --build-arg PUID=$(id -u) --build-arg PGID=$(id -g)
docker compose up -d
```

详细配置请查看 [docker/README.md](docker/README.md)。

---

## API 密钥配置

Huiyu Pi 通过 **设置界面** 管理提供商 API 密钥，存储在 `~/.pi/agent/auth.json`（如果安装了 pi CLI 则共享配置）。密钥不会暴露给浏览器 — 服务器在内存中持有并通过代理转发所有 LLM 请求。

### 通过设置界面（推荐）

1. 打开 `http://localhost:9144`
2. 进入 **设置 → 提供商**
3. 选择你的提供商（Anthropic、OpenAI、DeepSeek 等）
4. 粘贴 API 密钥并保存

### 支持的提供商

Anthropic Claude、OpenAI GPT/o1/o3、DeepSeek、Google Gemini、Mistral、Groq、xAI、OpenRouter，以及任何 OpenAI 兼容端点（vLLM、LiteLLM、Ollama 等）。

### 自定义 OpenAI 兼容提供商

对于自托管或第三方端点，在 `~/.pi/agent/models.json` 中创建配置：

```json
{
  "custom-gateway": {
    "protocol": "openai",
    "url": "http://localhost:11434/v1",
    "models": ["qwen2.5-coder-32b"]
  }
}
```

然后在 **设置 → 提供商 → custom-gateway** 中添加 API 密钥。

### CLI 参数（适用于脚本 / CI）

```bash
huiyu-pi --api-key @/path/to/api-key.txt
```

`@` 前缀表示从文件读取密钥。适用于 CI 流水线和 Docker secrets。

---

## 配置

所有设置可通过 CLI 参数、环境变量或配置文件控制。优先级：CLI 参数 > 环境变量 > 配置文件。

### CLI 参数

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--port` | 服务器端口 | `9144` |
| `--host` | 绑定地址 | `127.0.0.1` |
| `--workspace-path` | 项目根目录 | `~/huiyu-pi-workspace` |
| `--api-key` | 静态 API 密钥（支持 `@file` 语法） | — |
| `--ui-password` | 浏览器登录密码 | — |
| `--jwt-secret` | JWT 签名密钥（未设置时自动生成） | — |
| `--log-level` | 日志级别：`fatal` `error` `warn` `info` `debug` `trace` | `info` |
| `--no-expose-docs` | 隐藏浏览器中的 Swagger UI | 文档默认暴露 |
| `--help` | 显示所有参数 | — |

### 环境变量

| 变量 | 说明 |
|---|---|
| `PORT` | 服务器端口 |
| `HOST` | 绑定地址（`0.0.0.0` 用于局域网） |
| `WORKSPACE_PATH` | 项目根目录 |
| `API_KEY` | 静态 API 密钥 |
| `UI_PASSWORD` | 浏览器登录密码 |
| `JWT_SECRET` | JWT 签名密钥 |
| `LOG_LEVEL` | 日志级别 |
| `EXPOSE_DOCS` | 设为 `false` 隐藏 Swagger UI |
| `FORGE_DATA_DIR` | 覆盖状态目录（默认 `~/.huiyu-pi/`） |

### 配置文件

| 文件 | 用途 |
|---|---|
| `~/.pi/agent/auth.json` | 提供商 API 密钥（通过设置界面管理） |
| `~/.pi/agent/settings.json` | Agent 设置（模型、思考级别等） |
| `~/.pi/agent/models.json` | 自定义 OpenAI 兼容提供商 |
| `~/.huiyu-pi/mcp.json` | 全局 MCP 服务器配置 |

---

## 自定义主题

主题通过 `packages/client/src/index.css` 中的 CSS 自定义属性控制：

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

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Zustand, CodeMirror 6 |
| **后端** | Fastify 5, WebSocket, SSE, JWT |
| **终端** | xterm.js + node-pty |
| **基础设施** | GitHub Actions CI/CD |

---

## 社区

- 💬 [加入 Discord](https://discord.gg/BdJDs4AKbS)
- ⭐ [在 GitHub 上 Star](https://github.com/huiyu9144/Huiyu-Pi)
- 🌐 [访问官网](https://www.huiyu.ai)

---

## 贡献

欢迎参与贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

---

## 致谢

本项目基于两个开源项目构建：

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) 由 [Devin Marks](https://github.com/Devin-Marks) 和贡献者们开发
- [**pi**](https://github.com/earendil-works/pi) 由 [earendil-works](https://github.com/earendil-works) 和贡献者们开发

## 作者

关注作者的 X (Twitter)：[@huiyu91444](https://x.com/huiyu91444)

## 许可证

[MIT](LICENSE) — 上游项目的许可证：
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)
