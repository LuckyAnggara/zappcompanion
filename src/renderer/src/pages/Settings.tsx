import React, { useState, useEffect } from 'react'

interface AppSettings {
  downloadPath: string
}

export default function SettingsPage(): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings>({ downloadPath: '' })
  const [engineVersion, setEngineVersion] = useState<string>('Checking...')
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')

  const loadData = async (): Promise<void> => {
    if (window.api) {
      const s = await window.api.getSettings()
      setSettings(s)
      const v = await window.api.getYtDlpVersion()
      setEngineVersion(v)
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
    setUpdateMsg('Updating system core...')
    try {
      const res = await window.api.updateYtDlp()
      if (res.success) {
        setEngineVersion(res.version || 'Updated')
        setUpdateMsg('Optimization complete!')
      } else {
        setUpdateMsg(`Action failed: ${res.error}`)
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
          <p>Choose where your files will be saved on this device.</p>
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
          <h3>System Optimization</h3>
          <p>Current Engine Version: <strong>{engineVersion}</strong></p>
          <button 
            onClick={handleUpdate} 
            className="btn-black" 
            disabled={updating}
          >
            {updating ? 'Processing...' : 'Update Engine'}
          </button>
          {updateMsg && <p className="update-msg">{updateMsg}</p>}
        </div>

        <div className="setting-card">
          <h3>About App</h3>
          <p>YT Companion Bridge v1.0.0</p>
          <p>Optimized for high-speed local processing.</p>
        </div>
      </div>
    </div>
  )
}
