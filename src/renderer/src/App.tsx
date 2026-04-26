import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import DownloaderPage from './pages/Downloader'
import LibraryPage from './pages/Library'
import SettingsPage from './pages/Settings'

function App(): React.JSX.Element {
  return (
    <Router>
      <div className="app-layout">
        <aside className="sidebar">
          {/* Sidebar icons will be implemented in Phase 2 */}
          <nav>
            <div className="nav-placeholder">SB</div>
          </nav>
        </aside>
        
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/downloader" replace />} />
            <Route path="/downloader" element={<DownloaderPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      <style>{`
        :root {
          --orange: #ff5722;
          --blue: #2196f3;
          --white: #ffffff;
          --black: #000000;
          --gray: #eeeeee;
          --yellow: #fff9c4;
          --sidebar-width: 80px;
        }

        body {
          background-color: var(--white);
          color: var(--black);
          font-family: 'Courier New', Courier, monospace;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .app-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
        }

        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--black);
          border-right: 4px solid var(--black);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
        }

        .nav-placeholder {
          color: var(--white);
          font-weight: bold;
          font-size: 1.5rem;
          border: 2px solid var(--white);
          padding: 10px;
        }

        .content {
          flex-grow: 1;
          padding: 20px;
          overflow-y: auto;
          background-color: var(--white);
        }

        /* Re-adding base brutalist styles that were in App.tsx */
        .brutalist-header {
          background-color: var(--orange);
          border: 4px solid var(--black);
          margin: -20px -20px 20px -20px;
          padding: 15px 20px;
        }

        h1 {
          margin: 0;
          text-transform: uppercase;
          font-size: 2.5rem;
          color: var(--white);
          -webkit-text-stroke: 1.5px var(--black);
          letter-spacing: 2px;
        }

        .input-group {
          display: flex;
          gap: 0;
          margin-bottom: 25px;
          border: 4px solid var(--black);
        }

        .brutalist-input {
          flex-grow: 1;
          border: none;
          border-right: 4px solid var(--black);
          padding: 15px;
          font-size: 1.2rem;
          background-color: var(--white);
          outline: none;
        }

        .brutalist-input:focus {
          background-color: var(--yellow);
        }

        .brutalist-button {
          background-color: var(--blue);
          color: var(--white);
          border: none;
          padding: 15px 30px;
          font-size: 1.4rem;
          font-weight: 900;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.1s;
        }

        .brutalist-button:hover:not(:disabled) {
          background-color: #1976d2;
        }

        .brutalist-button:active:not(:disabled) {
          background-color: var(--black);
        }

        .brutalist-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .metadata-preview {
          border: 4px solid var(--black);
          margin-bottom: 20px;
          padding: 15px;
          background-color: #fff;
          box-shadow: 10px 10px 0px var(--black);
        }

        .preview-content {
          display: flex;
          gap: 20px;
        }

        .thumbnail {
          width: 240px;
          height: auto;
          border: 4px solid var(--black);
        }

        .status-banner {
          background-color: var(--black);
          color: var(--orange);
          padding: 15px;
          font-weight: bold;
          margin-bottom: 20px;
          text-transform: uppercase;
          border-left: 15px solid var(--blue);
        }

        .progress-container {
          margin-top: 10px;
          height: 30px;
          background-color: #333;
          border: 2px solid var(--white);
          position: relative;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background-color: var(--blue);
          transition: width 0.3s;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--white);
          font-size: 1rem;
          text-shadow: 1px 1px 2px var(--black);
        }

        .log-area {
          border: 4px solid var(--black);
          background-color: var(--gray);
        }

        .log-area h3 {
          margin: 0;
          padding: 10px;
          background-color: var(--black);
          color: var(--white);
          text-transform: uppercase;
          font-size: 1rem;
        }

        .log-content {
          padding: 10px;
          max-height: 150px;
          overflow-y: auto;
          font-size: 0.9rem;
        }

        .log-entry {
          margin-bottom: 5px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 2px;
        }

        .empty-log {
          color: #888;
          font-style: italic;
        }

        .brutalist-select {
          width: 100%;
          padding: 8px;
          border: 3px solid var(--black);
          font-family: inherit;
          font-weight: bold;
          outline: none;
        }

        .download-btn {
          margin-top: 10px;
          width: 100%;
        }
      `}</style>
    </Router>
  )
}

export default App
