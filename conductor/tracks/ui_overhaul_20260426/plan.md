# Implementation Plan: UI Overhaul with Sidebar & Page Routing

## Phase 1: Architecture & Dependencies [checkpoint: 7cb8b6c]
- [x] Task: Install new dependencies (`react-router-dom`, `lucide-react`, `@radix-ui/react-tooltip`) b7a82dc
- [x] Task: Set up the main routing structure in `App.tsx` and create empty page components cc308c2
- [x] Task: Conductor - User Manual Verification 'Architecture & Dependencies' (Protocol in workflow.md) cc308c2

## Phase 2: Sidebar & Global Layout
- [~] Task: Write Tests for Sidebar navigation and tooltips
- [ ] Task: Implement the fixed Sidebar component using Lucide icons and Radix UI tooltips
- [ ] Task: Apply a global Brutalist layout wrapper (Sidebar + Content area)
- [ ] Task: Conductor - User Manual Verification 'Sidebar & Global Layout' (Protocol in workflow.md)

## Phase 3: Downloader Page & State Locking
- [ ] Task: Write Tests for the Downloader page state transitions (input vs. active download)
- [ ] Task: Refactor Downloader page to use conditional rendering for "Full Hide UI" logic
- [ ] Task: Implement the "Active Download" focused view
- [ ] Task: Conductor - User Manual Verification 'Downloader Page & State Locking' (Protocol in workflow.md)

## Phase 4: Library & Settings Migration
- [ ] Task: Migrate existing Library history logic to the `/library` route
- [ ] Task: Migrate existing storage/settings logic to the `/settings` route
- [ ] Task: Perform final Brutalist styling pass for all pages and navigation active states
- [ ] Task: Conductor - User Manual Verification 'Library & Settings Migration' (Protocol in workflow.md)
