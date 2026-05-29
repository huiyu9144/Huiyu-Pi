# Huiyu PiwebUI Forge

A self-hosted browser UI for the Pi coding agent, with a custom theme and visual design.

Built on top of [pi-forge](https://github.com/Devin-Marks/pi-forge) and [pi](https://github.com/earendil-works/pi).

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An API key from a supported provider (Anthropic, OpenAI, DeepSeek, Google, etc.)

### One-click Start (Windows)

1. Clone the repo and double-click `start.bat`
2. The script will install all dependencies (including Pi SDK) and start both services
3. Browser opens automatically at http://localhost:9144

### Manual Start

```bash
git clone https://github.com/huiyu9144/Huiyu-PiwebUI-Forge.git
cd Huiyu-PiwebUI-Forge
npm install
cd server && npm install && cd ..
npm run dev:all
```

- Frontend: http://localhost:9144
- Backend: http://localhost:9145

### API Key Setup

Before using, you need to configure an API key. Create the file `~/.pi/agent/auth.json`:

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

Supported providers: Anthropic, OpenAI, DeepSeek, Google, Mistral, Groq, xAI, OpenRouter, and more.

## Customization

The theme is controlled by CSS custom properties in `src/globals.css`. Override the variables to create your own skin:

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

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4

## Acknowledgments

This project is built on top of two open-source projects:

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) by [Devin Marks](https://github.com/Devin-Marks) and contributors — the self-hosted browser UI for the Pi coding agent.
- [**pi**](https://github.com/earendil-works/pi) by [earendil-works](https://github.com/earendil-works) and contributors — the core Pi coding agent SDK and CLI.

Licensed under the [MIT License](LICENSE).

## License

[MIT](LICENSE) — see the upstream projects for their licenses:
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)
