import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: any) => ipcRenderer.invoke('set-settings', settings),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getHistory: () => ipcRenderer.invoke('get-history'),
  getMetadata: (url: string) => ipcRenderer.invoke('get-metadata', url),
  openFile: (path: string) => ipcRenderer.invoke('open-file', path),
  showInFolder: (path: string) => ipcRenderer.invoke('show-in-folder', path)
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
