import React, { useState, useEffect } from 'react'

interface Metadata {
  title: string
  thumbnail: string
  uploader: string
  formats: any[]
}

interface DownloadItem {
  id: string
  url: string
  title: string
  thumbnail: string
  filePath: string
  date: string
  status: 'completed' | 'failed'
}

interface AppSettings {
  downloadPath: string
}

function App(): React.JSX.Element {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('Ready to bridge.')
  const [logs, setLogs] = useState<string[]>([])
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [selectedFormat, setSelectedFormat] = useState('best')
  const [history, setHistory] = useState<DownloadItem[]>([])
  const [settings, setSettings] = useState<AppSettings>({ downloadPath: '' })
  const [showSettings, setShowSettings] = useState(false)

  const refreshHistory = async (): Promise<void> => {
    if (window.api) {
      const data = await window.api.getHistory()
      setHistory(data)
    }
  }

  const loadSettings = async (): Promise<void> => {
    if (window.api) {
      const data = await window.api.getSettings()
      setSettings(data)
    }
  }

  useEffect(() => {
    if (!window.electron) {
      setStatus('Error: window.electron is undefined. Check preload script.')
      return
    }

    refreshHistory()
    loadSettings()

    const handleComplete = (_event, arg): void => {
      setStatus(`Success: Downloaded ${arg.url}`)
      setLogs(prev => [...prev, `[SUCCESS] ${arg.url}`])
      setProgress(null)
      refreshHistory()
    }

    const handleError = (_event, arg): void => {
      setStatus(`Error: ${arg.message}`)
      setLogs(prev => [...prev, `[ERROR] ${arg.url}: ${arg.message}`])
      setProgress(null)
    }

    const handleProgress = (_event, arg): void => {
      setProgress(arg.progress)
    }

    window.electron.ipcRenderer.on('download-complete', handleComplete)
    window.electron.ipcRenderer.on('download-error', handleError)
    window.electron.ipcRenderer.on('download-progress', handleProgress)

    return () => {
      // Cleanup
    }
  }, [])

  const handleFetchMetadata = async (): Promise<void> => {
    if (!url) return
    setLoading(true)
    setProgress(null)
    setMetadata(null)
    setStatus(`Fetching metadata for: ${url}`)
    try {
      const data = await window.api.getMetadata(url)
      setMetadata(data)
      setStatus('Metadata loaded. Choose quality and download.')
      setLogs(prev => [...prev, `[INFO] Metadata loaded for ${url}`])
    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
      setLogs(prev => [...prev, `[ERROR] Failed to fetch metadata: ${err.message}`])
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (): void => {
    if (url) {
      setStatus(`Starting download for: ${url}`)
      setLogs(prev => [...prev, `[INFO] Requesting ${url} (Format: ${selectedFormat})`])
      window.electron.ipcRenderer.send('download-video', { 
        url, 
        formatId: selectedFormat,
        metadata: { title: metadata?.title, thumbnail: metadata?.thumbnail }
      })
      setMetadata(null)
      setUrl('')
    }
  }

  const handleSelectDir = async (): Promise<void> => {
    const path = await window.api.selectDirectory()
    if (path) {
      const newSettings = { ...settings, downloadPath: path }
      await window.api.setSettings(newSettings)
      setSettings(newSettings)
      setLogs(prev => [...prev, `[CONFIG] Download path changed to: ${path}`])
    }
  }

  const openFile = (path: string): void => window.api.openFile(path)
  const showInFolder = (path: string): void => window.api.showInFolder(path)

  const availableFormats = metadata?.formats
    ? metadata.formats
        .filter((f) => f.vcodec !== 'none' && f.resolution)
        .filter((v, i, a) => a.findIndex((t) => t.resolution === v.resolution) === i)
        .sort((a, b) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0))
    : []

  return (
    <div className="container">
      <header className="brutalist-header">
        <h1>yt-dlp Bridge</h1>
        <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'Close Settings' : 'Settings'}
        </button>
      </header>
      
      <main className="brutalist-main">
        {showSettings && (
          <section className="settings-section">
            <h2>Settings</h2>
            <div className="setting-item">
              <label>Download Location:</label>
              <div className="path-display">
                <input type="text" readOnly value={settings.downloadPath || 'Default (System Downloads)'} />
                <button onClick={handleSelectDir} className="brutalist-button small">Change</button>
              </div>
            </div>
          </section>
        )}

        <section className="download-section">
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter video URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="brutalist-input"
            />
            <button 
              onClick={handleFetchMetadata} 
              className="brutalist-button"
              disabled={loading}
            >
              {loading ? '...' : 'Fetch'}
            </button>
          </div>
          
          {metadata && (
            <div className="metadata-preview">
              <div className="preview-content">
                <img src={metadata.thumbnail} alt="Thumbnail" className="thumbnail" />
                <div className="details">
                  <h2>{metadata.title}</h2>
                  <p>By: {metadata.uploader}</p>
                  
                  <div className="quality-selector">
                    <label>Select Quality:</label>
                    <select 
                      value={selectedFormat} 
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="brutalist-select"
                    >
                      <option value="best">Best Quality (Auto)</option>
                      {availableFormats.map((f) => (
                        <option key={f.format_id} value={f.format_id}>
                          {f.resolution} ({f.ext})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button onClick={handleDownload} className="brutalist-button download-btn">
                    Download Selected
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="status-banner">
            {status}
            {progress !== null && (
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <span className="progress-text">{progress}%</span>
              </div>
            )}
          </div>
        </section>

        <section className="library-section">
          <h2>Download Library</h2>
          <div className="library-list">
            {history.length === 0 && <p className="empty-msg">No downloads yet.</p>}
            {history.map((item) => (
              <div key={item.id} className="library-item">
                {item.thumbnail && <img src={item.thumbnail} alt="Thumb" className="item-thumb" />}
                <div className="item-details">
                  <div className="item-title">{item.title}</div>
                  <div className="item-meta">{new Date(item.date).toLocaleString()}</div>
                  <div className="item-actions">
                    <button onClick={() => openFile(item.filePath)} className="action-btn">Play</button>
                    <button onClick={() => showInFolder(item.filePath)} className="action-btn">Folder</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="log-section">
          <h3>Activity Log</h3>
          <div className="log-content">
            {logs.length === 0 && <p className="empty-log">No activity yet.</p>}
            {logs.map((log, i) => (
              <div key={i} className="log-entry">{log}</div>
            ))}
          </div>
        </section>
      </main>

      <style>{`
        :root {
          --orange: #ff5722;
          --blue: #2196f3;
          --white: #ffffff;
          --black: #000000;
          --gray: #eeeeee;
          --yellow: #fff9c4;
          --dark-gray: #333333;
        }

        body {
          background-color: var(--white);
          color: var(--black);
          font-family: 'Courier New', Courier, monospace;
          margin: 0;
          padding: 20px;
        }

        .container {
          border: 8px solid var(--black);
          padding: 20px;
          background-color: var(--white);
          box-shadow: 15px 15px 0px var(--black);
          max-width: 1000px;
          margin: 0 auto;
        }

        .brutalist-header {
          background-color: var(--orange);
          border: 4px solid var(--black);
          margin: -20px -20px 20px -20px;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        h1 {
          margin: 0;
          text-transform: uppercase;
          font-size: 2.5rem;
          color: var(--white);
          -webkit-text-stroke: 1.5px var(--black);
          letter-spacing: 2px;
        }

        .settings-toggle {
          background-color: var(--black);
          color: var(--white);
          border: 2px solid var(--white);
          padding: 5px 15px;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
        }

        h2 {
          text-transform: uppercase;
          border-bottom: 4px solid var(--black);
          padding-bottom: 10px;
          margin-top: 0;
        }

        .settings-section {
          border: 4px solid var(--black);
          padding: 15px;
          margin-bottom: 20px;
          background-color: var(--yellow);
        }

        .setting-item label {
          display: block;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .path-display {
          display: flex;
          gap: 10px;
        }

        .path-display input {
          flex-grow: 1;
          border: 2px solid var(--black);
          padding: 5px;
          background: #fff;
        }

        .brutalist-button.small {
          padding: 5px 15px;
          font-size: 0.9rem;
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

        .details {
          flex-grow: 1;
        }

        .details h2 {
          border: none;
          font-size: 1.5rem;
          margin: 0 0 10px 0;
        }

        .quality-selector {
          margin: 15px 0;
          border: 2px solid var(--black);
          padding: 10px;
          background-color: var(--gray);
        }

        .quality-selector label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
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

        .library-section {
          border: 4px solid var(--black);
          padding: 15px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
        }

        .library-list {
          max-height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .library-item {
          display: flex;
          gap: 15px;
          border: 3px solid var(--black);
          padding: 10px;
          background-color: var(--white);
          transition: transform 0.1s;
        }

        .library-item:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0px var(--black);
        }

        .item-thumb {
          width: 100px;
          height: auto;
          border: 2px solid var(--black);
        }

        .item-details {
          flex-grow: 1;
        }

        .item-title {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }

        .item-meta {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 10px;
        }

        .item-actions {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          background-color: var(--black);
          color: var(--white);
          border: none;
          padding: 5px 15px;
          text-transform: uppercase;
          font-weight: bold;
          cursor: pointer;
        }

        .action-btn:hover {
          background-color: var(--blue);
        }

        .log-section {
          border: 4px solid var(--black);
          background-color: var(--gray);
        }

        .log-section h3 {
          margin: 0;
          padding: 10px;
          background-color: var(--black);
          color: var(--white);
          text-transform: uppercase;
          font-size: 1rem;
        }

        .log-content {
          padding: 10px;
          max-height: 100px;
          overflow-y: auto;
          font-size: 0.8rem;
        }

        .log-entry {
          margin-bottom: 5px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 2px;
        }

        .empty-log, .empty-msg {
          color: #888;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}

export default App
