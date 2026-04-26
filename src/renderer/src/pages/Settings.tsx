import React, { useState, useEffect } from 'react'

interface AppSettings {
  downloadPath: string
}

export default function SettingsPage(): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings>({ downloadPath: '' })

  const loadSettings = async (): Promise<void> => {
    if (window.api) {
      const data = await window.api.getSettings()
      setSettings(data)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSelectDir = async (): Promise<void> => {
    const path = await window.api.selectDirectory()
    if (path) {
      const newSettings = { ...settings, downloadPath: path }
      await window.api.setSettings(newSettings)
      setSettings(newSettings)
    }
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-grid">
        <div className="setting-card">
          <h3>Download Location</h3>
          <p>Choose where your videos will be saved.</p>
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
          <h3>About Bridge</h3>
          <p>yt-dlp Companion App v1.0.0</p>
          <p>Powered by Electron + Vite + yt-dlp-exec</p>
        </div>
      </div>
    </div>
  )
}
