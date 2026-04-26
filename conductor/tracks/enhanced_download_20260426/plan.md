# Implementation Plan: Enhanced Download Experience & Library View

## Phase 1: Persistence & Settings [checkpoint: d24ff3f]
- [x] Task: Set up local JSON storage (e.g., `electron-store`) for app settings and download history f56fff2
- [x] Task: Implement IPC handlers for managing the default download path and saving/retrieving history 11f8d8b
- [x] Task: Write Tests for the storage and settings logic 3fdfc45
- [x] Task: Conductor - User Manual Verification 'Persistence & Settings' (Protocol in workflow.md) d24ff3f

## Phase 2: Metadata Fetching & Bridge API [checkpoint: a263d08]
- [x] Task: Implement backend logic to fetch video metadata (Title, Thumbnail, Formats) via `yt-dlp` a718435
- [x] Task: Add `GET /metadata` endpoint to the Express Bridge API for web app integration a718435
- [x] Task: Create UI components to display metadata preview and a loading state a718435
- [x] Task: Write Tests for the metadata fetching logic and the new API endpoint a718435
- [x] Task: Conductor - User Manual Verification 'Metadata Fetching & Bridge API' (Protocol in workflow.md) a263d08

## Phase 3: Quality Selection & Real-time Progress
- [~] Task: Update the download logic to support quality selection (`format_id`) and FFmpeg MP4 muxing
- [ ] Task: Implement progress parsing to calculate percentage, speed, and ETA from `yt-dlp` output
- [ ] Task: Build the Quality Selection UI and a detailed progress tracker with percentage
- [ ] Task: Write Tests for progress parsing and download triggering with format selection
- [ ] Task: Conductor - User Manual Verification 'Quality Selection & Real-time Progress' (Protocol in workflow.md)

## Phase 4: Library View & File Management
- [ ] Task: Implement the Library UI section using a Brutalist list style
- [ ] Task: Add functionality to "Open in Folder" and "Play" (open file) for downloaded items
- [ ] Task: Ensure the Library persists and updates automatically after each download
- [ ] Task: Write Tests for the Library UI state and file interaction logic
- [ ] Task: Conductor - User Manual Verification 'Library View & File Management' (Protocol in workflow.md)
