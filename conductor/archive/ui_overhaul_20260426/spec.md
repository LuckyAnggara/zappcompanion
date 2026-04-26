# Specification: UI Overhaul with Sidebar & Page Routing

## Overview
This track transforms the application from a single-page layout into a multi-page experience with a dedicated sidebar navigation. It introduces page routing, icon-based navigation with tooltips, and a "locked" downloader state to prevent concurrent download requests.

## Functional Requirements
1. **Sidebar Navigation**
   - Implement a fixed left-side navigation bar.
   - Use **Lucide React** for icons: Download (Downloader), Library (History), Settings.
   - Sidebar icons should have **Radix UI Tooltips** explaining their destination.
   - Active route should be visually highlighted in Brutalist style.

2. **Page Routing**
   - Integrate `react-router-dom` to manage three distinct views:
     - `/downloader`: The main interface for fetching and starting downloads.
     - `/library`: The history of completed downloads.
     - `/settings`: Configuration options (e.g., download path).

3. **Downloader State Locking (UX)**
   - When a download is in progress (`status === 'downloading'`), the input form and metadata preview must be **completely hidden**.
   - Replace the form with a focused "Active Download" card showing the progress bar, thumbnail, and cancel/stop options.
   - Ensure the user cannot trigger a second download until the current one finishes or fails.

4. **Engine Management (Auto-update)**
   - Implement a "Brutalist" startup modal that checks for engine updates automatically.
   - If an update is available, download it automatically with a clear user-friendly progress state.
   - If no update is found, show a brief "Engine is Ready" message before dismissing.
   - **Crucial:** Remove all technical references to "yt-dlp", "binary", or "exec" from the UI. Refer to it simply as "the Engine".

5. **Brutalist Component Refresh**
   - Adjust the `container` and `main` layout to accommodate the new sidebar.
   - Maintain high-contrast borders and bold color schemes (Orange/Blue/White).

## Technical Requirements
- **Routing:** `react-router-dom` v6+.
- **Icons:** `lucide-react`.
- **Tooltips:** `@radix-ui/react-tooltip`.

## Acceptance Criteria
- [ ] Sidebar is visible and responsive.
- [ ] Tooltips appear correctly on sidebar hover.
- [ ] Navigation correctly switches between the three pages.
- [ ] Initiating a download hides the URL input form entirely.
- [ ] Downloader form reappears automatically once the download is complete or errored.
- [ ] No multiple downloads can be started simultaneously from the UI.
