# Changelog

All notable changes to Huiyu Pi will be documented in this file.

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

## [1.4.0] - 2026-06-02

### ✨ New Features

- **Redesigned README**: Completely rewritten with concise marketing copy (EN/CN), badge-style stats, before/after comparison table, "Why ~80 Tokens?" and "Why Choose Huiyu Pi?" sections
- **Added compare-v2.html**: Interactive animated comparison page with contextual before/after animations
- **Promo GIF generation pipeline**: 10 animated bar-chart GIFs (30fps) for social media promotion
- **Project picker UX overhaul**: Empty-state redesign, double-click behavior, auto-close improvements
- **File browser enhancements**: Refresh-triggering in file search, New File option in create menu
- **Diff viewer improvements**: TurnDiffPanel sticky header, ProjectPicker modal streamlining
- **Cross-platform scripts**: Enhanced start.bat, start.sh, start-lan.bat, start-lan.sh for Windows/macOS/Linux

### 🎨 UI Improvements

- Updated FileBrowserPanel, ProjectPicker, TurnDiffPanel UI components
- compare-v2.html: brand names anonymized (Codex → Main AI Tools)
- Fixed icon/logo path resolution for local serving

### 🔧 Changes

- Simplified brand identity in comparison page (anonymized competitor names)
- Reduced images/ from .gitignore for README asset delivery
- Replaced broken release-asset image URLs with relative paths
- Screenshot + demo GIF stacked vertically in README for visual preview
- Prerequisites merged into Installation section

### 🐛 Bug Fixes

- Fixed broken logo icon path in compare-v2.html (absolute → relative)
- Fixed ChatView placeholder not working in empty sessions
- Fixed broken image URLs in README (switched from release assets to relative paths)

## [1.2.0] - 2025-05-31

### ✨ New Features

- **Voice Input with Auto-Punctuation**
  - Browser Web Speech API voice recognition for Chinese, English, Japanese, and Korean
  - Real-time speech-to-text with interim result display
  - Automatic comma insertion on pause detection (800ms silence threshold)
  - Sentence-ending punctuation auto-completion (。 . ? ？ etc.)
  - Spoken punctuation recognition (逗号→，句号→。空格→ 等)
  - No duplicate text accumulation on stop

### 🎨 Rebrand

- Full rebrand from pi-forge to **Huiyu Pi**
- npm scope renamed from `@pi-forge` to `@huiyu-pi`
- Updated all docs, README, and deployment manifests
- New logo icon and brand name in empty project state
- All Docker images now publish to `ghcr.io/huiyu9144/huiyu-pi`

### 🐛 Bug Fixes

- **UI Layout**
  - Fix bubble alignment: Thinking/ToolCall/Assistant messages left-aligned consistently
  - Double files panel default width for better file tree readability
  - Double editor default width to 960px
  - Optimize panel drag with requestAnimationFrame
  - Fix left padding in ToolCallEntry and Thinking components
  - Fix text-neutral-100 brand name visibility across all themes

- **File System**
  - Strip leading slash from file read paths to prevent 403 errors
  - Add `.gitattributes` with correct binary handling for `.ico` files

- **Session & Connection**
  - Skip restoring tabs with paths outside project root
  - Delay reconnection banner until 3rd attempt to reduce noise

- **PWA**
  - Disable service worker caching for `sw.js` to prevent stale install prompt

### 📝 Documentation & SEO

- Improved SEO for 'pi webui' search discoverability
- Added comprehensive SEO keywords (huiyu, piweb, harness, agent, etc.)
- Updated title to 'WebUI for the Pi Harness Agent'
- Moved screenshots above "Why Choose" section in README
- Added Chinese and English promotional documentation

### ♻️ Refactor

- ChangedFilesBadge moved into assistant message bubble footer
- Removed standalone ChangedFilesBadge component
- Layout version migration system for future UI state migrations
