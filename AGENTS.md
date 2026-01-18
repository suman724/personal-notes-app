# Repository Guidelines

## Project Structure & Module Organization
This is a monorepo with a Vite + React + TypeScript web app and an Electron shell:
- `apps/web/` contains the renderer (`apps/web/src/main.tsx`, `apps/web/src/App.tsx`, Tailwind config, and tests).
- `apps/electron/` contains the Electron main/preload scripts and desktop-only integrations (tray, shortcuts, folder access).
- Notes persistence lives in `apps/web/src/persistence/`; the web app uses localStorage, while Electron uses IPC to read/write files.
- Electron stores notes as `note-<id>.md` files with a small front matter block in the selected folder.

## Build, Test, and Development Commands
Run workspace commands from the repo root:
```
npm install                 # install all workspace deps
npm run dev:web             # Vite dev server
npm run dev:electron        # Vite + Electron (expects localhost:5173)
npm run build:web           # web production build
npm run test:web            # web tests (Vitest)
npm run lint:web            # lint web app
npm run format:web          # format check (Prettier)
npm run pack:electron       # package Electron app into a folder (dist-electron/)
npm run dist:electron       # build distributable installers (DMG/NSIS/AppImage)
```
For ad-hoc runs: `npm run dev -w apps/web`, `npm run preview -w apps/web`, or `npm run start -w apps/electron`.
CI runs tests, lint, web build, and Docker build (see `.github/workflows/ci.yml`).

## Coding Style & Naming Conventions
- Indentation: 2 spaces; no tabs.
- React components in `PascalCase`, hooks in `camelCase` with `use` prefix.
- Tailwind utilities for styling; keep long class lists readable.
- Prefer named exports and keep module names short and consistent.

## Testing Guidelines
Use Vitest + React Testing Library under `apps/web/src/__tests__/`:
- Naming: `*.test.tsx` for components and `*.test.ts` for utilities.
- Cover note creation, filtering, and persistence boundaries.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat:`, `fix:`, `chore:`). PRs should include a summary, test commands run, and screenshots for UI changes.

## Electron Notes
- The app requires a selected folder to persist notes on disk; use the "Open folder" action in the UI.
- "Sync" reloads notes from disk.
- Quick capture opens from the tray and via the global shortcut `Cmd/Ctrl+Shift+N`.
- Packaging uses `electron-builder.yml`; update `apps/electron/assets/icon.png` and regenerate `icon.icns`/`icon.ico` for platform bundles.

## Security & Configuration
Keep secrets in `.env` files and do not commit them. For Vite-style configs, prefix client-exposed variables with `VITE_`.
