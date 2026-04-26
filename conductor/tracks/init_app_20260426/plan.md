# Implementation Plan: Initialize Electron App, Local API Bridge, and Core Brutalist UI

## Phase 1: Application Scaffolding and Setup

- [x] Task: Scaffold Electron + Vite + React app framework 838bdbe
- [x] Task: Install core dependencies (`yt-dlp-exec`, `express`, `cors`) a668bba
- [x] Task: Configure TypeScript and Vite for the Electron main, preload, and renderer processes 8c450f6
- [ ] Task: Conductor - User Manual Verification 'Application Scaffolding and Setup' (Protocol in workflow.md)

## Phase 2: Local API Bridge (Express Server)

- [ ] Task: Write Tests for Express Server (`/ping` and `/download` routes)
- [ ] Task: Implement Express server in the Main process handling strict CORS
- [ ] Task: Implement GET `/ping` endpoint
- [ ] Task: Implement POST `/download` endpoint integrating `yt-dlp-exec`
- [ ] Task: Conductor - User Manual Verification 'Local API Bridge (Express Server)' (Protocol in workflow.md)

## Phase 3: Core Brutalist UI (Renderer & Preload)

- [ ] Task: Write Tests for React UI components (URL input, Download Button, Progress Bar)
- [ ] Task: Implement secure IPC communication in `preload.js`
- [ ] Task: Implement base React UI with Orange/White/Blue Brutalist styling
- [ ] Task: Connect React UI to `yt-dlp-exec` via IPC for manual local downloads
- [ ] Task: Conductor - User Manual Verification 'Core Brutalist UI (Renderer & Preload)' (Protocol in workflow.md)
