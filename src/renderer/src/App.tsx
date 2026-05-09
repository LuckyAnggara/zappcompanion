import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Download, Library, Settings, FileText } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import DownloaderPage from './pages/Downloader'
import LibraryPage from './pages/Library'
import SettingsPage from './pages/Settings'
import DocsPage from './pages/Docs'

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }): React.JSX.Element {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <NavLink
            to={to}
            aria-label={label}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
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
  const [engineStatus, setEngineStatus] = React.useState('Initializing Core...')
  const [devMode, setDevMode] = React.useState(false)

  const loadDevMode = async () => {
    if (window.api) {
      const s = await window.api.getSettings()
      setDevMode(s?.devMode || false)
    }
  }

  React.useEffect(() => {
    loadDevMode()
    window.addEventListener('settings-updated', loadDevMode)
    return () => window.removeEventListener('settings-updated', loadDevMode)
  }, [])

  const checkEngine = async (): Promise<void> => {
    if (!window.api) return
    
    setEngineStatus('Checking for Core Updates...')
    try {
      await new Promise(r => setTimeout(r, 1000))
      await window.api.updateYtDlp()
      
      setEngineStatus('Verifying Media Muxer...')
      const hasMuxer = await window.api.checkMuxer()
      
      if (!hasMuxer) {
        setEngineStatus('Downloading System Assets...')
        const res = await window.api.downloadMuxer()
        if (!res.success) {
          setEngineStatus('Asset Download Failed.')
          await new Promise(r => setTimeout(r, 2000))
        }
      }

      setEngineStatus('System Optimized.')
      await new Promise(r => setTimeout(r, 1000))
      setEngineReady(true)
    } catch (err) {
      setEngineStatus('System initialization failed.')
      console.error(err)
      setTimeout(() => setEngineReady(true), 2000)
    }
  }

  React.useEffect(() => {
    checkEngine()
  }, [])

  return (
    <Router>
      <div className="app-container-root">
        {!engineReady ? (
          <div className="startup-overlay">
            <div className="startup-modal">
              <div className="startup-header">
                <div className="logo-box small">ZC</div>
                <h3>System Startup</h3>
              </div>
              <div className="startup-body">
                <div className="spinner large"></div>
                <div className="startup-status">{engineStatus}</div>
                <p>Optimizing processing environment...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="app-layout scale-in">
            <aside className="sidebar">
              <header className="sidebar-logo">
                <div className="logo-box">ZC</div>
              </header>
              <nav className="nav-menu">
                <NavItem to="/downloader" icon={Download} label="Clipper" />
                <NavItem to="/library" icon={Library} label="Library" />
                <NavItem to="/settings" icon={Settings} label="Settings" />
                {devMode && <NavItem to="/docs" icon={FileText} label="Documentation" />}
              </nav>
            </aside>

            <main className="content">
              <div className="brutalist-container">
                <header className="brutalist-header">
                  <h1>ZC Companion</h1>
                </header>
                <Routes>
                  <Route path="/" element={<Navigate to="/downloader" replace />} />
                  <Route path="/downloader" element={<DownloaderPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/docs" element={<DocsPage />} />
                </Routes>
              </div>
            </main>
          </div>
        )}
      </div>
    </Router>
  )
}

export default App
