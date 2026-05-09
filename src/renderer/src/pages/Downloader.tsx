import React from 'react'
import * as Slider from '@radix-ui/react-slider'
import { useDownloader } from '../App'

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00'
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
        sectionStart: '00:00:00',
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
    setPartialState({ sectionStart: val })
    const parsed = parseTime(val)
    if (parsed >= 0 && parsed <= sliderValues[1]) {
      setPartialState({ sectionStart: val, sliderValues: [parsed, sliderValues[1]] })
    }
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPartialState({ sectionEnd: val })
    const parsed = parseTime(val)
    const duration = metadata?.duration || 100
    if (parsed >= sliderValues[0] && parsed <= duration) {
      setPartialState({ sectionEnd: val, sliderValues: [sliderValues[0], parsed] })
    }
  }

  const handleSliderChange = (value: number[]) => {
    setPartialState({
      sliderValues: [value[0], value[1]],
      sectionStart: formatTime(value[0]),
      sectionEnd: formatTime(value[1])
    })
  }

  const newDurationSeconds = sliderValues[1] - sliderValues[0]

  const availableFormats = metadata?.formats
    ? metadata.formats
        .filter((f) => f.vcodec !== 'none' && f.resolution)
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
                <div className="duration-overlay">{formatTime(metadata.duration || 0)}</div>
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

            <div className="timeline-section">
              <div className="timeline-header">
                 <label>CLIP TIMELINE</label>
                 <div className="new-duration-badge">
                   NEW DURATION: {formatTime(newDurationSeconds)}
                 </div>
              </div>
              
              <div className="timeline-wrapper">
                <div className="timeline-ruler">
                   {/* Visual ticks for the timeline */}
                   {[...Array(10)].map((_, i) => <div key={i} className="ruler-tick"></div>)}
                </div>
                
                <Slider.Root 
                  className="TimelineRoot" 
                  value={sliderValues} 
                  max={metadata.duration || 100} 
                  step={1}
                  onValueChange={handleSliderChange}
                  disabled={isDownloading}
                >
                  <Slider.Track className="TimelineTrack">
                    <Slider.Range className="TimelineRange" />
                  </Slider.Track>
                  <Slider.Thumb className="TimelineThumb" aria-label="Start point">
                     <div className="thumb-handle-line"></div>
                     <div className="thumb-label">START: {formatTime(sliderValues[0])}</div>
                  </Slider.Thumb>
                  <Slider.Thumb className="TimelineThumb" aria-label="End point">
                     <div className="thumb-handle-line"></div>
                     <div className="thumb-label end">END: {formatTime(sliderValues[1])}</div>
                  </Slider.Thumb>
                </Slider.Root>
              </div>

              <div className="trim-manual-inputs">
                <div className="manual-field">
                  <label>Manual Start</label>
                  <input 
                    type="text" 
                    value={sectionStart}
                    onChange={handleStartChange}
                    className="brutalist-input small-input"
                    disabled={isDownloading}
                  />
                </div>
                <div className="manual-field">
                  <label>Manual End</label>
                  <input 
                    type="text" 
                    value={sectionEnd}
                    onChange={handleEndChange}
                    className="brutalist-input small-input"
                    disabled={isDownloading}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleDownload} 
              className="brutalist-button zap-clip-btn"
              disabled={isDownloading}
            >
              {isDownloading ? 'PROCESSING...' : 'ZAP CLIP (DOWNLOAD)'}
            </button>
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
        .thumbnail-container { flex: 0 0 350px; position: relative; }
        .thumbnail-16-9 { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border: var(--border-thick) solid var(--black); box-shadow: 8px 8px 0px var(--black); }
        .duration-overlay { position: absolute; bottom: 15px; right: 15px; background: var(--black); color: var(--white); padding: 2px 8px; font-weight: 900; font-size: 0.8rem; border: 2px solid var(--white); }
        
        .details-container { flex: 1; display: flex; flex-direction: column; }
        .details-container h3 { margin: 0 0 10px 0; font-size: 1.6rem; text-transform: uppercase; line-height: 1.2; }
        .uploader-name { font-weight: bold; color: var(--blue); margin-bottom: 15px; }
        .quality-selector { background-color: var(--gray); border: 3px solid var(--black); padding: 12px; box-shadow: 6px 6px 0px var(--black); }
        .quality-selector label { display: block; font-weight: 900; margin-bottom: 5px; text-transform: uppercase; font-size: 0.85rem; }

        /* Timeline Section */
        .timeline-section {
          background-color: var(--white);
          border: var(--border-thick) solid var(--black);
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 10px 10px 0px var(--black);
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .timeline-header label { font-weight: 900; text-transform: uppercase; font-size: 1.4rem; letter-spacing: 1px; }
        
        .new-duration-badge {
          background-color: var(--black);
          color: var(--yellow);
          padding: 8px 20px;
          font-weight: 900;
          border: 4px solid var(--orange);
          font-size: 1rem;
        }

        .timeline-wrapper {
          position: relative;
          margin-bottom: 60px;
          padding: 0 15px;
        }

        .timeline-ruler {
          position: absolute;
          top: 15px;
          left: 15px;
          right: 15px;
          height: 12px;
          display: flex;
          justify-content: space-between;
          z-index: 0;
          pointer-events: none;
        }

        .ruler-tick {
          width: 2px;
          height: 100%;
          background-color: var(--black);
          opacity: 0.2;
        }

        .TimelineRoot { position: relative; display: flex; align-items: center; user-select: none; touch-action: none; width: 100%; height: 40px; z-index: 10; }
        .TimelineTrack { background-color: #eee; border: 3px solid var(--black); position: relative; flex-grow: 1; height: 16px; box-shadow: inset 2px 2px 0px rgba(0,0,0,0.1); }
        .TimelineRange { position: absolute; background-color: var(--blue); height: 100%; border-left: 2px solid var(--black); border-right: 2px solid var(--black); }
        
        .TimelineThumb {
          display: block;
          width: 32px;
          height: 48px;
          background-color: var(--orange);
          border: 4px solid var(--black);
          cursor: grab;
          position: relative;
          box-shadow: 4px 4px 0px var(--black);
        }
        .TimelineThumb:hover { background-color: var(--white); }
        .TimelineThumb:focus { outline: none; box-shadow: 0 0 0 4px var(--yellow), 4px 4px 0px var(--black); }

        .thumb-handle-line {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 4px;
          height: 20px;
          background: var(--black);
        }

        .thumb-label {
          position: absolute;
          top: 55px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--black);
          color: var(--white);
          font-size: 0.8rem;
          padding: 4px 10px;
          font-weight: 900;
          white-space: nowrap;
          border: 2px solid var(--white);
          box-shadow: 3px 3px 0px var(--orange);
        }
        .thumb-label.end { background: var(--blue); box-shadow: 3px 3px 0px var(--black); }

        .trim-manual-inputs { display: flex; gap: 20px; border-top: 3px dashed var(--gray); padding-top: 20px; }
        .manual-field { flex: 1; }
        .manual-field label { display: block; font-size: 0.9rem; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; }
        .small-input { border: 3px solid var(--black); padding: 12px; font-weight: 900; font-size: 1.1rem; }

        .zap-clip-btn { width: 100%; height: 100px; background-color: var(--blue); color: var(--white); border: var(--border-thick) solid var(--black) !important; box-shadow: 10px 10px 0px var(--black); font-size: 2.2rem !important; font-weight: 900; margin-top: 15px; transition: all 0.1s; letter-spacing: 2px; }
        .zap-clip-btn:hover:not(:disabled) { background-color: var(--orange); transform: translate(-4px, -4px); box-shadow: 14px 14px 0px var(--black); }
        .zap-clip-btn:active:not(:disabled) { transform: translate(6px, 6px); box-shadow: 0px 0px 0px var(--black); }

        .active-progress-footer { background-color: var(--black); color: var(--white); padding: 25px; border: var(--border-thick) solid var(--black); box-shadow: 15px 15px 0px var(--orange); margin-top: 15px; }
        .progress-header { display: flex; align-items: center; gap: 15px; font-weight: 900; font-size: 1.2rem; letter-spacing: 2px; margin-bottom: 15px; }
        .status-text { font-family: monospace; font-size: 1rem; color: var(--yellow); margin-bottom: 20px; text-transform: uppercase; }
        .progress-container.large { height: 45px; border: 4px solid var(--white); background-color: #222; }
        .spinner.small { width: 24px; height: 24px; border-width: 4px; }
      `}</style>
    </div>
  )
}
