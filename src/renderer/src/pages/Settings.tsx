import React, { useState, useEffect } from 'react'

interface AppSettings {
  downloadPath: string
}

export default function SettingsPage(): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings>({ downloadPath: '' })
  const [ytDlpVersion, setYtDlpVersion] = useState<string>('Checking...')
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')

  const loadData = async (): Promise<void> => {
    if (window.api) {
      const s = await window.api.getSettings()
      setSettings(s)
      const v = await window.api.getYtDlpVersion()
      setYtDlpVersion(v)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSelectDir = async (): Promise<void> => {
    const path = await window.api.selectDirectory()
    if (path) {
      const newSettings = { ...settings, downloadPath: path }
      await window.api.setSettings(newSettings)
      setSettings(newSettings)
    }
  }

  const handleUpdate = async (): Promise<void> => {
    setUpdating(true)
    setUpdateMsg('Updating yt-dlp binary...')
    try {
      const res = await window.api.updateYtDlp()
      if (res.success) {
        setYtDlpVersion(res.version || 'Updated')
        setUpdateMsg('Update successful!')
      } else {
        setUpdateMsg(`Update failed: ${res.error}`)
      }
    } catch (err: any) {
      setUpdateMsg(`Error: ${err.message}`)
    } finally {
      setUpdating(false)
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
          <h3>Binary Management</h3>
          <p>Current yt-dlp version: <strong>{ytDlpVersion}</strong></p>
          <button 
            onClick={handleUpdate} 
            className="btn-black" 
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update yt-dlp'}
          </button>
          {updateMsg && <p className="update-msg">{updateMsg}</p>}
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
