# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- Monorepo structure with `apps/web` (Vite + React) and `apps/electron` (Electron shell).
- Folder-based notes persistence for desktop via Electron IPC with sync from disk.
- System tray quick note and global shortcut (`Cmd/Ctrl+Shift+N`).
- Theme selector with persistent palettes and cross-tab sync.
- Electron packaging via electron-builder with platform icons and renderer asset bundling.

### Build
- `npm run dist:electron` for installer builds and `npm run pack:electron` for folder builds.
