<p align="center">
  <img src="packages/client/public/icons/logo-rounded.png" alt="Huiyu Pi" width="120">
</p>

<h1 align="center">Huiyu Pi</h1>

<p align="center">
  <a href="README.md">🇺🇸 English</a> · <a href="README.zh.md">🇨🇳 中文</a> · <a href="README.ja.md">🇯🇵 日本語</a> · <a href="README.ko.md">🇰🇷 한국어</a> · <a href="README.es.md">🇪🇸 Español</a> · <a href="README.fr.md">🇫🇷 Français</a> · <a href="README.de.md">🇩🇪 Deutsch</a> · <a href="README.pt.md">🇧🇷 Português</a> · <a href="README.ru.md">🇷🇺 Русский</a> · <a href="README.ar.md">🇸🇦 العربية</a> · <a href="https://www.huiyu.ai">🌐 Сайт</a>
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
  <b>AI-агент для программирования, сведённый к минимуму.</b><br>
  ~80 токенов системный промпт · ~0.3 с первый токен · 4 базовых инструмента · 100% локально
</p>

<p align="center" style="max-width:800px;margin:0 auto;color:#64748b;font-size:12px;line-height:1.6;">
  Веб-интерфейс Huiyu Pi — локальный инструмент с открытым кодом, который позволяет <b style="color:#00d4aa;">создать собственную Harness-систему</b> с нуля.
  Построен на Pi и pi-forge, по сравнению с IDE-инструментами вроде Codex и Claude Code,
  <b style="color:#00d4aa;">контекст сведён почти к нулю, а скорость работы значительно выросла</b>.
  Разрабатывайте без ограничений платформы.
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

## Почему ~80 токенов?

Большинство AI-инструментов для программирования загоняют в каждый запрос 15 000–28 000 токенов — правила, определения инструментов, ролевые промпты, форматирование вывода. AI тратит большую часть внимания на чтение шаблонного контента вместо решения вашей задачи.

Huiyu Pi идёт противоположным путём: убирает всё лишнее. 4 базовых инструмента. Чистое поле. Без балласта.

| | Ранее (типично) | Huiyu Pi |
|---|---|---|
| Нагрузка системного промпта | 15K–28K токенов | **~80 токенов** |
| Ответ первого токена | 2–10 секунд | **~0.3 секунды** |
| Стоимость запроса | $0.02–$0.10+ | **Дешевле на 90%+** |
| Определения инструментов | 10–24+ | **4 базовых** |
| Тип клиентского приложения | Тяжёлый десктоп / Electron | **Чистый веб-интерфейс** |
| Конфиденциальность данных | Облако или гибрид | **100% локально** |

---

## Почему стоит выбрать Huiyu Pi?

Построен на pi и pi-forge, исправляя их отсутствие веб-интерфейса и неудобные детали взаимодействия. Huiyu Pi — это браузерный веб-интерфейс для PI coding-агента: он невероятно быстр и приятен в использовании — именно поэтому я делюсь им.

| | Преимущество | Подробности |
|---|---|---|
| ⚡ | **Более высокая производительность** | Контекст и промпты по умолчанию сжаты с ~20K токенов до минимума. Время отклика AI значительно сократилось. |
| 💰 | **Меньшее потребление токенов** | Большая часть неиспользуемого контекста удалена, что значительно снижает стоимость API за запрос. |
| 🎯 | **Меньше контекста — больше фокуса** | Меньше контекста = AI остаётся сосредоточенным на ключевых инструкциях для более точного выполнения. |
| 🔒 | **Локальная установка = безопасность** | Полностью локально — ключи API и данные никогда не покидают ваш компьютер. Нулевой риск утечки данных. |
| 🏗️ | **Создайте свою AI-империю** | Создайте собственную Harness-систему и агента с нуля. Полный контроль, полная настройка. |
| 🛠️ | **Исправление недостатков оригинала** | Исправлено отсутствие WebUI в pi и проблемы взаимодействия в pi-forge. Невероятно быстро, невероятно плавно. |

---

## Быстрый старт

```bash
npx huiyu-pi
```

Откройте `http://localhost:9144` в браузере, перейдите в **Настройки → Провайдеры**, введите свой ключ API и начните общаться.

*Также доступна глобальная установка через npm, ручное клонирование или скрипты для разных платформ — см. [Установка](#установка) ниже.*

---

## Возможности

### 🔐 Самостоятельный хостинг и приватность
Ваш код, ключи API и история разговоров остаются на вашем компьютере. Никакого облака, никаких третьих сторон, никаких утечек данных.

### 🧠 Поддержка нескольких LLM
Работает с Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter и многими другими — включая локальные модели.

### 📁 Полное управление файлами
Встроенный файловый браузер с редактором CodeMirror, поддерживающим более 10 языков. Создавайте, редактируйте и ищите файлы прямо в браузере.

### 🖥️ Встроенный терминал
Полноценный эмулятор терминала на базе xterm.js + WebSocket. Несколько вкладок, поддержка переподключения, изменяемый размер.

### 🔀 Интеграция с Git
Просматривайте диффы, фиксируйте изменения на уровне ханков, изучайте историю коммитов с git-graph — всё из браузера.

### 🔌 Поддержка протокола MCP
Подключайте внешние MCP-серверы и предоставляйте их инструменты вашему coding-агенту. Поддерживаются как глобальные, так и проектные конфигурации.

### 📱 Мобильная адаптация + PWA
Адаптивный дизайн работает на iOS/Android. Установите как PWA для полноценного нативного опыта.

### 🎨 Полностью настраиваемая тема
Тёмная и светлая темы управляются CSS-переменными. Создавайте собственные скины без пересборки.

---

## Установка

**Требования:** Node.js ≥ 20 ([скачать](https://nodejs.org/)). Инструменты сборки необходимы для поддержки терминала: установите [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows), `xcode-select --install` (macOS) или `build-essential` (Linux). Чат и файловый браузер работают без инструментов сборки — только вкладка терминала их требует.

### Вариант A: npx (без установки, однократный запуск)

```bash
npx huiyu-pi
```

Скачивает и запускает последнюю версию. Последующие вызовы `npx huiyu-pi` используют кэшированную версию. Чтобы принудительно обновить: `npx huiyu-pi@latest`.

### Вариант B: Глобальная установка (быстрый повторный запуск)

```bash
npm install -g huiyu-pi
huiyu-pi                    # запустить сервер
huiyu-pi --help             # показать все флаги
huiyu-pi --port 4000        # пользовательский порт
huiyu-pi --workspace-path ~/Code  # пользовательская рабочая область
```

Для обновления: `npm update -g huiyu-pi`. Для удаления: `npm uninstall -g huiyu-pi`.

### Вариант C: Скрипты для платформ (клонирование + запуск)

Клонируйте репозиторий, затем запустите скрипт запуска для вашей платформы:

| Платформа | Команда |
|---|---|
| **Windows** | Дважды нажмите `start.bat` или запустите в PowerShell: `.\start.bat` |
| **macOS / Linux** | Откройте Терминал, перейдите в каталог репозитория, затем `bash start.sh` |

Скрипт запуска делает всё сам: `npm install` → сборка сервера → сборка клиента → запуск. Первый запуск занимает несколько минут; последующие запуски проходят быстро.

**Доступ по локальной сети** (общий доступ в вашей локальной сети):

| Платформа | Команда |
|---|---|
| **Windows** | `.\start-lan.bat` |
| **macOS / Linux** | `bash start-lan.sh` |

Или через флаг: `huiyu-pi --host 0.0.0.0`

> ⚠️ **Безопасность:** Привязка к `0.0.0.0` открывает доступ к оболочке и файловой системе агента для **всех в вашей сети**. Используйте только в надёжных частных сетях.

### Вариант D: Ручная установка (для разработки)

```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi
npm install          # установить все зависимости (первый раз может занять несколько минут)
npm run dev          # запустить сервер разработки с HMR (http://localhost:9145)
```

Для продакшн-сборки:

```bash
npm run build        # собрать сервер + клиент
npm run start        # запустить продакшн-сервер на порту 9144
```

### Вариант E: Docker (рекомендуется для продакшна)

**Загрузка из реестра** (клонирование не требуется):
```bash
docker run -d \
  --name huiyu-pi \
  -p 9144:9144 \
  -v ~/.pi/agent:/home/pi/.pi/agent \
  -v ~/.huiyu-pi:/home/pi/.huiyu-pi \
  -v $(pwd)/workspace:/workspace \
  ghcr.io/huiyu9144/huiyu-pi:latest
```

**Или сборка локально** (для кастомизации):
```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi/docker
cp .env.example .env
docker compose up -d --build
```

Откройте `http://localhost:9144` в браузере.

**Пользовательский UID/GID** (решение проблем с правами доступа при монтировании):
```bash
docker compose build --build-arg PUID=$(id -u) --build-arg PGID=$(id -g)
docker compose up -d
```

Подробную информацию о конфигурации Docker см. в [docker/README.md](docker/README.md).

---

## Настройка ключа API

Huiyu Pi управляет ключами API провайдеров через **интерфейс настроек** и хранит их в `~/.pi/agent/auth.json` (общий файл с CLI `pi`, если он установлен). Ключи никогда не передаются в браузер — сервер хранит их в памяти и проксирует все запросы к LLM.

### Через интерфейс настроек (рекомендуется)

1. Откройте `http://localhost:9144`
2. Перейдите в **Настройки → Провайдеры**
3. Выберите провайдера (Anthropic, OpenAI, DeepSeek и т.д.)
4. Вставьте ключ API и сохраните

### Поддерживаемые провайдеры

Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter и любой совместимый с OpenAI эндпоинт (vLLM, LiteLLM, Ollama и т.д.).

### Пользовательские совместимые с OpenAI провайдеры

Для самостоятельного хостинга или сторонних эндпоинтов создайте файл `~/.pi/agent/models.json`:

```json
{
  "custom-gateway": {
    "protocol": "openai",
    "url": "http://localhost:11434/v1",
    "models": ["qwen2.5-coder-32b"]
  }
}
```

Затем добавьте ключ API в **Настройки → Провайдеры → custom-gateway**.

### CLI-флаг (для скриптов / CI)

```bash
huiyu-pi --api-key @/path/to/api-key.txt
```

Префикс `@` считывает ключ из файла. Удобно для CI-пайплайнов и Docker secrets.

---

## Конфигурация

Все параметры управляются через CLI-флаги, переменные окружения или файлы конфигурации. CLI-флаги имеют приоритет над переменными окружения, а те — над файлами конфигурации.

### CLI-флаги

| Флаг | Описание | Значение по умолчанию |
|---|---|---|
| `--port` | Порт сервера | `9144` |
| `--host` | Адрес привязки | `127.0.0.1` |
| `--workspace-path` | Корневой каталог для проектов | `~/huiyu-pi-workspace` |
| `--api-key` | Статический ключ API (поддерживается синтаксис `@file`) | — |
| `--ui-password` | Пароль для входа в браузер | — |
| `--jwt-secret` | Ключ подписи JWT (генерируется автоматически, если не задан) | — |
| `--log-level` | Уровень логирования: `fatal` `error` `warn` `info` `debug` `trace` | `info` |
| `--no-expose-docs` | Скрыть Swagger UI в браузере | docs открыты |
| `--help` | Показать все флаги | — |

### Переменные окружения

| Переменная | Описание |
|---|---|
| `PORT` | Порт сервера |
| `HOST` | Адрес привязки (`0.0.0.0` для доступа по локальной сети) |
| `WORKSPACE_PATH` | Корневой каталог для проектов |
| `API_KEY` | Статический ключ API |
| `UI_PASSWORD` | Пароль для входа в браузер |
| `JWT_SECRET` | Ключ подписи JWT |
| `LOG_LEVEL` | Уровень логирования |
| `EXPOSE_DOCS` | Установить `false` для скрытия Swagger UI |
| `FORGE_DATA_DIR` | Переопределить каталог состояний (по умолчанию `~/.huiyu-pi/`) |

### Файлы конфигурации

| Файл | Назначение |
|---|---|
| `~/.pi/agent/auth.json` | Ключи API провайдеров (управляются через интерфейс настроек) |
| `~/.pi/agent/settings.json` | Настройки агента (модель, уровень мышления и т.д.) |
| `~/.pi/agent/models.json` | Пользовательские совместимые с OpenAI провайдеры |
| `~/.huiyu-pi/mcp.json` | Глобальная конфигурация MCP-сервера |

---

## Кастомизация

Тема управляется через пользовательские CSS-свойства в `packages/client/src/index.css`:

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

## Технологический стек

| Уровень | Технологии |
|-------|-------------|
| **Фронтенд** | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Zustand, CodeMirror 6 |
| **Бэкенд** | Fastify 5, WebSocket, SSE, JWT |
| **Терминал** | xterm.js + node-pty |
| **Инфраструктура** | GitHub Actions CI/CD |

---

## Сообщество

- 💬 [Присоединяйтесь к нашему Discord](https://discord.gg/BdJDs4AKbS)
- ⭐ [Поставьте звезду на GitHub](https://github.com/huiyu9144/Huiyu-Pi)
- 🌐 [Посетите наш сайт](https://www.huiyu.ai)

---

## Участие в разработке

Мы приветствуем вклад! Ознакомьтесь с руководством в [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Благодарности

Построен на основе двух проектов с открытым кодом:

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) от [Devin Marks](https://github.com/Devin-Marks) и контрибьюторов
- [**pi**](https://github.com/earendil-works/pi) от [earendil-works](https://github.com/earendil-works) и контрибьюторов

## Автор

Подпишитесь на автора в X (Twitter): [@huiyu91444](https://x.com/huiyu91444)

## Лицензия

[MIT](LICENSE) — см. лицензии вышестоящих проектов:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)

Copyright (c) 2026 Huiyu Pi contributors
Copyright (c) 2026 Devin Marks and pi-forge contributors
Copyright (c) 2026 earendil-works and pi contributors
