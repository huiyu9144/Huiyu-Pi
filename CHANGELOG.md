# Changelog

All notable changes to Huiyu PiwebUI Forge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-05-30

### 🎉 Initial Release

#### Added

- **Core Features**
  - Self-hosted AI coding agent with WebUI
  - Near-zero context architecture for faster responses
  - Multi-LLM support (Anthropic Claude, OpenAI GPT, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter)
  - Local model support

- **Development Environment**
  - Built-in file browser with CodeMirror editor (10+ languages)
  - Integrated terminal via xterm.js + WebSocket
  - Git integration with diff viewer and commit history
  - MCP protocol support for external tool connections

- **User Experience**
  - Responsive design for mobile and desktop
  - PWA support for native-like experience
  - Dark and light themes with CSS variables
  - Customizable skins without rebuilding

- **Infrastructure**
  - Docker and docker-compose support
  - Kubernetes and OpenShift deployment manifests
  - GitHub Actions CI/CD
  - One-click Windows startup script (start.bat)

- **Security**
  - API keys stored locally (never transmitted)
  - JWT authentication
  - Password hashing with scrypt
  - Constant-time comparison for secrets

- **Internationalization**
  - English and Chinese README
  - Bilingual UI support

#### Built On

- [pi-forge](https://github.com/Devin-Marks/pi-forge) - Self-hosted browser UI for Pi coding agent
- [pi](https://github.com/earendil-works/pi) - Core Pi coding agent SDK and CLI

---

## [Unreleased]

### Planned

- [ ] Voice input support
- [ ] Plugin marketplace
- [ ] Collaborative editing
- [ ] Custom theme editor
- [ ] More LLM provider integrations
- [ ] Performance optimizations
- [ ] Additional language support
