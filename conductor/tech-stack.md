# Tech Stack: yt-dlp Companion App

## Core Technologies
- **Application Framework:** Electron.js (Latest Stable)
- **Binary Execution:** `yt-dlp-exec` (Node.js wrapper for `yt-dlp`)

## Language & Environment
- **Primary Languages:** TypeScript (for type-safe IPC and React components) and modern JavaScript (ES6+).
- **Runtime:** Node.js (bundled with Electron)

## Local API Bridge (Main Process)
- **Server Framework:** Express.js (Selected for straightforward CORS management and routing), though Fastify or Node's native `http` module may be evaluated for edge-case performance needs.
- **Security:** Helmet & `cors` middleware for Express.

## Internal UI (Renderer Process)
- **Frontend Library:** React (Component-based architecture for managing dynamic UI states like the download queue and detailed logs).
- **Styling:** Vanilla CSS or Styled Components enforcing the Brutalist design (Orange/White/Blue).

## Build & Tooling
- **Bundler & Dev Server:** Vite + Electron (Provides extremely fast Hot Module Replacement during development).
- **Packaging & Distribution:** Electron Builder and Electron Forge (Configured to output cross-platform executables).