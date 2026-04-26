import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Download, Library, Settings } from 'lucide-react'
import DownloaderPage from './pages/Downloader'
import LibraryPage from './pages/Library'
import SettingsPage from './pages/Settings'

function App(): React.JSX.Element {
  return (
    <Router>
      <div className="app-layout">
        <aside className="sidebar">
          <header className="sidebar-logo">
            <div className="logo-box">YT</div>
          </header>
          <nav className="nav-menu">
            <NavLink to="/downloader" aria-label="Downloader" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Download size={32} />
              <span className="tooltip">Downloader</span>
            </NavLink>
            <NavLink to="/library" aria-label="Library" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Library size={32} />
              <span className="tooltip">Library</span>
            </NavLink>
            <NavLink to="/settings" aria-label="Settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={32} />
              <span className="tooltip">Settings</span>
            </NavLink>
          </nav>
        </aside>
        
        <main className="content">
          <div className="brutalist-container">
            <Routes>
              <Route path="/" element={<Navigate to="/downloader" replace />} />
              <Route path="/downloader" element={<DownloaderPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
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
          --sidebar-width: 100px;
          --border-thick: 6px;
        }

        * {
          box-sizing: border-box;
        }

        body {
          background-color: var(--gray);
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
          background-color: var(--white);
        }

        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--black);
          border-right: var(--border-thick) solid var(--black);
          display: flex;
          flex-direction: column;
          padding: 20px 0;
          z-index: 100;
        }

        .sidebar-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
        }

        .logo-box {
          background-color: var(--orange);
          color: var(--white);
          font-size: 2rem;
          font-weight: 900;
          padding: 10px;
          border: 4px solid var(--white);
          -webkit-text-stroke: 1px var(--black);
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          width: 100%;
        }

        .nav-item {
          color: var(--white);
          text-decoration: none;
          padding: 15px;
          border: 4px solid transparent;
          transition: all 0.1s;
          position: relative;
        }

        .nav-item:hover {
          background-color: var(--orange);
          border-color: var(--white);
          transform: translate(4px, -4px);
          box-shadow: -4px 4px 0px var(--white);
        }

        .nav-item.active {
          background-color: var(--blue);
          border-color: var(--white);
          box-shadow: -6px 6px 0px var(--white);
        }

        .nav-item .tooltip {
          position: absolute;
          left: 110%;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--black);
          color: var(--white);
          padding: 5px 10px;
          font-weight: bold;
          text-transform: uppercase;
          border: 2px solid var(--white);
          white-space: nowrap;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }

        .nav-item:hover .tooltip {
          visibility: visible;
          opacity: 1;
        }

        .content {
          flex-grow: 1;
          padding: 30px;
          overflow-y: auto;
          background-image: radial-gradient(var(--black) 1px, transparent 0);
          background-size: 30px 30px;
          background-color: var(--white);
        }

        .brutalist-container {
          background-color: var(--white);
          border: var(--border-thick) solid var(--black);
          padding: 30px;
          box-shadow: 20px 20px 0px var(--black);
          min-height: 100%;
        }

        h2 {
          text-transform: uppercase;
          font-size: 2.5rem;
          margin-top: 0;
          background-color: var(--black);
          color: var(--white);
          padding: 10px 20px;
          display: inline-block;
          margin-bottom: 30px;
          border-right: 10px solid var(--orange);
        }

        /* Downloader / Shared styles */
        .input-group {
          display: flex;
          border: var(--border-thick) solid var(--black);
          margin-bottom: 30px;
          box-shadow: 10px 10px 0px var(--black);
        }

        .brutalist-input {
          flex-grow: 1;
          border: none;
          padding: 20px;
          font-size: 1.5rem;
          font-family: inherit;
          outline: none;
          background: var(--white);
        }

        .brutalist-button {
          background-color: var(--blue);
          color: var(--white);
          border: none;
          border-left: var(--border-thick) solid var(--black);
          padding: 0 40px;
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.1s;
        }

        .brutalist-button:hover:not(:disabled) {
          background-color: var(--orange);
        }

        .brutalist-button:active:not(:disabled) {
          background-color: var(--black);
        }

        .status-banner {
          background-color: var(--black);
          color: var(--orange);
          padding: 20px;
          font-weight: 900;
          font-size: 1.2rem;
          text-transform: uppercase;
          border-left: 20px solid var(--blue);
          margin-bottom: 30px;
          box-shadow: 10px 10px 0px rgba(0,0,0,0.2);
        }

        .progress-container {
          margin-top: 15px;
          height: 40px;
          background-color: #333;
          border: 3px solid var(--white);
          position: relative;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background-color: var(--orange);
          transition: width 0.3s;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--white);
          font-size: 1.2rem;
          font-weight: bold;
          text-shadow: 2px 2px 0px var(--black);
        }

        .metadata-preview {
          border: var(--border-thick) solid var(--black);
          padding: 20px;
          margin-bottom: 30px;
          background-color: var(--white);
          box-shadow: 10px 10px 0px var(--blue);
        }

        .preview-content {
          display: flex;
          gap: 30px;
        }

        .thumbnail {
          width: 300px;
          border: var(--border-thick) solid var(--black);
        }

        .details h3 {
          margin: 0 0 15px 0;
          font-size: 1.8rem;
          text-transform: uppercase;
        }

        .quality-selector {
          margin: 20px 0;
          background-color: var(--gray);
          border: 3px solid var(--black);
          padding: 15px;
        }

        .brutalist-select {
          width: 100%;
          padding: 10px;
          border: 3px solid var(--black);
          font-family: inherit;
          font-weight: 900;
          background: var(--white);
        }

        .log-area {
          border: var(--border-thick) solid var(--black);
          background-color: var(--gray);
        }

        .log-area h3 {
          margin: 0;
          padding: 15px;
          background-color: var(--black);
          color: var(--white);
          text-transform: uppercase;
        }

        .log-content {
          padding: 15px;
          max-height: 200px;
          overflow-y: auto;
          font-size: 1rem;
        }

        .log-entry {
          margin-bottom: 8px;
          border-bottom: 2px solid #ccc;
          padding-bottom: 4px;
        }

        /* Library styles */
        .library-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }

        .library-item {
          border: var(--border-thick) solid var(--black);
          background-color: var(--white);
          padding: 15px;
          box-shadow: 10px 10px 0px var(--black);
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .item-thumb {
          width: 100%;
          border: 4px solid var(--black);
        }

        .item-title {
          font-weight: 900;
          font-size: 1.2rem;
          text-transform: uppercase;
        }

        .action-btn {
          background-color: var(--black);
          color: var(--white);
          border: none;
          padding: 10px;
          font-weight: 900;
          text-transform: uppercase;
          cursor: pointer;
          flex-grow: 1;
        }

        .action-btn:hover {
          background-color: var(--blue);
        }

        /* Settings styles */
        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .setting-card {
          border: var(--border-thick) solid var(--black);
          padding: 20px;
          background-color: var(--yellow);
          box-shadow: 10px 10px 0px var(--black);
        }

        .path-input-group {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }

        .path-input-group input {
          flex-grow: 1;
          padding: 10px;
          border: 3px solid var(--black);
          font-family: inherit;
        }

        .btn-black {
          background-color: var(--black);
          color: var(--white);
          border: none;
          padding: 10px 20px;
          font-weight: 900;
          text-transform: uppercase;
          cursor: pointer;
        }
      `}</style>
    </Router>
  )
}

export default App
