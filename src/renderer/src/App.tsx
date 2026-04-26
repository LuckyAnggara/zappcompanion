import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Download, Library, Settings } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import DownloaderPage from './pages/Downloader'
import LibraryPage from './pages/Library'
import SettingsPage from './pages/Settings'

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }): React.JSX.Element {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <NavLink to={to} aria-label={label} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={32} />
          </NavLink>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip-content" side="right" sideOffset={10}>
            {label}
            <Tooltip.Arrow className="tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

function App(): React.JSX.Element {
  const [engineReady, setEngineReady] = React.useState(false)
  const [engineStatus, setEngineStatus] = React.useState('Initializing Engine...')

  const checkEngine = async (): Promise<void> => {
    if (!window.api) return
    setEngineStatus('Checking for updates...')
    try {
      // Small delay for Brutalist dramatic effect
      await new Promise(r => setTimeout(r, 1500))
      const res = await window.api.updateYtDlp()
      if (res.success) {
        setEngineStatus('Engine is Up to Date!')
      } else {
        setEngineStatus('Engine Ready.')
      }
      await new Promise(r => setTimeout(r, 1000))
      setEngineReady(true)
    } catch (err) {
      setEngineStatus('Engine initialization failed.')
      console.error(err)
      // Still allow app to open, maybe it works anyway
      setTimeout(() => setEngineReady(true), 2000)
    }
  }

  React.useEffect(() => {
    checkEngine()
  }, [])

  return (
    <Router>
      {!engineReady && (
        <div className="startup-overlay">
          <div className="startup-modal">
            <div className="startup-header">
              <div className="logo-box small">YT</div>
              <h3>System Startup</h3>
            </div>
            <div className="startup-body">
              <div className="spinner large"></div>
              <div className="startup-status">{engineStatus}</div>
              <p>Optimizing downloading environment...</p>
            </div>
          </div>
        </div>
      )}

      <div className="app-layout">
        <aside className="sidebar">
          <header className="sidebar-logo">
            <div className="logo-box">YT</div>
          </header>
          <nav className="nav-menu">
            <NavItem to="/downloader" icon={Download} label="Downloader" />
            <NavItem to="/library" icon={Library} label="Library" />
            <NavItem to="/settings" icon={Settings} label="Settings" />
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

        /* Startup Overlay */
        .startup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0,0,0,0.85);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
        }

        .startup-modal {
          background-color: var(--white);
          border: var(--border-thick) solid var(--black);
          width: 500px;
          box-shadow: 20px 20px 0px var(--orange);
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .startup-header {
          background-color: var(--black);
          color: var(--white);
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          border-bottom: var(--border-thick) solid var(--black);
        }

        .startup-header h3 {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .logo-box.small {
          font-size: 1rem;
          padding: 5px;
        }

        .startup-body {
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .startup-status {
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          margin: 20px 0 10px 0;
          background: var(--yellow);
          padding: 5px 15px;
          border: 3px solid var(--black);
        }

        .spinner.large {
          width: 60px;
          height: 60px;
          border: 8px solid var(--gray);
          border-top-color: var(--blue);
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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
          display: flex;
          align-items: center;
          justify-content: center;
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

        .tooltip-content {
          background-color: var(--black);
          color: var(--white);
          padding: 8px 12px;
          font-weight: 900;
          text-transform: uppercase;
          border: 3px solid var(--white);
          font-family: inherit;
          box-shadow: 4px 4px 0px var(--orange);
          user-select: none;
          animation-duration: 400ms;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
          z-index: 1000;
        }

        .tooltip-arrow {
          fill: var(--white);
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

        .brutalist-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
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
          max-height: 150px;
          overflow-y: auto;
          font-size: 1rem;
        }

        .log-entry {
          margin-bottom: 8px;
          border-bottom: 2px solid #ccc;
          padding-bottom: 4px;
        }

        .empty-log {
          color: #888;
          font-style: italic;
        }

        .download-btn {
          margin-top: 10px;
          width: 100%;
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

        .spinner {
          width: 40px;
          height: 40px;
          border: 6px solid var(--gray);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Router>
  )
}

export default App
