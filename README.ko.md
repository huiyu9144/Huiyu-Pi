<p align="center">
  <img src="packages/client/public/icons/logo-rounded.png" alt="Huiyu Pi" width="120">
</p>

<h1 align="center">Huiyu Pi</h1>

<p align="center"><a href="https://www.huiyu.ai">www.huiyu.ai</a></p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> · <a href="README.zh.md">🇨🇳 中文</a> · <a href="README.ja.md">🇯🇵 日本語</a> · <a href="README.ko.md">🇰🇷 한국어</a> · <a href="README.es.md">🇪🇸 Español</a> · <a href="README.fr.md">🇫🇷 Français</a> · <a href="README.de.md">🇩🇪 Deutsch</a> · <a href="README.pt.md">🇧🇷 Português</a> · <a href="README.ru.md">🇷🇺 Русский</a> · <a href="README.ar.md">🇸🇦 العربية</a>
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
  <b>본질만 남긴 AI 코딩 에이전트.</b><br>
  ~80 토큰 시스템 프롬프트 · ~0.3초 첫 토큰 · 4개 기본 도구 · 100% 로컬
</p>

<p align="center" style="max-width:800px;margin:0 auto;color:#64748b;font-size:12px;line-height:1.6;">
  Huiyu Pi webUI, <b style="color:#00d4aa;">자신만의 Harness 시스템을 처음부터 구축</b>할 수 있는 로컬 오픈소스 에이전트 도구입니다.
  Pi와 pi-forge를 기반으로 빌드되었으며, Codex 및 Claude Code와 같은 IDE 도구에 비해
  <b style="color:#00d4aa;">컨텍스트를 거의 0으로 줄여 엄청난 속도 향상</b>을 제공합니다.
  플랫폼 제한 없이 깔끔하게 빌드하세요.
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

## 왜 ~80 토큰일까요?

대부분의 AI 코딩 도구는 매 요청마다 15,000~28,000 토큰을 쏟아붓습니다 — 규칙, 도구 정의, 역할 프롬프트, 출력 포맷 등. AI는 여러분의 문제를 해결하기보다 보일러플레이트를 읽느라 대부분의 주의력을 소비합니다.

Huiyu Pi는 정반대의 접근법을 취합니다. 불필요한 것을 모두 제거합니다. 4개의 기본 도구. 깔끔한 캔버스. 불필요한 짐 없음.

| | 기존 방식 (일반적) | Huiyu Pi |
|---|---|---|
| 시스템 프롬프트 오버헤드 | 15K~28K 토큰 | **~80 토큰** |
| 첫 토큰 응답 시간 | 2~10초 | **~0.3초** |
| 요청당 비용 | $0.02~$0.10+ | **90%+ 저렴** |
| 도구 정의 | 10~24+개 | **4개 필수 도구** |
| 클라이언트 유형 | 무거운 데스크톱 / Electron | **순수 웹 UI** |
| 데이터 개인정보 | 클라우드 또는 하이브리드 | **100% 로컬** |

---

## 왜 Huiyu Pi를 선택해야 할까요?

Pi와 pi-forge를 기반으로 빌드되었으며, 프론트엔드 WebUI의 부재와 번거로운 인터랙션 디테일을 개선했습니다. Huiyu Pi는 pi 코딩 에이전트를 위한 브라우저 기반 웹 UI입니다 — 엄청나게 빠르고 사용감이 뛰어납니다 — 그래서 공유하고 있습니다.

| | 장점 | 상세 |
|---|---|---|
| ⚡ | **더 빠른 성능** | 기본 컨텍스트와 프롬프트가 ~20K 토큰에서 거의 0으로 압축되었습니다. AI 응답 시간이 눈에 띄게 단축됩니다. |
| 💰 | **낮은 토큰 소비** | 사용되지 않는 컨텍스트를 대부분 제거하여 요청당 API 비용을 크게 절감합니다. |
| 🎯 | **컨텍스트 감소, 집중력 향상** | 컨텍스트가 줄어들면 AI가 핵심 지시에 집중하여 더 정확한 실행이 가능합니다. |
| 🔒 | **로컬 배포 = 안전** | 완전히 로컬에서 동작 — API 키와 데이터가 기기를 떠나지 않습니다. 데이터 유출 위험이 없습니다. |
| 🏗️ | **자신의 AI 왕국을 구축하세요** | 자신만의 Harness와 에이전트를 처음부터 구축할 수 있습니다. 완전한 제어, 완전한 커스터마이징. |
| 🛠️ | **원본의 부족한 부분을 보완** | pi의 WebUI 부재와 pi-forge의 인터랙션 문제를 해결합니다. 엄청나게 빠르고 부드럽게 동작합니다. |

---

## 빠른 시작

```bash
npx huiyu-pi
```

브라우저에서 `http://localhost:9144`를 열고, **설정 → 제공자**로 이동하여 API 키를 입력하면 채팅을 시작할 수 있습니다.

*전역 npm 설치, 수동 클론, 플랫폼별 스크립트로도 사용 가능합니다 — 아래 [설치](#설치)를 참조하세요.*

---

## 기능

### 🔐 셀프호스팅 & 프라이버시
코드, API 키, 대화 기록이 여러분의 컴퓨터에 그대로 남아 있습니다. 클라우드도, 제3자도, 데이터 유출도 없습니다.

### 🧠 다중 LLM 지원
Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter 등 다양한 모델을 지원하며, 로컬 모델도 사용할 수 있습니다.

### 📁 완벽한 파일 관리
CodeMirror 에디터가 내장된 파일 브라우저로 10개 이상의 언어를 지원합니다. 브라우저에서 바로 파일을 생성, 편집, 검색할 수 있습니다.

### 🖥️ 통합 터미널
xterm.js + WebSocket을 통한 완전한 터미널 에му레이터. 여러 탭, 재연결 지원, 크기 조절 가능한 레이아웃.

### 🔀 Git 통합
차이점 비교, 헙 단위 변경 스테이징, git-graph를 통한 커밋 히스토리 탐색 — 모두 브라우저에서 가능합니다.

### 🔌 MCP 프로토콜 지원
외부 MCP 서버에 연결하고 코딩 에이전트에 도구를 노출할 수 있습니다. 전역 및 프로젝트 수준 설정을 모두 지원합니다.

### 📱 모바일 친화적 + PWA
반응형 디자인으로 iOS/Android에서 동작합니다. PWA로 설치하면 네이티브와 같은 경험을 누릴 수 있습니다.

### 🎨 완전한 커스터마이징 테마
CSS 변수로 제어되는 다크 및 라이트 테마. 재빌드 없이 자신만의 스킨을 만들 수 있습니다.

---

## 설치

**사전 요구사항:** Node.js ≥ 20 ([다운로드](https://nodejs.org/)). 터미널 지원을 위해 빌드 도구가 필요합니다: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows), `xcode-select --install` (macOS), 또는 `build-essential` (Linux)를 설치하세요. 채팅과 파일 브라우저는 빌드 도구 없이도 동작합니다 — 터미널 탭에서만 필요합니다.

### 옵션 A: npx (설치 없이 한 번 실행)

```bash
npx huiyu-pi
```

최신 버전을 다운로드하여 실행합니다. 이후 `npx huiyu-pi` 호출은 캐시된 버전을 사용합니다. 강제로 업데이트하려면: `npx huiyu-pi@latest`.

### 옵션 B: 전역 설치 (이후 더 빠른 시작)

```bash
npm install -g huiyu-pi
huiyu-pi                    # 서버 시작
huiyu-pi --help             # 모든 플래그 표시
huiyu-pi --port 4000        # 커스텀 포트
huiyu-pi --workspace-path ~/Code  # 커스텀 워크스페이스
```

업데이트: `npm update -g huiyu-pi`. 제거: `npm uninstall -g huiyu-pi`.

### 옵션 C: 플랫폼 스크립트 (클론 + 실행)

저장소를 클론한 후 사용 중인 플랫폼의 시작 스크립트를 실행하세요:

| 플랫폼 | 명령어 |
|---|---|
| **Windows** | `start.bat`을 더블클릭하거나 PowerShell에서 실행: `.\start.bat` |
| **macOS / Linux** | 터미널을 열고 저장소로 `cd` 한 후 `bash start.sh` |

시작 스크립트가 모든 것을 처리합니다: `npm install` → 서버 빌드 → 클라이언트 빌드 → 시작. 첫 실행은 몇 분이 걸리지만, 이후 실행은 빠릅니다.

**LAN 접근** (로컬 네트워크에서 공유):

| 플랫폼 | 명령어 |
|---|---|
| **Windows** | `.\start-lan.bat` |
| **macOS / Linux** | `bash start-lan.sh` |

또는 플래그를 통해: `huiyu-pi --host 0.0.0.0`

> ⚠️ **보안:** `0.0.0.0`에 바인딩하면 에이전트의 셸과 파일시스템이 **네트워크 내 모든 사람**에게 노출됩니다. 신뢰할 수 있는 비공개 네트워크에서만 사용하세요.

### 옵션 D: 수동 설치 (개발용)

```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi
npm install          # 모든 의존성 설치 (첫 실행 시 몇 분 소요)
npm run dev          # HMR이 포함된 개발 서버 시작 (http://localhost:9145)
```

프로덕션 빌드:

```bash
npm run build        # 서버 + 클라이언트 빌드
npm run start        # 프로덕션 서버를 9144 포트로 시작
```

### 옵션 E: Docker (프로덕션 권장)

**레지스트리에서 가져오기** (클론 불필요):
```bash
docker run -d \
  --name huiyu-pi \
  -p 9144:9144 \
  -v ~/.pi/agent:/home/pi/.pi/agent \
  -v ~/.huiyu-pi:/home/pi/.huiyu-pi \
  -v $(pwd)/workspace:/workspace \
  ghcr.io/huiyu9144/huiyu-pi:latest
```

**또는 로컬에서 빌드** (커스터마이징용):
```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi/docker
cp .env.example .env
docker compose up -d --build
```

브라우저에서 `http://localhost:9144`를 엽니다.

**커스텀 UID/GID** (바인드 마운트 권한 문제 해결):
```bash
docker compose build --build-arg PUID=$(id -u) --build-arg PGID=$(id -g)
docker compose up -d
```

자세한 Docker 설정은 [docker/README.md](docker/README.md)를 참조하세요.

---

## API 키 설정

Huiyu Pi는 **설정 UI**를 통해 제공자 API 키를 관리하며 `~/.pi/agent/auth.json`에 저장합니다 (설치된 경우 `pi` CLI와 공유). 키는 브라우저에 노출되지 않습니다 — 서버가 메모리에 보관하고 모든 LLM 요청을 프록시합니다.

### 설정 UI를 통해 (권장)

1. `http://localhost:9144`를 엽니다
2. **설정 → 제공자**로 이동합니다
3. 제공자를 선택합니다 (Anthropic, OpenAI, DeepSeek 등)
4. API 키를 붙여넣고 저장합니다

### 지원되는 제공자

Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter 및 모든 OpenAI 호환 엔드포인트 (vLLM, LiteLLM, Ollama 등).

### 커스텀 OpenAI 호환 제공자

셀프호스팅 또는 제3자 엔드포인트의 경우, `~/.pi/agent/models.json` 파일을 생성하세요:

```json
{
  "custom-gateway": {
    "protocol": "openai",
    "url": "http://localhost:11434/v1",
    "models": ["qwen2.5-coder-32b"]
  }
}
```

그런 다음 **설정 → 제공자 → custom-gateway**에서 API 키를 추가합니다.

### CLI 플래그 (스크립트 / CI용)

```bash
huiyu-pi --api-key @/path/to/api-key.txt
```

`@` 접두사를 사용하면 파일에서 키를 읽습니다. CI 파이프라인 및 Docker 시크릿에 유용합니다.

---

## 설정

모든 설정은 CLI 플래그, 환경 변수 또는 설정 파일을 통해 제어할 수 있습니다. CLI 플래그가 환경 변수보다 우선하며, 환경 변수가 설정 파일보다 우선합니다.

### CLI 플래그

| 플래그 | 설명 | 기본값 |
|---|---|---|
| `--port` | 서버 포트 | `9144` |
| `--host` | 바인딩 주소 | `127.0.0.1` |
| `--workspace-path` | 프로젝트 루트 디렉터리 | `~/huiyu-pi-workspace` |
| `--api-key` | 정적 API 키 (`@file` 구문 지원) | — |
| `--ui-password` | 브라우저 로그인 비밀번호 | — |
| `--jwt-secret` | JWT 서명 키 (설정하지 않으면 자동 생성) | — |
| `--log-level` | 로그 레벨: `fatal` `error` `warn` `info` `debug` `trace` | `info` |
| `--no-expose-docs` | 브라우저에서 Swagger UI 숨기기 | 문서 노출됨 |
| `--help` | 모든 플래그 표시 | — |

### 환경 변수

| 변수 | 설명 |
|---|---|
| `PORT` | 서버 포트 |
| `HOST` | 바인딩 주소 (LAN용 `0.0.0.0`) |
| `WORKSPACE_PATH` | 프로젝트 루트 디렉터리 |
| `API_KEY` | 정적 API 키 |
| `UI_PASSWORD` | 브라우저 로그인 비밀번호 |
| `JWT_SECRET` | JWT 서명 키 |
| `LOG_LEVEL` | 로그 레벨 |
| `EXPOSE_DOCS` | `false`로 설정하면 Swagger UI 숨김 |
| `FORGE_DATA_DIR` | 상태 디렉터리 오버라이드 (기본값 `~/.huiyu-pi/`) |

### 설정 파일

| 파일 | 용도 |
|---|---|
| `~/.pi/agent/auth.json` | 제공자 API 키 (설정 UI로 관리) |
| `~/.pi/agent/settings.json` | 에이전트 설정 (모델, 사고 수준 등) |
| `~/.pi/agent/models.json` | 커스텀 OpenAI 호환 제공자 |
| `~/.huiyu-pi/mcp.json` | 전역 MCP 서버 설정 |

---

## 커스터마이징

테마는 `packages/client/src/index.css`의 CSS 사용자 정의 속성으로 제어됩니다:

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

## 기술 스택

| 레이어 | 기술 |
|-------|-------------|
| **프론트엔드** | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Zustand, CodeMirror 6 |
| **백엔드** | Fastify 5, WebSocket, SSE, JWT |
| **터미널** | xterm.js + node-pty |
| **인프라** | GitHub Actions CI/CD |

---

## 커뮤니티

- 💬 [Discord에 참여하기](https://discord.gg/BdJDs4AKbS)
- ⭐ [GitHub에서 스타하기](https://github.com/huiyu9144/Huiyu-Pi)
- 🌐 [공식 웹사이트 방문](https://www.huiyu.ai)

---

## 기여

소중한 기여를 환영합니다! 가이드라인은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.

---

## 감사의 글

두 개의 오픈소스 프로젝트를 기반으로 빌드되었습니다:

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) — [Devin Marks](https://github.com/Devin-Marks) 및 기여자들
- [**pi**](https://github.com/earendil-works/pi) — [earendil-works](https://github.com/earendil-works) 및 기여자들

## 저자

X(Twitter)에서 저자를 팔로우하세요: [@huiyu91444](https://x.com/huiyu91444)

## 라이선스

[MIT](LICENSE) — 상위 프로젝트의 라이선스도 확인하세요:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)

Copyright (c) 2026 Huiyu Pi contributors
Copyright (c) 2026 Devin Marks and pi-forge contributors
Copyright (c) 2026 earendil-works and pi contributors