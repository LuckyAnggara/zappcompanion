import React, { useState, useEffect } from 'react'

interface Metadata {
  title: string
  thumbnail: string
  uploader: string
  formats: any[]
}

export default function DownloaderPage(): React.JSX.Element {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('Core system ready.')
  const [logs, setLogs] = useState<string[]>([])
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [selectedFormat, setSelectedFormat] = useState('best')
  const [activeDownloadMeta, setActiveDownloadMeta] = useState<any>(null)
  const [sectionStart, setSectionStart] = useState('')
  const [sectionEnd, setSectionEnd] = useState('')

  const isDownloading = progress !== null

  useEffect(() => {
    if (!window.electron) return

    const handleComplete = (_event: any, arg: any): void => {
      setStatus(`Success: Processed ${arg.url}`)
      setLogs(prev => [...prev, `[SUCCESS] ${arg.url}`])
      setProgress(null)
      setActiveDownloadMeta(null)
    }

    const handleError = (_event: any, arg: any): void => {
      setStatus(`Error: ${arg.message}`)
      setLogs(prev => [...prev, `[ERROR] ${arg.url}: ${arg.message}`])
      setProgress(null)
      setActiveDownloadMeta(null)
    }

    const handleProgress = (_event: any, arg: any): void => {
      setProgress(arg.progress)
    }

    const handleApiLog = (_event: any, msg: string): void => {
      setLogs(prev => [...prev, msg])
    }

    // Assign listeners
    window.electron.ipcRenderer.on('download-complete', handleComplete)
    window.electron.ipcRenderer.on('download-error', handleError)
    window.electron.ipcRenderer.on('download-progress', handleProgress)
    window.electron.ipcRenderer.on('api-log', handleApiLog)

    // CLEANUP FUNCTION: Remove listeners when component unmounts
    return () => {
      window.electron.ipcRenderer.removeAllListeners('download-complete')
      window.electron.ipcRenderer.removeAllListeners('download-error')
      window.electron.ipcRenderer.removeAllListeners('download-progress')
      window.electron.ipcRenderer.removeAllListeners('api-log')
    }
  }, [])

  const handleFetchMetadata = async (): Promise<void> => {
    if (!url) return
    setLoading(true)
    setProgress(null)
    setMetadata(null)
    setSectionStart('')
    setSectionEnd('')
    setStatus(`Analyzing resource: ${url}`)
    try {
      const data = await window.api.getMetadata(url)
      setMetadata(data)
      setStatus('Analysis complete. Select options and clip.')
      setLogs(prev => [...prev, `[INFO] Resource analysis successful for ${url}`])
    } catch (err: any) {
      setStatus(`System Error: ${err.message}`)
      setLogs(prev => [...prev, `[ERROR] Analysis failed: ${err.message}`])
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (): void => {
    if (url) {
      const meta = { title: metadata?.title, thumbnail: metadata?.thumbnail }
      setActiveDownloadMeta(meta)
      setStatus(`Processing: ${url}`)
      setLogs(prev => [...prev, `[INFO] Initializing clip for ${url} (Resolution: ${selectedFormat})`])
      
      window.electron.ipcRenderer.send('download-video', { 
        url, 
        formatId: selectedFormat,
        metadata: meta,
        sectionStart: sectionStart.trim() !== '' ? sectionStart.trim() : undefined,
        sectionEnd: sectionEnd.trim() !== '' ? sectionEnd.trim() : undefined
      })
      
      setMetadata(null)
      setUrl('')
    }
  }

  const availableFormats = metadata?.formats
    ? metadata.formats
        .filter((f) => f.vcodec !== 'none' && f.resolution)
        .filter((v, i, a) => a.findIndex((t) => t.resolution === v.resolution) === i)
        .sort((a, b) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0))
    : []

  return (
    <div className="downloader-page">
      <h2>Zap Clipper</h2>

      {!isDownloading ? (
        <div className="downloader-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Paste link here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="brutalist-input"
            />
            <button onClick={handleFetchMetadata} className="brutalist-button" disabled={loading}>
              {loading ? '...' : 'Analyze'}
            </button>
          </div>
          
          {metadata && (
            <div className="metadata-preview scale-in">
              <div className="preview-content">
                <img src={metadata.thumbnail} alt="Thumbnail" className="thumbnail" />
                <div className="details">
                  <h3>{metadata.title}</h3>
                  <p>Source: {metadata.uploader}</p>
                  
                  <div className="options-grid">
                    <div className="quality-selector">
                      <label>Select Resolution:</label>
                      <select 
                        value={selectedFormat} 
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="brutalist-select"
                      >
                        <option value="best">Highest (Auto)</option>
                        {availableFormats.map((f) => (
                          <option key={f.format_id} value={f.format_id}>
                            {f.resolution} ({f.ext})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="trim-selector">
                      <label>Trim Video (Optional):</label>
                      <div className="trim-inputs">
                        <input 
                          type="text" 
                          placeholder="Start (e.g. 01:20)" 
                          value={sectionStart}
                          onChange={(e) => setSectionStart(e.target.value)}
                          className="brutalist-input small-input"
                        />
                        <span className="trim-separator">to</span>
                        <input 
                          type="text" 
                          placeholder="End (e.g. 02:45)" 
                          value={sectionEnd}
                          onChange={(e) => setSectionEnd(e.target.value)}
                          className="brutalist-input small-input"
                        />
                      </div>
                      <span className="trim-help">Format: SS or MM:SS or HH:MM:SS</span>
                    </div>
                  </div>

                  <button onClick={handleDownload} className="brutalist-button download-btn">
                    Zap Clip
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="status-banner">
            {status}
          </div>
        </div>
      ) : (
        <div className="active-download-card">
          <div className="active-content">
            <div className="active-header">
               <div className="spinner"></div>
               <h3>Active Process</h3>
            </div>
            <div className="active-body">
              {activeDownloadMeta?.thumbnail && (
                <img src={activeDownloadMeta.thumbnail} alt="Thumb" className="active-thumb" />
              )}
              <div className="active-details">
                <div className="active-title">{activeDownloadMeta?.title || 'Processing...'}</div>
                <div className="status-text">{status}</div>
                <div className="progress-wrapper">
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    <span className="progress-text">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="log-area">
        <h3>System Activity</h3>
        <div className="log-content">
          {logs.length === 0 && <p className="empty-log">System idle.</p>}
          {logs.map((log, i) => (
            <div key={i} className="log-entry">{log}</div>
          ))}
        </div>
      </div>

      <style>{`
        .downloader-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .scale-in {
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .options-grid {
          display: flex;
          gap: 20px;
          margin: 15px 0;
        }

        .quality-selector, .trim-selector {
          flex: 1;
          background-color: var(--gray);
          border: 3px solid var(--black);
          padding: 15px;
        }
        
        .trim-selector {
          background-color: var(--yellow);
        }

        .quality-selector label, .trim-selector label {
          display: block;
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .trim-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .small-input {
          padding: 8px;
          font-size: 0.9rem;
          border: 3px solid var(--black);
          width: 100%;
        }

        .trim-separator {
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .trim-help {
          display: block;
          margin-top: 5px;
          font-size: 0.75rem;
          font-style: italic;
          color: #555;
        }

        /* Active Download View */
        .active-download-card {
          border: 6px solid var(--black);
          background-color: var(--black);
          color: var(--white);
          box-shadow: 15px 15px 0px var(--orange);
          margin-bottom: 30px;
          overflow: hidden;
        }

        .active-header {
          background-color: var(--orange);
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          border-bottom: 6px solid var(--black);
        }

        .active-header h3 {
          margin: 0;
          text-transform: uppercase;
          font-size: 1.5rem;
          color: var(--white);
          -webkit-text-stroke: 1px var(--black);
        }

        .active-body {
          padding: 20px;
          display: flex;
          gap: 25px;
          background-color: var(--white);
          color: var(--black);
        }

        .active-thumb {
          width: 200px;
          border: 4px solid var(--black);
        }

        .active-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .active-title {
          font-size: 1.4rem;
          font-weight: 900;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .status-text {
          font-weight: bold;
          color: var(--blue);
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        .progress-wrapper {
          width: 100%;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 4px solid var(--white);
          border-top-color: var(--black);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

