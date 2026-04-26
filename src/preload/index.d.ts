import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getSettings: () => Promise<any>
      setSettings: (settings: any) => Promise<boolean>
      selectDirectory: () => Promise<string | null>
      getHistory: () => Promise<any[]>
      getMetadata: (url: string) => Promise<any>
      openFile: (path: string) => Promise<void>
      showInFolder: (path: string) => Promise<void>
    }
  }
}
