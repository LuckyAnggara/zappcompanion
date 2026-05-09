import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: any) => ipcRenderer.invoke('set-settings', settings),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getHistory: () => ipcRenderer.invoke('get-history'),
  deleteHistoryItem: (id: string, filePath: string) => ipcRenderer.invoke('delete-history-item', id, filePath),
  getMetadata: (url: string) => ipcRenderer.invoke('get-metadata', url),
  openFile: (path: string) => ipcRenderer.invoke('open-file', path),
  showInFolder: (path: string) => ipcRenderer.invoke('show-in-folder', path),
  getYtDlpVersion: () => ipcRenderer.invoke('get-yt-dlp-version'),
  updateYtDlp: () => ipcRenderer.invoke('update-yt-dlp'),
  checkMuxer: () => ipcRenderer.invoke('check-muxer'),
  downloadMuxer: () => ipcRenderer.invoke('download-muxer'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
}
