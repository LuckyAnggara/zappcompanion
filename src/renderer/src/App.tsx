import React, { createContext, useContext, useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Download, Library, Settings, FileText } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import DownloaderPage from './pages/Downloader'
import LibraryPage from './pages/Library'
import SettingsPage from './pages/Settings'
import DocsPage from './pages/Docs'

// --- GLOBAL STATE MANAGEMENT ---

interface Metadata {
  title: string
  thumbnail: string
  uploader: string
  formats: any[]
  duration?: number
}

interface DownloaderState {
  url: string
  status: string
  logs: string[]
  metadata: Metadata | null
  loading: boolean
  progress: number | null
  selectedFormat: string
  activeDownloadMeta: any | null
  sectionStart: string
  sectionEnd: string
  sliderValues: [number, number]
}

interface DownloaderContextType {
  state: DownloaderState
  setState: React.Dispatch<React.SetStateAction<DownloaderState>>
}

const DownloaderContext = createContext<DownloaderContextType | undefined>(undefined)

export const useDownloader = () => {
  const context = useContext(DownloaderContext)
  if (!context) throw new Error('useDownloader must be used within a DownloaderProvider')
  return context
}

export const DownloaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [downloaderState, setDownloaderState] = useState<DownloaderState>({
    url: '',
    status: 'Core system ready.',
    logs: [],
    metadata: null,
    loading: false,
    progress: null,
    selectedFormat: 'best',
    activeDownloadMeta: null,
    sectionStart: '',
    sectionEnd: '',
    sliderValues: [0, 100]
  })

  useEffect(() => {
    if (!window.electron) return

    const handleComplete = (_event: any, arg: any): void => {
      setDownloaderState(prev => ({
        ...prev,
        status: `Success: Processed ${arg.url}`,
        logs: [...prev.logs, `[SUCCESS] ${arg.url}`],
        progress: null,
        activeDownloadMeta: null
      }))
    }

    const handleError = (_event: any, arg: any): void => {
      setDownloaderState(prev => ({
        ...prev,
        status: `Error: ${arg.message}`,
        logs: [...prev.logs, `[ERROR] ${arg.url}: ${arg.message}`],
        progress: null,
        activeDownloadMeta: null
      }))
    }

    const handleProgress = (_event: any, arg: any): void => {
      setDownloaderState(prev => ({ ...prev, progress: arg.progress }))
    }

    const handleApiLog = (_event: any, msg: string): void => {
      setDownloaderState(prev => ({ ...prev, logs: [...prev.logs, msg] }))
    }

    window.electron.ipcRenderer.on('download-complete', handleComplete)
    window.electron.ipcRenderer.on('download-error', handleError)
    window.electron.ipcRenderer.on('download-progress', handleProgress)
    window.electron.ipcRenderer.on('api-log', handleApiLog)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('download-complete')
      window.electron.ipcRenderer.removeAllListeners('download-error')
      window.electron.ipcRenderer.removeAllListeners('download-progress')
      window.electron.ipcRenderer.removeAllListeners('api-log')
    }
  }, [])

  return (
    <DownloaderContext.Provider value={{ state: downloaderState, setState: setDownloaderState }}>
      {children}
    </DownloaderContext.Provider>
  )
}

// --- MAIN APP COMPONENT ---

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
        if (!res.success) setEngineStatus('Asset Download Failed.')
      }
      setEngineStatus('System Optimized.')
      await new Promise(r => setTimeout(r, 1000))
      setEngineReady(true)
    } catch (err) {
      setEngineStatus('System initialization failed.')
      setTimeout(() => setEngineReady(true), 2000)
    }
  }

  useEffect(() => {
    loadDevMode()
    checkEngine()
    window.addEventListener('settings-updated', loadDevMode)
    return () => window.removeEventListener('settings-updated', loadDevMode)
  }, [])

  return (
    <DownloaderProvider>
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

          * { box-sizing: border-box; }

          body {
            background-color: var(--gray);
            color: var(--black);
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          .app-container-root { height: 100vh; width: 100vw; display: flex; }

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
            width: 400px;
            box-shadow: 12px 12px 0px var(--orange);
            animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .startup-header {
            background-color: var(--black);
            color: var(--white);
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: var(--border-thick) solid var(--black);
          }

          .startup-header h3 { margin: 0; text-transform: uppercase; letter-spacing: 2px; }
          .logo-box.small { font-size: 1rem; padding: 5px; }

          .startup-body {
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .startup-status {
            font-size: 1.2rem;
            font-weight: 900;
            text-transform: uppercase;
            margin: 15px 0 5px 0;
            background: var(--yellow);
            padding: 5px 10px;
            border: 2px solid var(--black);
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

          .app-layout { display: flex; flex-grow: 1; height: 100vh; background-color: var(--white); }

          .sidebar {
            width: var(--sidebar-width);
            background-color: var(--black);
            border-right: var(--border-thick) solid var(--black);
            display: flex;
            flex-direction: column;
            padding: 20px 0;
            z-index: 100;
          }

          .sidebar-logo { display: flex; justify-content: center; margin-bottom: 40px; }

          .logo-box {
            background-color: var(--orange);
            color: var(--white);
            font-size: 2rem;
            font-weight: 900;
            padding: 10px;
            border: 4px solid var(--white);
            -webkit-text-stroke: 1px var(--black);
          }

          .nav-menu { display: flex; flex-direction: column; gap: 20px; align-items: center; width: 100%; }

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
            z-index: 1000;
          }

          .tooltip-arrow { fill: var(--white); }

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

          .brutalist-header {
            background-color: var(--orange);
            border: 4px solid var(--black);
            margin: -30px -30px 30px -30px;
            padding: 15px 30px;
          }

          h1 {
            margin: 0;
            text-transform: uppercase;
            font-size: 2.5rem;
            color: var(--white);
            -webkit-text-stroke: 1.5px var(--black);
            letter-spacing: 2px;
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

          .spinner {
            width: 40px;
            height: 40px;
            border: 6px solid var(--gray);
            border-top-color: var(--blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </Router>
    </DownloaderProvider>
  )
}

export default App
