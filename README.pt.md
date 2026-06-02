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
  <b>Agente de código AI, reduzido ao essencial.</b><br>
  ~80 tokens de prompt do sistema · ~0.3s para o primeiro token · 4 ferramentas básicas · 100% local
</p>

<p align="center" style="max-width:800px;margin:0 auto;color:#64748b;font-size:12px;line-height:1.6;">
  Huiyu Pi WebUI, uma ferramenta local open-source de Agent que permite <b style="color:#00d4aa;">construir seu próprio sistema Harness</b> do zero.
  Construído sobre Pi e pi-forge, em comparação com ferramentas de IDE como Codex e Claude Code,
  <b style="color:#00d4aa;">o contexto é reduzido a quase 0 com melhorias massivas de velocidade</b>.
  Construa de forma limpa, sem restrições de plataforma.
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

## Por que ~80 Tokens?

A maioria das ferramentas de código AI empacota de 15.000 a 28.000 tokens em cada solicitação — regras, definições de ferramentas, prompts de papel, formatação de saída. A IA gasta a maior parte de sua atenção lendo texto padrão em vez de resolver seu problema.

Huiyu Pi adota a abordagem oposta: remova tudo o que não é essencial. 4 ferramentas básicas. Tela limpa. Sem peso.

| | Antes (típico) | Huiyu Pi |
|---|---|---|
| Sobrecarga do prompt do sistema | 15K–28K tokens | **~80 tokens** |
| Resposta do primeiro token | 2–10 segundos | **~0.3 segundos** |
| Custo por solicitação | $0.02–$0.10+ | **90%+ mais barato** |
| Definições de ferramentas | 10–24+ | **4 essenciais** |
| Tipo de cliente | Desktop pesado / Electron | **Web UI pura** |
| Privacidade de dados | Nuvem ou híbrida | **100% local** |

---

## Por que Escolher o Huiyu Pi?

Construído sobre pi e pi-forge, corrigindo a falta de uma WebUI frontend e os detalhes de interação complicados deles. O Huiyu Pi é uma webui baseada em navegador para o agente de código pi — é extremamente rápido e uma ótima experiência de uso — é por isso que estou compartilhando.

| | Vantagem | Detalhes |
|---|---|---|
| ⚡ | **Desempenho Mais Rápido** | Contexto padrão e prompts comprimidos de ~20K tokens para quase zero. O tempo de resposta da IA é drasticamente menor. |
| 💰 | **Menor Consumo de Tokens** | A maioria do contexto não utilizado é removida, reduzindo drasticamente os custos de API por solicitação. |
| 🎯 | **Menos Contexto, Mais Foco** | Menos contexto = a IA mantém o foco nas instruções principais para uma execução mais precisa. |
| 🔒 | **Implantação Local = Seguro** | Totalmente local — chaves de API e dados nunca saem da sua máquina. Risco zero de vazamento de dados. |
| 🏗️ | **Construa Seu Império AI** | Construa seu próprio Harness e Agent do zero. Controle total, totalmente personalizável. |
| 🛠️ | **Corrigindo as Lacunas do Original** | Corrige a falta de WebUI do pi e os problemas de interação do pi-forge. Extremamente rápido, incrivelmente fluido. |

---

## Início Rápido

```bash
npx huiyu-pi
```

Abra `http://localhost:9144` no seu navegador, vá para **Configurações → Providers**, insira sua chave de API e comece a conversar.

*Também disponível como instalação global do npm, clone manual ou scripts de plataforma — veja [Instalação](#instalação) abaixo.*

---

## Funcionalidades

### 🔐 Auto-hospedado & Privado
Seu código, chaves de API e histórico de conversas ficam na sua própria máquina. Sem nuvem, sem terceiros, sem vazamento de dados.

### 🧠 Suporte Multi-LLM
Funciona com Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter e mais — incluindo modelos locais.

### 📁 Gerenciamento Completo de Arquivos
Explorador de arquivos integrado com editor CodeMirror com suporte a mais de 10 idiomas. Crie, edite e pesquise arquivos direto no navegador.

### 🖥️ Terminal Integrado
Emulador de terminal completo via xterm.js + WebSocket. Múltiplas abas, suporte a reconexão, layout redimensionável.

### 🔀 Integração com Git
Visualize diffs, faça stage de alterações no nível de hunk, explore o histórico de commits com git-graph — tudo pelo navegador.

### 🔌 Suporte ao Protocolo MCP
Conecte servidores MCP externos e exponha suas ferramentas ao seu agente de código. Suporta configurações globais e por projeto.

### 📱 Amigável para Dispositivos Móveis + PWA
Design responsivo que funciona em iOS/Android. Instale como PWA para uma experiência nativa.

### 🎨 Tema Totalmente Personalizável
Temas escuro e claro controlados por variáveis CSS. Crie seu próprio tema sem precisar recompilar.

---

## Instalação

**Pré-requisitos:** Node.js ≥ 20 ([download](https://nodejs.org/)). Ferramentas de compilação necessárias para suporte ao terminal: instale o [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows), `xcode-select --install` (macOS) ou `build-essential` (Linux). O chat e o explorador de arquivos funcionam sem ferramentas de compilação — apenas a aba de terminal as requer.

### Opção A: npx (sem instalação, executa uma vez)

```bash
npx huiyu-pi
```

Baixa e executa a versão mais recente. Chamadas subsequentes a `npx huiyu-pi` usam a versão em cache. Para forçar uma atualização: `npx huiyu-pi@latest`.

### Opção B: Instalação global (inicializações subsequentes mais rápidas)

```bash
npm install -g huiyu-pi
huiyu-pi                    # iniciar servidor
huiyu-pi --help             # mostrar todas as opções
huiyu-pi --port 4000        # porta personalizada
huiyu-pi --workspace-path ~/Code  # workspace personalizado
```

Para atualizar: `npm update -g huiyu-pi`. Para desinstalar: `npm uninstall -g huiyu-pi`.

### Opção C: Scripts de plataforma (clone + execute)

Clone o repositório, depois execute o script de inicialização para sua plataforma:

| Plataforma | Comando |
|---|---|
| **Windows** | Clique duas vezes em `start.bat`, ou execute no PowerShell: `.\start.bat` |
| **macOS / Linux** | Abra o Terminal, faça `cd` no repositório, depois `bash start.sh` |

O script de inicialização cuida de tudo: `npm install` → compilar servidor → compilar cliente → iniciar. A primeira execução leva alguns minutos; as subsequentes são rápidas.

**Acesso pela LAN** (compartilhe na sua rede local):

| Plataforma | Comando |
|---|---|
| **Windows** | `.\start-lan.bat` |
| **macOS / Linux** | `bash start-lan.sh` |

Ou via flag: `huiyu-pi --host 0.0.0.0`

> ⚠️ **Segurança:** Vincular ao `0.0.0.0` expõe o shell e o sistema de arquivos do agente para **todos na sua rede**. Use apenas em redes privadas confiáveis.

### Opção D: Manual (desenvolvimento)

```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi
npm install          # instalar todas as dependências (a primeira vez pode levar alguns minutos)
npm run dev          # iniciar servidor de desenvolvimento com HMR (http://localhost:9145)
```

Para builds de produção:

```bash
npm run build        # compilar servidor + cliente
npm run start        # iniciar servidor de produção na porta 9144
```

### Opção E: Docker (recomendado para produção)

**Puxe do registro** (sem necessidade de clone):
```bash
docker run -d \
  --name huiyu-pi \
  -p 9144:9144 \
  -v ~/.pi/agent:/home/pi/.pi/agent \
  -v ~/.huiyu-pi:/home/pi/.huiyu-pi \
  -v $(pwd)/workspace:/workspace \
  ghcr.io/huiyu9144/huiyu-pi:latest
```

**Ou compile localmente** (para personalização):
```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi/docker
cp .env.example .env
docker compose up -d --build
```

Abra `http://localhost:9144` no seu navegador.

**UID/GID personalizado** (corrija problemas de permissão em bind mounts):
```bash
docker compose build --build-arg PUID=$(id -u) --build-arg PGID=$(id -g)
docker compose up -d
```

Para configuração detalhada do Docker, veja [docker/README.md](docker/README.md).

---

## Configuração da Chave de API

O Huiyu Pi gerencia as chaves de API dos providers através da **Interface de Configurações** e as armazena em `~/.pi/agent/auth.json` (compartilhado com o `pi` CLI, se instalado). As chaves nunca são expostas ao navegador — o servidor as mantém em memória e faz proxy de todas as requisições LLM.

### Via Interface de Configurações (Recomendado)

1. Abra `http://localhost:9144`
2. Vá para **Configurações → Providers**
3. Selecione seu provider (Anthropic, OpenAI, DeepSeek, etc.)
4. Cole sua chave de API e salve

### Providers suportados

Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter e qualquer endpoint compatível com OpenAI (vLLM, LiteLLM, Ollama, etc.).

### Providers compatíveis com OpenAI personalizados

Para endpoints auto-hospedados ou de terceiros, crie `~/.pi/agent/models.json`:

```json
{
  "custom-gateway": {
    "protocol": "openai",
    "url": "http://localhost:11434/v1",
    "models": ["qwen2.5-coder-32b"]
  }
}
```

Depois adicione a chave de API em **Configurações → Providers → custom-gateway**.

### Flag CLI (para scripts / CI)

```bash
huiyu-pi --api-key @/caminho/para/api-key.txt
```

O prefixo `@` lê a chave de um arquivo. Útil para pipelines de CI e segredos do Docker.

---

## Configuração

Todas as configurações podem ser controladas via flags CLI, variáveis de ambiente ou arquivos de configuração. Flags CLI têm prioridade sobre variáveis de ambiente, que têm prioridade sobre arquivos de configuração.

### Flags CLI

| Flag | Descrição | Padrão |
|---|---|---|
| `--port` | Porta do servidor | `9144` |
| `--host` | Endereço de vinculação | `127.0.0.1` |
| `--workspace-path` | Diretório raiz para projetos | `~/huiyu-pi-workspace` |
| `--api-key` | Chave de API estática (sintaxe `@file` suportada) | — |
| `--ui-password` | Senha de login no navegador | — |
| `--jwt-secret` | Chave de assinatura JWT (gerada automaticamente se não definida) | — |
| `--log-level` | Nível de log: `fatal` `error` `warn` `info` `debug` `trace` | `info` |
| `--no-expose-docs` | Ocultar Swagger UI do navegador | docs expostos |
| `--help` | Mostrar todas as flags | — |

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor |
| `HOST` | Endereço de vinculação (`0.0.0.0` para LAN) |
| `WORKSPACE_PATH` | Diretório raiz para projetos |
| `API_KEY` | Chave de API estática |
| `UI_PASSWORD` | Senha de login no navegador |
| `JWT_SECRET` | Chave de assinatura JWT |
| `LOG_LEVEL` | Nível de log |
| `EXPOSE_DOCS` | Defina como `false` para ocultar Swagger UI |
| `FORGE_DATA_DIR` | Sobrescrever diretório de estado (padrão `~/.huiyu-pi/`) |

### Arquivos de configuração

| Arquivo | Finalidade |
|---|---|
| `~/.pi/agent/auth.json` | Chaves de API dos providers (gerenciadas via Interface de Configurações) |
| `~/.pi/agent/settings.json` | Configurações do agente (modelo, nível de raciocínio, etc.) |
| `~/.pi/agent/models.json` | Providers compatíveis com OpenAI personalizados |
| `~/.huiyu-pi/mcp.json` | Configuração global do servidor MCP |

---

## Personalização

O tema é controlado por propriedades CSS personalizadas em `packages/client/src/index.css`:

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

## Stack Tecnológica

| Camada | Tecnologias |
|-------|-------------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Zustand, CodeMirror 6 |
| **Backend** | Fastify 5, WebSocket, SSE, JWT |
| **Terminal** | xterm.js + node-pty |
| **Infraestrutura** | GitHub Actions CI/CD |

---

## Comunidade

- 💬 [Junte-se ao nosso Discord](https://discord.gg/BdJDs4AKbS)
- ⭐ [Estrelhe-nos no GitHub](https://github.com/huiyu9144/Huiyu-Pi)
- 🌐 [Visite nosso Site](https://www.huiyu.ai)

---

## Contribuição

Recebemos contribuições! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes.

---

## Agradecimentos

Construído sobre dois projetos open-source:

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) por [Devin Marks](https://github.com/Devin-Marks) e colaboradores
- [**pi**](https://github.com/earendil-works/pi) por [earendil-works](https://github.com/earendil-works) e colaboradores

## Autor

Siga o autor no X (Twitter): [@huiyu91444](https://x.com/huiyu91444)

## Licença

[MIT](LICENSE) — veja os projetos upstream para suas licenças:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)

Copyright (c) 2026 Huiyu Pi contributors
Copyright (c) 2026 Devin Marks and pi-forge contributors
Copyright (c) 2026 earendil-works and pi contributors
