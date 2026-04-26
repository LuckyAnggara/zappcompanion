# Track: Initialize Electron App, Local API Bridge, and Core Brutalist UI

## Description
Set up the core Electron application using Vite and React. Configure the Express.js API bridge for handling download requests from the frontend, and build a basic Brutalist internal React UI for manual downloads.

## Requirements
- Scaffold an Electron + Vite + React application.
- Set up an Express server on port 4000 to handle CORS, GET `/ping`, and POST `/download`.
- Integrate `yt-dlp-exec` in the Main process for downloading videos.
- Implement the IPC bridge (`preload.js`) connecting the Renderer to the Main process.
- Design the base UI in React following strict Orange/White/Blue Brutalist guidelines.