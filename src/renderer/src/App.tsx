import React, { useState, useEffect } from 'react'

function App(): React.JSX.Element {
  console.log('App rendering...')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('Ready to bridge.')
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    if (!window.electron) {
      setStatus('Error: window.electron is undefined. Check preload script.')
      return
    }

    const handleComplete = (_event, arg): void => {
      setStatus(`Success: Downloaded ${arg.url}`)
      setLogs(prev => [...prev, `[SUCCESS] ${arg.url}`])
    }

    const handleError = (_event, arg): void => {
      setStatus(`Error: ${arg.message}`)
      setLogs(prev => [...prev, `[ERROR] ${arg.url}: ${arg.message}`])
    }

    window.electron.ipcRenderer.on('download-complete', handleComplete)
    window.electron.ipcRenderer.on('download-error', handleError)

    return () => {
      // Note: In real app we might need to remove specific listeners if electronAPI supports it
    }
  }, [])

  const handleDownload = (): void => {
    if (url) {
      setStatus(`Starting download for: ${url}`)
      setLogs(prev => [...prev, `[INFO] Requesting ${url}`])
      window.electron.ipcRenderer.send('download-video', url)
      setUrl('')
    }
  }

  return (
    <div className="container">
      <header className="brutalist-header">
        <h1>yt-dlp Bridge</h1>
      </header>
      
      <main className="brutalist-main">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter video URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="brutalist-input"
          />
          <button onClick={handleDownload} className="brutalist-button">
            Download
          </button>
        </div>
        
        <div className="status-banner">
          {status}
        </div>

        <div className="log-area">
          <h3>Activity Log</h3>
          <div className="log-content">
            {logs.length === 0 && <p className="empty-log">No activity yet.</p>}
            {logs.map((log, i) => (
              <div key={i} className="log-entry">{log}</div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        :root {
          --orange: #ff5722;
          --blue: #2196f3;
          --white: #ffffff;
          --black: #000000;
          --gray: #eeeeee;
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
        }

        .brutalist-header {
          background-color: var(--orange);
          border: 4px solid var(--black);
          margin: -20px -20px 20px -20px;
          padding: 15px 20px;
        }

        h1 {
          margin: 0;
          text-transform: uppercase;
          font-size: 3rem;
          color: var(--white);
          -webkit-text-stroke: 2px var(--black);
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
          background-color: #fff9c4;
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

        .brutalist-button:hover {
          background-color: #1976d2;
        }

        .brutalist-button:active {
          background-color: var(--black);
        }

        .status-banner {
          background-color: var(--black);
          color: var(--orange);
          padding: 10px;
          font-weight: bold;
          margin-bottom: 20px;
          text-transform: uppercase;
          border-left: 10px solid var(--blue);
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
          max-height: 200px;
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
      `}</style>
    </div>
  )
}

export default App
