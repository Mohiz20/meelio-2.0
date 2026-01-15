<div align="center">

# Meelio

A productivity and focus application built as a Turborepo monorepo. Fully offline-first - all data is stored locally.

<br />

<img src="https://meelio.io/screenshot.webp" alt="Meelio Screenshot" width="800" />

<br />
<br />

</div>

## Apps

- **web** - Vite + React web application (port 4000)
- **extension** - Plasmo browser extension (Chrome, Edge)

## Packages

- **@repo/shared** - Core business logic, stores, hooks, components
- **@repo/ui** - React component library (shadcn/ui based)
- **@repo/logger** - Logging utility
- **@repo/eslint-config** - ESLint configuration
- **@repo/typescript-config** - TypeScript configuration
- **@repo/tailwind-config** - Tailwind CSS configuration
- **@repo/prettier-config** - Prettier configuration

## Getting Started

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build
```

## Commands

```bash
pnpm dev              # Run all apps in dev mode
pnpm build            # Build all apps
pnpm build:web        # Build web app
pnpm build:extension  # Build extension
pnpm package          # Package extension (by default packages Chrome, you can do package:edge etc. for other packages)
pnpm lint             # Lint all packages
pnpm format           # Format code
pnpm clean            # Clean build artifacts
pnpm test             # Run tests
```

## Loading the Extension Locally

1. Build the extension:
   ```bash
   pnpm build:extension
   ```

2. Open Chrome and navigate to `chrome://extensions`

3. Enable **Developer mode** (toggle in the top right)

4. Click **Load unpacked** and select the `apps/extension/build/chrome-mv3-prod` directory

## Features

- Timer/Pomodoro with customizable intervals
- Ambient soundscapes (offline-capable)
- Tasks and notes with local storage
- Site blocker (extension)
- Tab stash (extension)
- Bookmarks (extension)
- Calendar (ICS integration)
- Customizable backgrounds

## Tech Stack

- React 18, Vite, React Router
- Zustand (state), Dexie (IndexedDB)
- Tailwind CSS, shadcn/ui
- Plasmo (extension), Turborepo
- TypeScript, pnpm

## Data Storage

All data stored locally in the browser:

- **IndexedDB** - Tasks, notes, sessions, sounds
- **localStorage** - Preferences, settings
