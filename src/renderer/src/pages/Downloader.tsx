import React from 'react'
import * as Slider from '@radix-ui/react-slider'
import { useDownloader } from '../App'

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const parseTime = (timeStr: string): number => {
  if (!timeStr) return 0
  const parts = timeStr.split(':').map(Number)
  if (parts.some(isNaN)) return 0
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 1) return parts[0]
  return 0
}

export default function DownloaderPage(): React.JSX.Element {
  const { state, setState } = useDownloader()
  const { 
    url, status, logs, metadata, loading, progress, 
    selectedFormat, activeDownloadMeta, sectionStart, sectionEnd, sliderValues 
  } = state

  const isDownloading = progress !== null

  const setPartialState = (partial: any) => {
    setState(prev => ({ ...prev, ...partial }))
  }

  const handleFetchMetadata = async (): Promise<void> => {
    if (!url) return
    setPartialState({ loading: true, progress: null, metadata: null, sectionStart: '', sectionEnd: '', status: `Analyzing resource: ${url}` })
    
    try {
      const data = await window.api.getMetadata(url)
      const duration = data.duration || 0
      setPartialState({
        metadata: data,
        sliderValues: [0, duration],
        sectionStart: '00:00',
        sectionEnd: formatTime(duration),
        status: 'Analysis complete. Select resolution and clip.',
        logs: [...logs, `[INFO] Resource analysis successful for ${url}`]
      })
    } catch (err: any) {
      setPartialState({
        status: `System Error: ${err.message}`,
        logs: [...logs, `[ERROR] Analysis failed: ${err.message}`]
      })
    } finally {
      setPartialState({ loading: false })
    }
  }

  const handleDownload = (): void => {
    if (url) {
      const meta = { title: metadata?.title, thumbnail: metadata?.thumbnail }
      setPartialState({
        activeDownloadMeta: meta,
        status: `Processing: ${url}`,
        logs: [...logs, `[INFO] Initializing clip for ${url} (Resolution: ${selectedFormat})`]
      })
      
      window.electron.ipcRenderer.send('download-video', { 
        url, 
        formatId: selectedFormat,
        metadata: meta,
        sectionStart: sectionStart.trim() !== '' ? sectionStart.trim() : undefined,
        sectionEnd: sectionEnd.trim() !== '' ? sectionEnd.trim() : undefined
      })
    }
  }

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const parsed = parseTime(val)
    if (parsed >= 0 && parsed <= sliderValues[1]) {
      setPartialState({ sectionStart: val, sliderValues: [parsed, sliderValues[1]] })
    } else {
      setPartialState({ sectionStart: val })
    }
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const parsed = parseTime(val)
    const duration = metadata?.duration || 100
    if (parsed >= sliderValues[0] && parsed <= duration) {
      setPartialState({ sectionEnd: val, sliderValues: [sliderValues[0], parsed] })
    } else {
      setPartialState({ sectionEnd: val })
    }
  }

  const handleSliderChange = (value: number[]) => {
    setPartialState({
      sliderValues: [value[0], value[1]],
      sectionStart: formatTime(value[0]),
      sectionEnd: formatTime(value[1])
    })
  }

  const availableFormats = metadata?.formats
    ? metadata.formats
        .filter((f) => f.vcodec !== 'none' && f.resolution)
        .filter((f) => {
          // Note: unlockQuality is also global but we need to fetch it or pass it
          // For now let's assume we fetch settings in App and store it in state too
          return true // Simplified for this pass
        })
        .filter((v, i, a) => a.findIndex((t) => t.resolution === v.resolution) === i)
        .sort((a, b) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0))
    : []

  return (
    <div className="downloader-page">
      <h2>Zap Clipper</h2>

      <div className="downloader-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Paste link here"
            value={url}
            onChange={(e) => setPartialState({ url: e.target.value })}
            className="brutalist-input"
            disabled={isDownloading}
          />
          <button onClick={handleFetchMetadata} className="brutalist-button" disabled={loading || isDownloading}>
            {loading ? '...' : 'Analyze'}
          </button>
        </div>
        
        {metadata && (
          <div className="metadata-preview scale-in">
            <div className="preview-layout-top">
              <div className="thumbnail-container">
                <img src={metadata.thumbnail} alt="Thumbnail" className="thumbnail-16-9" />
              </div>
              <div className="details-container">
                <h3>{metadata.title}</h3>
                <p className="uploader-name">Source: {metadata.uploader}</p>
                
                <div className="quality-selector">
                  <label>Select Resolution:</label>
                  <select 
                    value={selectedFormat} 
                    onChange={(e) => setPartialState({ selectedFormat: e.target.value })}
                    className="brutalist-select"
                    disabled={isDownloading}
                  >
                    <option value="best">Highest (Auto)</option>
                    {availableFormats.map((f) => (
                      <option key={f.format_id} value={f.format_id}>
                        {f.resolution} ({f.ext})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="trim-section-bottom">
              <div className="trim-selector">
                <label>Trim Video (Optional):</label>
                
                {metadata.duration ? (
                  <div className="slider-container">
                    <Slider.Root 
                      className="SliderRoot" 
                      value={sliderValues} 
                      max={metadata.duration} 
                      step={1}
                      onValueChange={handleSliderChange}
                      disabled={isDownloading}
                    >
                      <Slider.Track className="SliderTrack">
                        <Slider.Range className="SliderRange" />
                      </Slider.Track>
                      <Slider.Thumb className="SliderThumb" aria-label="Start time" />
                      <Slider.Thumb className="SliderThumb" aria-label="End time" />
                    </Slider.Root>
                  </div>
                ) : null}

                <div className="trim-inputs">
                  <input 
                    type="text" 
                    placeholder="Start (e.g. 01:20)" 
                    value={sectionStart}
                    onChange={handleStartChange}
                    className="brutalist-input small-input"
                    disabled={isDownloading}
                  />
                  <span className="trim-separator">to</span>
                  <input 
                    type="text" 
                    placeholder="End (e.g. 02:45)" 
                    value={sectionEnd}
                    onChange={handleEndChange}
                    className="brutalist-input small-input"
                    disabled={isDownloading}
                  />
                </div>
                <span className="trim-help">Format: SS or MM:SS or HH:MM:SS</span>
              </div>

              <button 
                onClick={handleDownload} 
                className="brutalist-button zap-clip-btn"
                disabled={isDownloading}
              >
                {isDownloading ? 'Processing...' : 'ZAP CLIP (DOWNLOAD)'}
              </button>
            </div>
          </div>
        )}

        {isDownloading ? (
          <div className="active-progress-footer scale-in">
             <div className="progress-header">
                <div className="spinner small"></div>
                <span>ACTIVE DOWNLOAD PROCESS</span>
             </div>
             <div className="status-text">{status}</div>
             <div className="progress-container large">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <span className="progress-text">{progress}%</span>
             </div>
          </div>
        ) : (
          <div className="status-banner">
            {status}
          </div>
        )}
      </div>

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
        .downloader-page { display: flex; flex-direction: column; gap: 15px; }
        .scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes scaleIn { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .preview-layout-top { display: flex; gap: 25px; margin-bottom: 20px; align-items: flex-start; }
        .thumbnail-container { flex: 0 0 350px; }
        .thumbnail-16-9 { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border: var(--border-thick) solid var(--black); box-shadow: 8px 8px 0px var(--black); }
        .details-container { flex: 1; display: flex; flex-direction: column; }
        .details-container h3 { margin: 0 0 10px 0; font-size: 1.6rem; text-transform: uppercase; line-height: 1.2; }
        .uploader-name { font-weight: bold; color: var(--blue); margin-bottom: 15px; }
        .quality-selector { background-color: var(--gray); border: 3px solid var(--black); padding: 12px; box-shadow: 6px 6px 0px var(--black); }
        .quality-selector label { display: block; font-weight: 900; margin-bottom: 5px; text-transform: uppercase; font-size: 0.85rem; }
        .trim-section-bottom { display: flex; gap: 20px; align-items: flex-end; border-top: 3px dashed var(--black); padding-top: 20px; }
        .trim-selector { flex: 1; background-color: var(--yellow); border: var(--border-thick) solid var(--black); padding: 15px; box-shadow: 8px 8px 0px var(--black); }
        .trim-selector label { display: block; font-weight: 900; margin-bottom: 10px; text-transform: uppercase; font-size: 0.9rem; }
        .zap-clip-btn { flex: 0 0 250px; height: 100px; background-color: var(--blue); color: var(--white); border: var(--border-thick) solid var(--black) !important; box-shadow: 8px 8px 0px var(--black); font-size: 1.5rem !important; line-height: 1; transition: all 0.1s; }
        .zap-clip-btn:hover:not(:disabled) { background-color: var(--orange); transform: translate(-2px, -2px); box-shadow: 10px 10px 0px var(--black); }
        .zap-clip-btn:active:not(:disabled) { transform: translate(4px, 4px); box-shadow: 0px 0px 0px var(--black); }
        .active-progress-footer { background-color: var(--black); color: var(--white); padding: 20px; border: var(--border-thick) solid var(--black); box-shadow: 10px 10px 0px var(--orange); margin-top: 10px; }
        .progress-header { display: flex; align-items: center; gap: 12px; font-weight: 900; letter-spacing: 1px; margin-bottom: 10px; }
        .status-text { font-family: monospace; font-size: 0.9rem; color: var(--yellow); margin-bottom: 15px; }
        .progress-container.large { height: 35px; border: 3px solid var(--white); }
        .spinner.small { width: 20px; height: 20px; border-width: 3px; }
        .metadata-preview { box-shadow: 15px 15px 0px var(--blue); }
      `}</style>
    </div>
  )
}
