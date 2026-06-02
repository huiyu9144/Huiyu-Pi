<p align="center">
  <img src="packages/client/public/icons/logo-rounded.png" alt="Huiyu Pi" width="120">
</p>

<h1 align="center">Huiyu Pi</h1>

<p align="center">
  <a href="README.md">🇺🇸 English</a> · <a href="README.zh.md">🇨🇳 中文</a> · <a href="README.ja.md">🇯🇵 日本語</a> · <a href="README.ko.md">🇰🇷 한국어</a> · <a href="README.es.md">🇪🇸 Español</a> · <a href="README.fr.md">🇫🇷 Français</a> · <a href="README.de.md">🇩🇪 Deutsch</a> · <a href="README.pt.md">🇧🇷 Português</a> · <a href="README.ru.md">🇷🇺 Русский</a> · <a href="README.ar.md">🇸🇦 العربية</a> · <a href="https://www.huiyu.ai">🌐 Site web</a>
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
  <b>Agent de codage IA, dépouillé à l'essentiel.</b><br>
  ~80 jetons de prompt système · ~0.3s pour le premier jeton · 4 outils de base · 100% local
</p>

<p align="center" style="max-width:800px;margin:0 auto;color:#64748b;font-size:12px;line-height:1.6;">
  Huiyu Pi webUI, un outil Agent open-source local qui vous permet de <b style="color:#00d4aa;">construire votre propre système Harness</b> à partir de zéro.
  Construit sur Pi et pi-forge, par rapport aux outils IDE comme Codex et Claude Code,
  <b style="color:#00d4aa;">le contexte est réduit quasi à zéro avec des gains de vitesse massifs</b>.
  Développez proprement sans restrictions de plateforme.
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

## Pourquoi ~80 jetons ?

La plupart des outils de codage IA envoient 15 000 à 28 000 jetons dans chaque requête — règles, définitions d'outils, prompts de rôle, formatage de sortie. L'IA passe la majeure partie de son attention à lire du code boilerplate au lieu de résoudre votre problème.

Huiyu Pi adopte l'approche inverse : supprimer tout ce qui n'est pas essentiel. 4 outils de base. Canevas propre. Zéro bagage.

| | Avant (typique) | Huiyu Pi |
|---|---|---|
| Surcharge du prompt système | 15K–28K jetons | **~80 jetons** |
| Réponse du premier jeton | 2–10 secondes | **~0.3 seconde** |
| Coût par requête | $0.02–$0.10+ | **90%+ moins cher** |
| Définitions d'outils | 10–24+ | **4 essentiels** |
| Type de client | Desktop lourd / Electron | **Interface Web pure** |
| Confidentialité des données | Cloud ou hybride | **100% local** |

---

## Pourquoi choisir Huiyu Pi ?

Construit sur pi et pi-forge, corrigeant leur absence d'interface WebUI et leurs détails d'interaction maladroits. Huiyu Pi est une interface web pour l'agent de codage pi — elle est ultra-rapide et le plaisir d'utilisation est au rendez-vous — c'est pourquoi je la partage.

| | Avantage | Détails |
|---|---|---|
| ⚡ | **Performance plus rapide** | Le contexte et les prompts par défaut compressés d'environ 20K jetons à quasi zéro. Le temps de réponse de l'IA est considérablement réduit. |
| 💰 | **Consommation de jetons réduite** | La plupart des contextes inutilisés sont supprimés, réduisant drastiquement les coûts d'API par requête. |
| 🎯 | **Moins de contexte, plus de concentration** | Moins de contexte = l'IA reste concentrée sur les instructions principales pour une exécution plus précise. |
| 🔒 | **Déploiement local = sécurité** | Entièrement local — les clés API et les données ne quittent jamais votre machine. Aucun risque de fuite de données. |
| 🏗️ | **Construisez votre empire IA** | Créez votre propre Harness et Agent à partir de zéro. Contrôle total, entièrement personnalisable. |
| 🛠️ | **Correction des lacunes de l'original** | Corrige l'absence de WebUI de pi et les problèmes d'interaction de pi-forge. Ultra-rapide, incroyablement fluide. |

---

## Démarrage rapide

```bash
npx huiyu-pi
```

Ouvrez `http://localhost:9144` dans votre navigateur, allez dans **Paramètres → Fournisseurs**, entrez votre clé API et commencez à discuter.

*Aussi disponible en installation globale npm, clonage manuel ou scripts de plateforme — voir [Installation](#installation) ci-dessous.*

---

## Fonctionnalités

### 🔐 Auto-hébergé & Privé
Votre code, vos clés API et votre historique de conversations restent sur votre propre machine. Pas de cloud, pas de tiers, pas de fuite de données.

### 🧠 Support multi-LLM
Compatible avec Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter et bien d'autres — y compris les modèles locaux.

### 📁 Gestion complète des fichiers
Explorateur de fichiers intégré avec éditeur CodeMirror prenant en charge plus de 10 langages. Créez, modifiez et recherchez des fichiers directement dans le navigateur.

### 🖥️ Terminal intégré
Émulateur de terminal complet via xterm.js + WebSocket. Onglets multiples, support de reconnexion, disposition redimensionnable.

### 🔀 Intégration Git
Visualisez les diffs, staging au niveau des hunks, explorez l'historique des commits avec git-graph — tout depuis le navigateur.

### 🔌 Support du protocole MCP
Connectez des serveurs MCP externes et exposez leurs outils à votre agent de codage. Supporte les configurations globales et au niveau projet.

### 📱 Adapté au mobile + PWA
Design responsive fonctionnant sur iOS/Android. Installez en tant que PWA pour une expérience proche du natif.

### 🎨 Thème entièrement personnalisable
Thèmes sombre et clair contrôlés par des variables CSS. Créez votre propre thème sans recompiler.

---

## Installation

**Prérequis :** Node.js ≥ 20 ([télécharger](https://nodejs.org/)). Outils de build nécessaires pour le support du terminal : installez [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows), `xcode-select --install` (macOS) ou `build-essential` (Linux). Le chat et l'explorateur de fichiers fonctionnent sans outils de build — seul l'onglet terminal les requiert.

### Option A : npx (sans installation, exécution unique)

```bash
npx huiyu-pi
```

Télécharge et lance la dernière version. Les appels ultérieurs à `npx huiyu-pi` utilisent la version en cache. Pour forcer une mise à jour : `npx huiyu-pi@latest`.

### Option B : Installation globale (lancements ultérieurs plus rapides)

```bash
npm install -g huiyu-pi
huiyu-pi                    # démarrer le serveur
huiyu-pi --help             # afficher toutes les options
huiyu-pi --port 4000        # port personnalisé
huiyu-pi --workspace-path ~/Code  # espace de travail personnalisé
```

Pour mettre à jour : `npm update -g huiyu-pi`. Pour désinstaller : `npm uninstall -g huiyu-pi`.

### Option C : Scripts de plateforme (cloner + exécuter)

Clonez le dépôt, puis exécutez le script de démarrage pour votre plateforme :

| Plateforme | Commande |
|---|---|
| **Windows** | Double-cliquez sur `start.bat`, ou exécutez dans PowerShell : `.\start.bat` |
| **macOS / Linux** | Ouvrez le Terminal, faites un `cd` dans le dépôt, puis `bash start.sh` |

Le script de démarrage gère tout : `npm install` → build du serveur → build du client → démarrage. La première exécution prend quelques minutes ; les suivantes sont rapides.

**Accès réseau local** (partager sur votre réseau) :

| Plateforme | Commande |
|---|---|
| **Windows** | `.\start-lan.bat` |
| **macOS / Linux** | `bash start-lan.sh` |

Ou via l'option : `huiyu-pi --host 0.0.0.0`

> ⚠️ **Sécurité :** Le binding sur `0.0.0.0` expose le shell et le système de fichiers de l'agent à **tous les utilisateurs de votre réseau**. À n'utiliser que sur des réseaux privés de confiance.

### Option D : Manuel (développement)

```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi
npm install          # installer toutes les dépendances (première fois peut prendre quelques minutes)
npm run dev          # démarrer le serveur de dev avec HMR (http://localhost:9145)
```

Pour les builds de production :

```bash
npm run build        # builder serveur + client
npm run start        # démarrer le serveur de production sur le port 9144
```

### Option E : Docker (recommandé pour la production)

**Tirer depuis le registre** (pas besoin de cloner) :
```bash
docker run -d \
  --name huiyu-pi \
  -p 9144:9144 \
  -v ~/.pi/agent:/home/pi/.pi/agent \
  -v ~/.huiyu-pi:/home/pi/.huiyu-pi \
  -v $(pwd)/workspace:/workspace \
  ghcr.io/huiyu9144/huiyu-pi:latest
```

**Ou construire localement** (pour la personnalisation) :
```bash
git clone https://github.com/huiyu9144/Huiyu-Pi.git
cd Huiyu-Pi/docker
cp .env.example .env
docker compose up -d --build
```

Ouvrez `http://localhost:9144` dans votre navigateur.

**UID/GID personnalisés** (correction des problèmes de permissions sur les mounts) :
```bash
docker compose build --build-arg PUID=$(id -u) --build-arg PGID=$(id -g)
docker compose up -d
```

Pour la configuration Docker détaillée, consultez [docker/README.md](docker/README.md).

---

## Configuration de la clé API

Huiyu Pi gère les clés API des fournisseurs via l'**interface Paramètres** et les stocke dans `~/.pi/agent/auth.json` (partagé avec le CLI `pi` si installé). Les clés ne sont jamais exposées au navigateur — le serveur les conserve en mémoire et proxyfie toutes les requêtes LLM.

### Via l'interface Paramètres (Recommandé)

1. Ouvrez `http://localhost:9144`
2. Allez dans **Paramètres → Fournisseurs**
3. Sélectionnez votre fournisseur (Anthropic, OpenAI, DeepSeek, etc.)
4. Collez votre clé API et enregistrez

### Fournisseurs pris en charge

Anthropic Claude, OpenAI GPT/o1/o3, DeepSeek, Google Gemini, Mistral, Groq, xAI, OpenRouter et tout endpoint compatible OpenAI (vLLM, LiteLLM, Ollama, etc.).

### Fournisseurs OpenAI compatibles personnalisés

Pour les endpoints auto-hébergés ou tiers, créez `~/.pi/agent/models.json` :

```json
{
  "custom-gateway": {
    "protocol": "openai",
    "url": "http://localhost:11434/v1",
    "models": ["qwen2.5-coder-32b"]
  }
}
```

Puis ajoutez la clé API dans **Paramètres → Fournisseurs → custom-gateway**.

### Option CLI (pour scripts / CI)

```bash
huiyu-pi --api-key @/path/to/api-key.txt
```

Le préfixe `@` lit la clé depuis un fichier. Utile pour les pipelines CI et les secrets Docker.

---

## Configuration

Tous les paramètres peuvent être contrôlés via les options CLI, les variables d'environnement ou les fichiers de configuration. Les options CLI ont la priorité sur les variables d'environnement, qui ont la priorité sur les fichiers de configuration.

### Options CLI

| Option | Description | Défaut |
|---|---|---|
| `--port` | Port du serveur | `9144` |
| `--host` | Adresse de binding | `127.0.0.1` |
| `--workspace-path` | Répertoire racine pour les projets | `~/huiyu-pi-workspace` |
| `--api-key` | Clé API statique (syntaxe `@fichier` acceptée) | — |
| `--ui-password` | Mot de passe de connexion navigateur | — |
| `--jwt-secret` | Clé de signature JWT (auto-générée si non définie) | — |
| `--log-level` | Niveau de log : `fatal` `error` `warn` `info` `debug` `trace` | `info` |
| `--no-expose-docs` | Masquer Swagger UI dans le navigateur | docs exposés |
| `--help` | Afficher toutes les options | — |

### Variables d'environnement

| Variable | Description |
|---|---|
| `PORT` | Port du serveur |
| `HOST` | Adresse de binding (`0.0.0.0` pour le réseau local) |
| `WORKSPACE_PATH` | Répertoire racine pour les projets |
| `API_KEY` | Clé API statique |
| `UI_PASSWORD` | Mot de passe de connexion navigateur |
| `JWT_SECRET` | Clé de signature JWT |
| `LOG_LEVEL` | Niveau de log |
| `EXPOSE_DOCS` | Définir sur `false` pour masquer Swagger UI |
| `FORGE_DATA_DIR` | Répertoire d'état personnalisé (défaut `~/.huiyu-pi/`) |

### Fichiers de configuration

| Fichier | Usage |
|---|---|
| `~/.pi/agent/auth.json` | Clés API des fournisseurs (gérées via l'interface Paramètres) |
| `~/.pi/agent/settings.json` | Paramètres de l'agent (modèle, niveau de réflexion, etc.) |
| `~/.pi/agent/models.json` | Fournisseurs OpenAI compatibles personnalisés |
| `~/.huiyu-pi/mcp.json` | Configuration globale des serveurs MCP |

---

## Personnalisation

Le thème est contrôlé par les propriétés CSS personnalisées dans `packages/client/src/index.css` :

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

## Stack technique

| Couche | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Zustand, CodeMirror 6 |
| **Backend** | Fastify 5, WebSocket, SSE, JWT |
| **Terminal** | xterm.js + node-pty |
| **Infrastructure** | GitHub Actions CI/CD |

---

## Communauté

- 💬 [Rejoignez notre Discord](https://discord.gg/BdJDs4AKbS)
- ⭐ [Étoilez-nous sur GitHub](https://github.com/huiyu9144/Huiyu-Pi)
- 🌐 [Visitez notre site web](https://www.huiyu.ai)

---

## Contribuer

Nous accueillons les contributions ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les directives.

---

## Remerciements

Construit sur la base de deux projets open-source :

- [**pi-forge**](https://github.com/Devin-Marks/pi-forge) par [Devin Marks](https://github.com/Devin-Marks) et les contributeurs
- [**pi**](https://github.com/earendil-works/pi) par [earendil-works](https://github.com/earendil-works) et les contributeurs

## Auteur

Suivez l'auteur sur X (Twitter) : [@huiyu91444](https://x.com/huiyu91444)

## Licence

[MIT](LICENSE) — consultez les projets en amont pour leurs licences :
- [pi-forge](https://github.com/Devin-Marks/pi-forge)
- [pi](https://github.com/earendil-works/pi)

Copyright (c) 2026 contributeurs Huiyu Pi
Copyright (c) 2026 Devin Marks et contributeurs pi-forge
Copyright (c) 2026 earendil-works et contributeurs pi