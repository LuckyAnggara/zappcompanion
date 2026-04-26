# Product Guidelines: yt-dlp Companion App

## 1. Tone and Voice
- **Friendly & Helpful:** All user-facing copy should be guiding and supportive. Avoid intimidating technical jargon in main views; instead, use approachable language that softens error states and encourages the user.
- **Clarity over Complexity:** While the app acts as a technical bridge, communication should focus on the task's success or failure in simple terms.

## 2. Error Handling & UX
- **Graceful Degradation:** When an error occurs (e.g., network failure, invalid URL, or `yt-dlp` crash), present a simple, user-friendly error message.
- **Optional Details:** Always provide a "View Details" or "Log" option for power users to inspect the raw `yt-dlp-exec` output, keeping the primary interface clean.

## 3. Visual & Aesthetic Rules
- **Strict Brutalism:** Embrace a raw, unpolished look. Use thick, high-contrast borders, sharp edges (no soft drop shadows), and bold typography. 
- **Color Enforcement:** The primary palette is strictly restricted to **Orange, White, and Blue**. These colors must dominate the interface to maintain the brutalist identity.
- **Responsive Accessibility:** Despite the brutalist style, all elements must remain fully accessible. Text must have sufficient contrast, and interactive elements must be large enough to click easily. The layout must scale gracefully.