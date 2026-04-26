# Specification: Enhanced Download Experience & Library View

## Overview
This track focuses on upgrading the core downloading functionality from a "blind trigger" to a "fetch-and-select" flow. It adds metadata previews, quality selection, precise progress tracking, a persistent download library, and automatic conversion to MP4 format.

## Functional Requirements
1. **Metadata & Preview (Fetch-First)**
   - **Internal UI:** Pasting a URL triggers a fetch request to get title, thumbnail, and available formats.
   - **API Bridge:** Add a new endpoint `GET /metadata?url=<url>` that returns video details and quality options.
2. **Quality Selection**
   - Allow users to choose from available formats (e.g., 1080p, 720p, audio only).
   - The `POST /download` endpoint should accept an optional `format_id`.
3. **Persistent Library View**
   - Store download history (Title, Date, File Path) in a local JSON database (e.g., `lowdb` or simple file).
   - Create a dedicated "Library" section in the UI to list completed downloads.
4. **Global Download Path**
   - Add a "Settings" area to configure the default download folder (defaults to system Downloads).
5. **Enhanced Progress Tracking**
   - Parse `yt-dlp` output to extract real-time percentage, speed, and ETA.
   - Push updates via IPC to the Renderer and optionally via WebSocket/Polling to the Bridge.
6. **MP4 Conversion (Muxing)**
   - Integrate FFmpeg to ensure downloads are converted/merged into `.mp4` container by default.

## Non-Functional Requirements
- **Performance:** Metadata fetching should be fast (< 2 seconds for common platforms).
- **UX:** Use Brutalist style for the quality list and library view.

## Acceptance Criteria
- [ ] User sees thumbnail and title before clicking "Download".
- [ ] User can pick a specific quality from a list.
- [ ] Download progress shows clear percentage (e.g., "75%").
- [ ] Completed files are found in the user-defined folder as `.mp4`.
- [ ] Library view displays history correctly after app restart.
- [ ] API Bridge supports the same fetch-then-download flow.
