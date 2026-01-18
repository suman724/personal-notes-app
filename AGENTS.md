# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React + TypeScript app. Keep a predictable layout and clear entrypoints:
- `index.html` is the Vite HTML entry; `src/main.tsx` bootstraps the app and `src/App.tsx` is the root component.
- `src/components/` for reusable UI, `src/pages/` for route-level screens, and `src/hooks/` for custom hooks.
- `src/styles/` for global styles or theming; component styles live next to components.
- `public/` for static assets copied as-is; `src/assets/` for imported images/SVGs.

## Build, Test, and Development Commands
Use the Vite scripts for local workflows:
```
npm install        # install dependencies
npm run dev        # start the dev server
npm run build      # production build
npm run preview    # serve the production build locally
npm run lint       # lint TypeScript/React code
npm run format     # format code (if configured)
```
If tests are added, keep a `npm run test` script (Vitest preferred for Vite).
If this repo uses a different package manager, mirror the same script names.
GitHub Actions runs tests, builds the app, and builds the Docker image on pushes and pull requests (see `.github/workflows/ci.yml`).

## Coding Style & Naming Conventions
- Indentation: 2 spaces; no tabs.
- React components in `PascalCase` (`NoteCard.tsx`), hooks in `camelCase` with `use` prefix (`useNotes.ts`).
- Style with Tailwind utility classes; keep class lists readable and break long strings across lines.
- Favor named exports for components and utilities; avoid default exports unless required by tooling.
- Format with Prettier and lint with ESLint; keep both enforced in CI (Tailwind class sorting if configured).

## Testing Guidelines
Use Vitest with React Testing Library. Place tests next to source or in `src/__tests__/`:
- Naming: `*.test.tsx` for components and `*.test.ts` for utilities.
- Cover user flows and state changes; mock network calls at the boundary.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat:`, `fix:`, `chore:`). PRs should include:
- A concise summary and test commands run.
- Screenshots or short clips for UI changes.
- Linked issues when available.

## Security & Configuration
Keep secrets in `.env` files and do not commit them. For Vite-style configs, prefix client-exposed variables with `VITE_` and document required keys in `README.md`.
