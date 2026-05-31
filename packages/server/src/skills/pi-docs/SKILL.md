---
name: pi-docs
description: Pi SDK documentation — read when the user asks about pi's extension system, themes, skills, prompt templates, TUI components, keybindings, SDK integrations, custom providers, adding models, or pi packages.
---

When the user asks about pi SDK internals (extensions, themes, skills, prompt templates, TUI, keybindings, custom providers, models, or SDK integrations), read the relevant documentation files below.

First locate the pi package directory using:

```
node -e "console.log(require.resolve('@earendil-works/pi-coding-agent'))"
```

Then find the package root (the path above terminates at `dist/core/...` — the package root is two levels up). Documentation layout:

- `README.md` — Main documentation entry point
- `docs/` — Additional documentation:
  - `extensions.md` + `examples/extensions/` — Extension system
  - `themes.md` — Theme customization
  - `skills.md` — Skill system
  - `prompt-templates.md` — Prompt template system
  - `tui.md` — TUI components and API
  - `keybindings.md` — Keybinding configuration
  - `sdk.md` — SDK integration guide
  - `custom-provider.md` — Custom LLM providers
  - `models.md` — Adding models
  - `packages.md` — Pi packages
- `examples/` — Example code (extensions, custom tools, SDK)

When reading pi docs or examples, resolve relative paths under `docs/...` and `examples/...` against the pi package root, not the current working directory. Read the relevant `.md` files completely and follow cross-references before implementing anything.
