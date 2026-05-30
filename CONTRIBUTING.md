# Contributing to Huiyu PiwebUI Forge

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (recommended) or npm
- Git

### Development Setup

```bash
git clone https://github.com/huiyu9144/Huiyu-PiwebUI-Forge.git
cd Huiyu-PiwebUI-Forge
npm install
cd server && npm install && cd ..
npm run dev:all
```

- Frontend: http://localhost:9144
- Backend: http://localhost:9145

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/issues) to avoid duplicates
2. Open a new issue using the **Bug Report** template
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (OS, browser, Node version)
   - Screenshots if applicable

### Suggesting Features

1. Check [existing issues](https://github.com/huiyu9144/Huiyu-PiwebUI-Forge/issues) for similar requests
2. Open a new issue using the **Feature Request** template
3. Describe the problem you're solving and your proposed solution

### Submitting Code

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Test your changes thoroughly
5. Commit with a clear message:
   ```bash
   git commit -m "feat: add new feature"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Code style changes (formatting, etc.) |
| `refactor:` | Code refactoring |
| `perf:` | Performance improvements |
| `test:` | Adding or updating tests |
| `chore:` | Maintenance tasks |

Examples:
```
feat: add Dark Mode toggle
fix: resolve terminal connection issue on Windows
docs: update installation guide
```

## Code Style

### TypeScript/React

- Use TypeScript for all new code
- Follow existing code patterns in the project
- Use functional components with hooks
- Keep components focused and small

### CSS

- Use Tailwind CSS classes when possible
- Follow existing naming conventions
- Keep styles consistent with the design system

## Project Structure

```
pi-forge/
├── packages/
│   ├── client/          # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── ...
│   │   └── public/
│   └── server/          # Backend (Fastify)
│       └── src/
│           ├── routes/
│           ├── lib/
│           └── ...
├── docs/
└── kubernetes/
```

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include a clear description of what changed and why
- Add screenshots for UI changes
- Ensure no breaking changes without discussion
- Update documentation if needed
- Follow existing code style

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Questions?

- Join our [Discord](https://discord.gg/BdJDs4AKbS) for real-time discussion
- Open an issue for bugs or feature requests

Thank you for contributing! 🎉
