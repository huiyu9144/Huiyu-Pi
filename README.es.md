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
  <b>Agente de IA para código, reducido a lo esencial.</b><br>
  ~80 tokens en el system prompt · ~0.3s primer token · 4 herramientas básicas · 100% local
</p>

<p align="center" style="max-width:800px;margin:0 auto;color:#64748b;font-size:12px;line-height:1.6;">
  Huiyu Pi webUI, una herramienta local y de código abierto tipo Agente que te permite <b style="color:#00d4aa;">construir tu propio sistema Harness</b> desde cero.
  Construido sobre Pi y pi-forge, comparado con herramientas de IDE como Codex y Claude Code,
  <b style="color:#00d4aa;">el contexto se reduce a casi 0 con mejoras masivas de velocidad</b>.
  Desarrolla de forma limpia sin restricciones de plataforma.
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

## ¿Por qué ~80 tokens?

La mayoría de las herramientas de IA para código incluyen entre 15,000 y 28,000 tokens en cada solicitud: reglas, definiciones de herramientas, prompts de roles, formato de salida. La IA gasta la mayor parte de su atención leyendo textos genéricos en lugar de resolver tu problema.

Huiyu Pi adopta el enfoque opuesto: elimina todo lo no esencial. 4 herramientas básicas. Un lienzo limpio. Sin carga innecesaria.

| | Antes (típico) | Huiyu Pi |
|---|---|---|
| Sobrecarga del system prompt | 15K–28K tokens | **~80 tokens** |
| Tiempo de respuesta del primer token | 2–10 segundos | **~0.3 segundos** |
| Costo por solicitud | $0.02–$0.10+ | **90%+ más barato** |
| Definiciones de herramientas | 10–24+ | **4 esenciales** |
| Tipo de cliente | Escritorio pesado / Electron | **Interfaz web pura** |
| Privacidad de datos | Nube o híbrido | **100% local** |

---

## ¿Por qué elegir Huiyu Pi?

Construido sobre pi y pi-forge, corrigiendo la falta de una interfaz web y los detalles de interacción complicados que estos tenían. Huiyu Pi es una interfaz web basada en navegador para el agente de código pi: es extremadamente rápida y se siente genial de usar. Por eso la estoy compartiendo.

| | Ventaja | Detalles |
|---|---|---|
| ⚡ | **Rendimiento más rápido** | El contexto por defecto y los prompts se comprimieron de ~20K tokens a casi cero. El tiempo de respuesta de la IA es drásticamente más corto. |
| 💰 | **Menor consumo de tokens** | La mayoría del contexto no utilizado se eliminó, reduciendo drásticamente los costos de API por solicitud. |
| 🎯 | **Menos contexto, más enfoque** | Menos contexto = la IA se mantiene enfocada en las instrucciones principales para una ejecución más precisa. |
| 🔒 | **Despliegue local = Seguro** | Completamente local: las claves de API y los datos nunca salen de tu máquina. Cero riesgo de filtración de datos. |
| 🏗️ | **Construye tu imperio de IA** | Construye tu propio Harness y Agente desde cero. Control total, completamente personalizable. |
| 🛠️ | **Corrigiendo las carencias del original** | Soluciona la falta de WebUI de pi y los problemas de interacción de pi-forge. Extremadamente rápido, increíblemente fluido. |

---

## Inicio rápido

```bash
npx huiyu-pi
```

Abre `http://localhost:9144` en tu navegador, ve a **Settings → Providers**, ingresa tu clave de API y empieza a chatear.

*También disponible como instalación global de npm, clonación manual o scripts de plataforma — consulta [Instalación](#instalación) más abajo.*

---

## Características

### 🔐 Autoalojado y privado
Tu código, claves de API e historial de conversaciones permanecen en tu propia máquina. Sin nube, sin terceros, sin filtración de datos.

### 🧠 Soporte multi-LLM
Funciona con Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter y más, incluyendo modelos locales.

### 📁 Gestión completa de archivos
Explorador de archivos integrado con editor CodeMirror que admite más de 10 lenguajes. Crea, edita y busca archivos directamente en el navegador.

### 🖥️ Terminal integrado
Emulador de terminal completo a través de xterm.js + WebSocket. Múltiples pestañas, soporte de reconexión, diseño redimensionable.

### 🔀 Integración con Git
Visualiza diferencias, prepara cambios a nivel de fragmento, explora el historial de commits con git-graph, todo desde el navegador.

### 🔌 Soporte de protocolo MCP
Conecta servidores MCP externos y expone sus herramientas a tu agente de código. Admite configuraciones tanto globales como a nivel de proyecto.

### 📱 Compatible con móviles + PWA
Diseño receptivo que funciona en iOS/Android. Instálalo como PWA para una experiencia similar a una app nativa.

### 🎨 Tema completamente personalizable
Temas oscuro y claro controlados por variables CSS. Crea tu propio estilo sin necesidad de recompilar.

---

## Instalación

**Requisitos previos:** Node.js ≥ 20 ([descargar](https://nodejs.org/)). Se requieren herramientas de compilación para el soporte de terminal: instala [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows), `xcode-select --install` (macOS) o `build-essential` (Linux). El chat y el explorador de archivos funcionan sin herramientas de compilación, solo la pestaña de terminal las necesita.

### Opción A: npx (sin instalación, ejecución única)

```bash
npx huiyu-pi
```

Descarga y ejecuta la versión más reciente. Las llamadas posteriores a `npx huiyu-pi` usan la versión en caché. Para forzar una actualización: `npx huiyu-pi@latest`.

### Opción B: Instalación global (lanzamientos más rápidos)

```bash
npm install -g huiyu-pi
huiyu-pi                    # iniciar servidor
huiyu-pi --help             # mostrar todas las opciones
huiyu-pi --port 4000        # puerto personalizado
huiyu-pi --workspace-path ~/Code  # espacio de trabajo personalizado
```

Para actualizar: `npm update -g huiyu-pi`. Para desinstalar: `npm uninstall -g huiyu-pi`.

### Opción C: Scripts de plataforma (clonar + ejecutar)

Clona el repositorio y luego ejecuta el script de inicio para tu plataforma:

| Plataforma | Comando |
|---|---|
| **Windows** | Haz doble clic en `start.bat`, o ejecuta en PowerShell: `.\start.bat` |
| **macOS / Linux** | Abre Terminal, ejecuta `cd` en el repositorio y luego `bash start.sh` |

El script de inicio se encarga de todo: `npm install` → compilar servidor → compilar cliente → iniciar. La primera ejecución tarda unos minutos; las siguientes son rápidas.

**Acceso en LAN** (compartir en tu red local):

| Plataforma | Comando |
|---|---|
| **Windows** | `.\start-lan.bat` |
| **macOS / Linux** | `bash start-lan.sh` |

O mediante opción: `huiyu-pi --host 0.0.0.0`

> ⚠️ **Seguridad:** Vincular a `0.0.0.0` expone la shell y el sistema de archivos del agente a **todos en tu red**. Solo úsalo en redes privadas de confianza.

### Opción D: Manual (desarrollo)

```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi
npm install          # instalar todas las dependencias (la primera vez puede tardar unos minutos)
npm run dev          # iniciar servidor de desarrollo con HMR (http://localhost:9145)
```

Para compilaciones de producción:

```bash
npm run build        # compilar servidor + cliente
npm run start        # iniciar servidor de producción en el puerto 9144
```

### Opción E: Docker (recomendado para producción)

**Descargar del registro** (no se necesita clonar):
```bash
docker run -d \
  --name huiyu-pi \
  -p 9144:9144 \
  -v ~/.pi/agent:/home/pi/.pi/agent \
  -v ~/.huiyu-pi:/home/pi/.huiyu-pi \
  -v $(pwd)/workspace:/workspace \
  ghcr.io/huiyu9144/huiyu-pi:latest
```

**O compilar localmente** (para personalización):
```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi/docker
cp .env.example .env
docker compose up -d --build
```

Abre `http://localhost:9144` en tu navegador.

**UID/GID personalizado** (para resolver problemas de permisos en montajes vinculados):
```bash
docker compose build --build-arg PUID=$(id -u) --build-arg PGID=$(id -g)
docker compose up -d
```

Para una configuración detallada de Docker, consulta [docker/README.md](docker/README.md).

---

## Configuración de clave de API

Huiyu Pi gestiona las claves de API de los proveedores a través de la **interfaz de configuración** y las almacena en `~/.pi/agent/auth.json` (compartido con el CLI de `pi` si está instalado). Las claves nunca se exponen al navegador, el servidor las mantiene en memoria y sirve como proxy para todas las solicitudes LLM.

### A través de la interfaz de configuración (Recomendado)

1. Abre `http://localhost:9144`
2. Ve a **Settings → Providers**
3. Selecciona tu proveedor (Anthropic, OpenAI, DeepSeek, etc.)
4. Pega tu clave de API y guarda

### Proveedores compatibles

Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter y cualquier endpoint compatible con OpenAI (vLLM, LiteLLM, Ollama, etc.).

### Proveedores personalizados compatibles con OpenAI

Para endpoints autoalojados o de terceros, crea `~/.pi/agent/models.json`:

```json
{
  "custom-gateway": {
    "protocol": "openai",
    "url": "http://localhost:11434/v1",
    "models": ["qwen2.5-coder-32b"]
  }
}
```

Luego agrega la clave de API en **Settings → Providers → custom-gateway**.

### Opción de CLI (para scripts / CI)

```bash
huiyu-pi --api-key @/path/to/api-key.txt
```

El prefijo `@` lee la clave desde un archivo. Útil para tuberías de CI y secretos de Docker.

---

## Configuración

Todas las opciones se pueden controlar mediante banderas de CLI, variables de entorno o archivos de configuración. Las banderas de CLI tienen prioridad sobre las variables de entorno, que a su vez tienen prioridad sobre los archivos de configuración.

### Banderas de CLI

| Bandera | Descripción | Valor por defecto |
|---|---|---|
| `--port` | Puerto del servidor | `9144` |
| `--host` | Dirección de vinculación | `127.0.0.1` |
| `--workspace-path` | Directorio raíz para proyectos | `~/huiyu-pi-workspace` |
| `--api-key` | Clave de API estática (se admite sintaxis `@file`) | — |
| `--ui-password` | Contraseña de inicio de sesión en el navegador | — |
| `--jwt-secret` | Clave de firma JWT (se genera automáticamente si no se establece) | — |
| `--log-level` | Nivel de registro: `fatal` `error` `warn` `info` `debug` `trace` | `info` |
| `--no-expose-docs` | Ocultar Swagger UI del navegador | docs expuestos |
| `--help` | Mostrar todas las banderas | — |

### Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor |
| `HOST` | Dirección de vinculación (`0.0.0.0` para LAN) |
| `WORKSPACE_PATH` | Directorio raíz para proyectos |
| `API_KEY` | Clave de API estática |
| `UI_PASSWORD` | Contraseña de inicio de sesión en el navegador |
| `JWT_SECRET` | Clave de firma JWT |
| `LOG_LEVEL` | Nivel de registro |
| `EXPOSE_DOCS` | Establecer en `false` para ocultar Swagger UI |
| `FORGE_DATA_DIR` | Sobrescribir directorio de estado (por defecto `~/.huiyu-pi/`) |

### Archivos de configuración

| Archivo | Propósito |
|---|---|
| `~/.pi/agent/auth.json` | Claves de API de proveedores (gestionadas a través de la interfaz de configuración) |
| `~/.pi/agent/settings.json` | Configuración del agente (modelo, nivel de razonamiento, etc.) |
| `~/.pi/agent/models.json` | Proveedores personalizados compatibles con OpenAI |
| `~/.huiyu-pi/mcp.json` | Configuración global del servidor MCP |

---

## Personalización

El tema se controla mediante propiedades CSS personalizadas en `packages/client/src/index.css`:

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

## Stack tecnológico

| Capa | Tecnologías |
|-------|-------------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Zustand, CodeMirror 6 |
| **Backend** | Fastify 5, WebSocket, SSE, JWT |
| **Terminal** | xterm.js + node-pty |
| **Infraestructura** | GitHub Actions CI/CD |

---

## Comunidad

- 💬 [Únete a nuestro Discord](https://discord.gg/BdJDs4AKbS)
- ⭐ [Danos una estrella en GitHub](https://github.com/huiyu9144/Huiyu-Pi)
- 🌐 [Visita nuestro sitio web](https://www.huiyu.ai)

---

## Contribuir

¡Bienvenimos las contribuciones! Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para las directrices.

---

## Agradecimientos

Construido sobre dos proyectos de código abierto:

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) por [Devin Marks](https://github.com/Devin-Marks) y colaboradores
- [**pi**](https://github.com/earendil-works/pi) por [earendil-works](https://github.com/earendil-works) y colaboradores

## Autor

Sigue al autor en X (Twitter): [@huiyu91444](https://x.com/huiyu91444)

## Licencia

[MIT](LICENSE) — consulta las licencias de los proyectos originales:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)

Copyright (c) 2026 Huiyu Pi contributors
Copyright (c) 2026 Devin Marks and pi-forge contributors
Copyright (c) 2026 earendil-works and pi contributors
