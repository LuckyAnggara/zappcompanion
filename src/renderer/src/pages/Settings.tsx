import React, { useState, useEffect } from 'react'

interface AppSettings {
  downloadPath: string
  devMode: boolean
  unlockQuality: boolean
}

export default function SettingsPage(): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings>({ downloadPath: '', devMode: false, unlockQuality: false })
  const [engineVersion, setEngineVersion] = useState<string>('Checking...')
  const [muxerStatus, setMuxerStatus] = useState<string>('Checking...')
  const [appVersion, setAppVersion] = useState<string>('...')
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')

  const loadData = async (): Promise<void> => {
    if (window.api) {
      const s = await window.api.getSettings()
      setSettings(s)
      const ev = await window.api.getYtDlpVersion()
      setEngineVersion(ev)
      const av = await window.api.getAppVersion()
      setAppVersion(av)
      const hasMuxer = await window.api.checkMuxer()
      setMuxerStatus(hasMuxer ? 'Ready (Installed)' : 'Missing')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleManualUpdateCheck = async (): Promise<void> => {
    setUpdating(true)
    setUpdateMsg('Checking for system updates...')
    try {
      const res = await window.api.checkForUpdates()
      if (res.success) {
        setUpdateMsg('Check complete. See activity log for details.')
      } else {
        setUpdateMsg(`Check failed: ${res.error}`)
      }
    } catch (err: any) {
      setUpdateMsg(`Error: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleSelectDir = async (): Promise<void> => {
    const path = await window.api.selectDirectory()
    if (path) {
      const newSettings = { ...settings, downloadPath: path }
      await window.api.setSettings(newSettings)
      setSettings(newSettings)
    }
  }

  const handleUpdateEngine = async (): Promise<void> => {
    setUpdating(true)
    setUpdateMsg('Optimizing system core...')
    try {
      const res = await window.api.updateYtDlp()
      if (res.success) {
        setEngineVersion(res.version || 'Updated')
        setUpdateMsg('System optimization complete!')
      } else {
        setUpdateMsg(`Action failed: ${res.error}`)
      }
    } catch (err: any) {
      setUpdateMsg(`System Error: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleDownloadMuxer = async (): Promise<void> => {
    setUpdating(true)
    setUpdateMsg('Downloading Media Muxer...')
    try {
      const res = await window.api.downloadMuxer()
      if (res.success) {
        setMuxerStatus('Ready (Installed)')
        setUpdateMsg('Muxer installed successfully!')
      } else {
        setUpdateMsg(`Download failed: ${res.error}`)
      }
    } catch (err: any) {
      setUpdateMsg(`System Error: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-grid">
        <div className="setting-card">
          <h3>Storage Location</h3>
          <p>Choose where your clips will be saved on this device.</p>
          <div className="path-input-group">
            <input 
              type="text" 
              readOnly 
              value={settings.downloadPath || 'Default (System Downloads)'} 
            />
            <button onClick={handleSelectDir} className="btn-black">Change</button>
          </div>
        </div>

        <div className="setting-card">
          <h3>System Core</h3>
          <p>Status: <strong>Ready</strong></p>
          <p>Optimization Version: <strong>{engineVersion}</strong></p>
          <button 
            onClick={handleUpdateEngine} 
            className="btn-black" 
            disabled={updating}
          >
            {updating ? 'Optimizing...' : 'Optimize Core'}
          </button>
        </div>

        <div className="setting-card">
          <h3>Media Muxer</h3>
          <p>Status: <strong style={{ color: muxerStatus === 'Missing' ? 'var(--orange)' : 'inherit' }}>{muxerStatus}</strong></p>
          <p>Required for high-quality video & audio merging.</p>
          <button 
            onClick={handleDownloadMuxer} 
            className="btn-black" 
            disabled={updating || muxerStatus === 'Ready (Installed)'}
          >
            {updating ? 'Downloading...' : muxerStatus === 'Ready (Installed)' ? 'Muxer Installed' : 'Download Muxer'}
          </button>
        </div>

        <div className="setting-card">
          <h3>Download Preferences</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
            <input 
              type="checkbox" 
              checked={settings.unlockQuality || false} 
              onChange={async (e) => {
                const newSettings = { ...settings, unlockQuality: e.target.checked }
                await window.api.setSettings(newSettings)
                setSettings(newSettings)
              }} 
              style={{ width: '20px', height: '20px' }}
            />
            Unlock High Quality (Allow &gt; 1080p if available)
          </label>
        </div>

        <div className="setting-card">
          <h3>Developer Options</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
            <input 
              type="checkbox" 
              checked={settings.devMode || false} 
              onChange={async (e) => {
                const newSettings = { ...settings, devMode: e.target.checked }
                await window.api.setSettings(newSettings)
                setSettings(newSettings)
                window.dispatchEvent(new Event('settings-updated'))
              }} 
              style={{ width: '20px', height: '20px' }}
            />
            Enable Developer Mode (Shows API Documentation)
          </label>
        </div>

        <div className="setting-card">
          <h3>System Optimization</h3>
          <p>App Version: <strong>v{appVersion}</strong></p>
          <button 
            onClick={handleManualUpdateCheck} 
            className="btn-black" 
            disabled={updating}
          >
            {updating ? 'Checking...' : 'Check for Updates'}
          </button>
          {updateMsg && (
            <div className="status-banner" style={{ marginTop: '15px', backgroundColor: 'var(--yellow)', color: 'var(--black)' }}>
              {updateMsg}
            </div>
          )}
        </div>

        <div className="setting-card">
          <h3>About App</h3>
          <p>Zap Clipper Companion</p>
          <p>High-performance local processing engine.</p>
        </div>
      </div>
    </div>
  )
}
