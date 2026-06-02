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
  <b>本質だけに絞り込んだAIコーディングエージェント。</b><br>
  約80トークンのシステムプロンプト · 約0.3秒の最初のトークン · 4つの基本ツール · 100%ローカル
</p>

<p align="center" style="max-width:800px;margin:0 auto;color:#64748b;font-size:12px;line-height:1.6;">
  Huiyu Pi webUIは、<b style="color:#00d4aa;">独自のHarnessシステムをゼロから構築できる</b>ローカルオープンソースのエージェントツールです。
  Piおよびpi-forgeの上に構築され、CodexやClaude CodeといったIDEツールと比較して、
  <b style="color:#00d4aa;">コンテキストをほぼゼロに削減し、大幅な速度向上を実現</b>しています。
  プラットフォームの制限なく、クリーンにビルドしましょう。
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

## なぜ約80トークンなのか？

ほとんどのAIコーディングツールは、リクエストごとに15,000〜28,000トークンを詰め込んでいます。ルール、ツール定義、ロールプロンプト、出力フォーマットなどです。AIはあなたの問題を解決する代わりに、ボイラープレートを読むのに大部分の注意力を費やしています。

Huiyu Piは逆のアプローチを採用しています。本質ではないものをすべて削ぎ落とす。4つの基本ツール。クリーンなキャンバス。無駄な荷物なし。

| | 従来（一般的） | Huiyu Pi |
|---|---|---|
| システムプロンプトのオーバーヘッド | 15K〜28Kトークン | **約80トークン** |
| 最初のトークン応答 | 2〜10秒 | **約0.3秒** |
| リクエストあたりのコスト | $0.02〜$0.10+ | **90%以上安い** |
| ツール定義数 | 10〜24以上 | **4つの必須ツール** |
| クライアント種別 | 重いデスクトップ / Electron | **純粋なWeb UI** |
| データプライバシー | クラウドまたはハイブリッド | **100%ローカル** |

---

## Huiyu Piがおすすめの理由

piおよびpi-forgeの上に構築され、フロントエンドWebUIの欠如や煩雑なインタラクションの不満点を修正しています。Huiyu Piはpiコーディングエージェント向けのブラウザベースWebUIです。驚くほど高速で、使い心地が非常に優れている。だからこそ公開しているのです。

| | 利点 | 詳細 |
|---|---|---|
| ⚡ | **高速なパフォーマンス** | デフォルトのコンテキストとプロンプトが約20Kトークンからほぼゼロに圧縮。AIの応答時間が劇的に短縮されます。 |
| 💰 | **トークン消費量の削減** | 未使用のコンテキストを大部分削除し、リクエストあたりのAPIコストを大幅に削減。 |
| 🎯 | **コンテキスト少、集中度高** | コンテキストが少ない = AIがコアな指示に集中し、より正確な実行が可能。 |
| 🔒 | **ローカルデプロイ = 安全** | 完全ローカル。APIキーやデータがマシンから外に出ることはありません。データ漏洩リスクゼロ。 |
| 🏗️ | **AI帝国を築こう** | 独自のHarnessとエージェントをゼロから構築。完全な制御、完全にカスタマイズ可能。 |
| 🛠️ | **原版の欠点を修正** | piのWebUI欠如とpi-forgeのインタラクション問題を修正。驚くほど高速で、信じられないほどスムーズ。 |

---

## クイックスタート

```bash
npx huiyu-pi
```

ブラウザで `http://localhost:9144` を開き、**設定 → プロバイダー** に移動してAPIキーを入力し、チャットを開始します。

*グローバルnpmインストール、手動クローン、プラットフォームスクリプトでも利用可能です。詳細は以下の[インストール](#インストール)を参照してください。*

---

## 機能

### 🔐 セルフホスト & プライベート
コード、APIキー、会話履歴はすべて自分のマシンに留まります。クラウドもサードパーティもデータ漏洩もありません。

### 🧠 マルチLLM対応
Anthropic Claude、OpenAI GPT/o1/o3、DeepSeek、Google Gemini、Mistral、Groq、xAI、OpenRouterなどに対応。ローカルモデルも利用可能です。

### 📁 完全なファイル管理
10以上の言語をサポートするCodeMirrorエディタ内蔵のファイルブラウザ。ブラウザ上でファイルの作成、編集、検索が可能です。

### 🖥️ 統合ターミナル
xterm.js + WebSocketによる完全なターミナルエミュレータ。複数タブ、再接続サポート、リサイズ可能なレイアウト。

### 🔀 Git統合
差分の表示、ハンクレベルでの変更ステージング、git-graphによるコミット履歴の閲覧。すべてブラウザから操作可能。

### 🔌 MCPプロトコル対応
外部MCPサーバーに接続し、コーディングエージェントにツールを公開。グローバルおよびプロジェクトレベルの設定に対応。

### 📱 モバイル対応 + PWA
レスポンシブデザインでiOS/Androidで動作。PWAとしてインストールすると、ネイティブに近い体験が可能です。

### 🎨 完全カスタマイズ可能なテーマ
ダークテーマとライトテーマをCSS変数で制御。再ビルドせずに独自のスキンを作成可能。

---

## インストール

**前提条件:** Node.js ≥ 20（[ダウンロード](https://nodejs.org/)）。ターミナルサポートにはビルドツールが必要です。[Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)（Windows）、`xcode-select --install`（macOS）、または `build-essential`（Linux）をインストールしてください。チャットとファイルブラウザはビルドツールなしでも動作します。ターミナルタブのみビルドツールが必要です。

### オプションA: npx（インストール不要、1回実行）

```bash
npx huiyu-pi
```

最新版をダウンロードして実行します。以降の `npx huiyu-pi` はキャッシュされたバージョンを使用します。強制的にアップデートする場合: `npx huiyu-pi@latest`。

### オプションB: グローバルインストール（次回以降の起動が高速）

```bash
npm install -g huiyu-pi
huiyu-pi                    # サーバーを起動
huiyu-pi --help             # 全フラグを表示
huiyu-pi --port 4000        # カスタムポート
huiyu-pi --workspace-path ~/Code  # カスタムワークスペース
```

アップデート: `npm update -g huiyu-pi`。アンインストール: `npm uninstall -g huiyu-pi`。

### オプションC: プラットフォームスクリプト（クローン + 実行）

リポジトリをクローンし、使用しているプラットフォームの起動スクリプトを実行します：

| プラットフォーム | コマンド |
|---|---|
| **Windows** | `start.bat` をダブルクリック、またはPowerShellで実行: `.\start.bat` |
| **macOS / Linux** | ターミナルを開き、リポジトリに `cd` し、`bash start.sh` を実行 |

起動スクリプトがすべてを処理します: `npm install` → サーバービルド → クライアントビルド → 起動。初回は数分かかりますが、以降は高速です。

**LANアクセス**（ローカルネットワークで共有）：

| プラットフォーム | コマンド |
|---|---|
| **Windows** | `.\start-lan.bat` |
| **macOS / Linux** | `bash start-lan.sh` |

またはフラグで指定: `huiyu-pi --host 0.0.0.0`

> ⚠️ **セキュリティ:** `0.0.0.0` にバインドすると、エージェントのシェルとファイルシステムが**ネットワーク上のすべてのユーザー**に公開されます。信頼できるプライベートネットワークでのみ使用してください。

### オプションD: 手動（開発用）

```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi
npm install          # すべての依存関係をインストール（初回は数分かかる場合があります）
npm run dev          # HMR付き開発サーバーを起動（http://localhost:9145）
```

本番ビルドの場合：

```bash
npm run build        # サーバー + クライアントをビルド
npm run start        # ポート9144で本番サーバーを起動
```

### オプションE: Docker（本番環境に推奨）

**レジストリからプル**（クローン不要）：
```bash
docker run -d \
  --name huiyu-pi \
  -p 9144:9144 \
  -v ~/.pi/agent:/home/pi/.pi/agent \
  -v ~/.huiyu-pi:/home/pi/.huiyu-pi \
  -v $(pwd)/workspace:/workspace \
  ghcr.io/huiyu9144/huiyu-pi:latest
```

**またはローカルでビルド**（カスタマイズ用）：
```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi/docker
cp .env.example .env
docker compose up -d --build
```

ブラウザで `http://localhost:9144` を開きます。

**カスタムUID/GID**（バインドマウントの権限問題を修正）：
```bash
docker compose build --build-arg PUID=$(id -u) --build-arg PGID=$(id -g)
docker compose up -d
```

Dockerの詳細な設定については [docker/README.md](docker/README.md) を参照してください。

---

## APIキー設定

Huiyu PiはプロバイダーAPIキーを**設定UI**で管理し、`~/.pi/agent/auth.json`（インストール済みの `pi` CLIと共有）に保存します。キーがブラウザに公開されることはありません。サーバーがメモリ上に保持し、すべてのLLMリクエストをプロキシします。

### 設定UIから（推奨）

1. `http://localhost:9144` を開く
2. **設定 → プロバイダー** に移動
3. プロバイダーを選択（Anthropic、OpenAI、DeepSeekなど）
4. APIキーを貼り付けて保存

### 対応プロバイダー

Anthropic Claude、OpenAI GPT/o1/o3、DeepSeek、Google Gemini、Mistral、Groq、xAI、OpenRouter、およびすべてのOpenAI互換エンドポイント（vLLM、LiteLLM、Ollamaなど）。

### カスタムOpenAI互換プロバイダー

セルフホストまたはサードパーティのエンドポイントの場合、`~/.pi/agent/models.json` を作成します：

```json
{
  "custom-gateway": {
    "protocol": "openai",
    "url": "http://localhost:11434/v1",
    "models": ["qwen2.5-coder-32b"]
  }
}
```

次に **設定 → プロバイダー → custom-gateway** でAPIキーを追加します。

### CLIフラグ（スクリプト / CI用）

```bash
huiyu-pi --api-key @/path/to/api-key.txt
```

`@` プレフィックスでファイルからキーを読み取ります。CIパイプラインやDockerシークレットに便利です。

---

## 設定

すべての設定はCLIフラグ、環境変数、または設定ファイルで制御できます。CLIフラグ > 環境変数 > 設定ファイルの順で優先されます。

### CLIフラグ

| フラグ | 説明 | デフォルト |
|---|---|---|
| `--port` | サーバーポート | `9144` |
| `--host` | バインドアドレス | `127.0.0.1` |
| `--workspace-path` | プロジェクトのルートディレクトリ | `~/huiyu-pi-workspace` |
| `--api-key` | 静的APIキー（`@file`構文対応） | — |
| `--ui-password` | ブラウザログインパスワード | — |
| `--jwt-secret` | JWT署名キー（未設定の場合は自動生成） | — |
| `--log-level` | ログレベル: `fatal` `error` `warn` `info` `debug` `trace` | `info` |
| `--no-expose-docs` | ブラウザからSwagger UIを非表示 | docs公開 |
| `--help` | 全フラグを表示 | — |

### 環境変数

| 変数 | 説明 |
|---|---|
| `PORT` | サーバーポート |
| `HOST` | バインドアドレス（LANの場合は `0.0.0.0`） |
| `WORKSPACE_PATH` | プロジェクトのルートディレクトリ |
| `API_KEY` | 静的APIキー |
| `UI_PASSWORD` | ブラウザログインパスワード |
| `JWT_SECRET` | JWT署名キー |
| `LOG_LEVEL` | ログレベル |
| `EXPOSE_DOCS` | `false` に設定でSwagger UIを非表示 |
| `FORGE_DATA_DIR` | ステートディレクトリを上書き（デフォルト `~/.huiyu-pi/`） |

### 設定ファイル

| ファイル | 用途 |
|---|---|
| `~/.pi/agent/auth.json` | プロバイダーAPIキー（設定UIで管理） |
| `~/.pi/agent/settings.json` | エージェント設定（モデル、思考レベルなど） |
| `~/.pi/agent/models.json` | カスタムOpenAI互換プロバイダー |
| `~/.huiyu-pi/mcp.json` | グローバルMCPサーバー設定 |

---

## カスタマイズ

テーマは `packages/client/src/index.css` のCSSカスタムプロパティで制御します：

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

## 技術スタック

| レイヤー | 技術 |
|-------|-------------|
| **フロントエンド** | React 19、TypeScript 6、Vite 8、Tailwind CSS v4、Zustand、CodeMirror 6 |
| **バックエンド** | Fastify 5、WebSocket、SSE、JWT |
| **ターミナル** | xterm.js + node-pty |
| **インフラ** | GitHub Actions CI/CD |

---

## コミュニティ

- 💬 [Discordに参加](https://discord.gg/BdJDs4AKbS)
- ⭐ [GitHubでスターを付ける](https://github.com/huiyu9144/Huiyu-Pi)
- 🌐 [公式サイトにアクセス](https://www.huiyu.ai)

---

## コントリビューション

コントリビューションを歓迎します！ガイドラインは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

---

## 謝辞

以下の2つのオープンソースプロジェクトの上に構築されています：

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) — [Devin Marks](https://github.com/Devin-Marks) およびコントリビューターの皆様
- [**pi**](https://github.com/earendil-works/pi) — [earendil-works](https://github.com/earendil-works) およびコントリビューターの皆様

## 著者

X (Twitter)で著者をフォロー: [@huiyu91444](https://x.com/huiyu91444)

## ライセンス

[MIT](LICENSE) — 上流プロジェクトのライセンスについては以下を参照:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)

Copyright (c) 2026 Huiyu Pi contributors
Copyright (c) 2026 Devin Marks and pi-forge contributors
Copyright (c) 2026 earendil-works and pi contributors
