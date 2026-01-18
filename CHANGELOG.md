# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0 (2026-01-18)


### Features

* add electron packaging ([ceb98bb](https://github.com/suman724/personal-notes-app/commit/ceb98bb5cb0e92c42aa240a973ac31ebe477c0b4))
* add electron shell and monorepo ([a2d3ede](https://github.com/suman724/personal-notes-app/commit/a2d3edea52c325141f68e4a7b425a19d0e7ea21a))
* add platform icons ([a5974a7](https://github.com/suman724/personal-notes-app/commit/a5974a73c21fb2d5b43694673cbd92a7f1a842f3))
* add theme palettes ([b1a4ef3](https://github.com/suman724/personal-notes-app/commit/b1a4ef358e4139f25a5122052abd6ffd3bb784bb))
* add theme swatches ([b1caaf4](https://github.com/suman724/personal-notes-app/commit/b1caaf45c0d5b01a9d21541df9749b3442d10f10))
* initial notes app mvp ([a0c7208](https://github.com/suman724/personal-notes-app/commit/a0c720814207190c6ebb410d616d24b4aa9babf9))
* initial notes mvp ([fadb845](https://github.com/suman724/personal-notes-app/commit/fadb845185df37e8db3fb2e3814e6a4897c9bc6f))
* sync theme across tabs ([1e4554b](https://github.com/suman724/personal-notes-app/commit/1e4554b3e6d8a77fdc16968c7d78b49d6be5c59e))


### Bug Fixes

* align vitest types and config ([9eecc61](https://github.com/suman724/personal-notes-app/commit/9eecc6186b847cb9d3335202b4c75387481258ab))
* build electron renderer assets ([f1f6fbe](https://github.com/suman724/personal-notes-app/commit/f1f6fbefd940f1b49f0915df693faa8173df44c4))
* load renderer from resources ([ea94587](https://github.com/suman724/personal-notes-app/commit/ea945878a7cc14af9e992fc7baa54c7e730f6c68))
* repair eslint config ([b60a6b3](https://github.com/suman724/personal-notes-app/commit/b60a6b348fbb105077b6b316648c8b9cfac66368))

## [Unreleased]
### Added
- Monorepo structure with `apps/web` (Vite + React) and `apps/electron` (Electron shell).
- Folder-based notes persistence for desktop via Electron IPC with sync from disk.
- System tray quick note and global shortcut (`Cmd/Ctrl+Shift+N`).
- Theme selector with persistent palettes and cross-tab sync.
- Electron packaging via electron-builder with platform icons and renderer asset bundling.

### Build
- `npm run dist:electron` for installer builds and `npm run pack:electron` for folder builds.
