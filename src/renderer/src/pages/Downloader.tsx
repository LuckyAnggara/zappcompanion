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

export default function DownloaderPage(): React.JSX.Element {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('Ready to bridge.')
  const [logs, setLogs] = useState<string[]>([])
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [selectedFormat, setSelectedFormat] = useState('best')

  useEffect(() => {
    if (!window.electron) return

    const handleComplete = (_event, arg): void => {
      setStatus(`Success: Downloaded ${arg.url}`)
      setLogs(prev => [...prev, `[SUCCESS] ${arg.url}`])
      setProgress(null)
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
      // In a real app we'd remove listeners
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

  const availableFormats = metadata?.formats
    ? metadata.formats
        .filter((f) => f.vcodec !== 'none' && f.resolution)
        .filter((v, i, a) => a.findIndex((t) => t.resolution === v.resolution) === i)
        .sort((a, b) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0))
    : []

  return (
    <section className="download-section">
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="brutalist-input"
        />
        <button onClick={handleFetchMetadata} className="brutalist-button" disabled={loading}>
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

      <div className="log-area">
        <h3>Activity Log</h3>
        <div className="log-content">
          {logs.length === 0 && <p className="empty-log">No activity yet.</p>}
          {logs.map((log, i) => (
            <div key={i} className="log-entry">{log}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
