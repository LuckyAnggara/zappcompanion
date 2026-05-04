import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getSettings: () => Promise<any>
      setSettings: (settings: any) => Promise<boolean>
      selectDirectory: () => Promise<string | null>
      getHistory: () => Promise<any[]>
      deleteHistoryItem: (id: string, filePath: string) => Promise<{ success: boolean; error?: string }>
      getMetadata: (url: string) => Promise<any>
      openFile: (path: string) => Promise<void>
      showInFolder: (path: string) => Promise<void>
      getYtDlpVersion: () => Promise<string>
      updateYtDlp: () => Promise<{ success: boolean; version?: string; error?: string }>
      checkMuxer: () => Promise<boolean>
      downloadMuxer: () => Promise<{ success: boolean; error?: string }>
    }
  }
}
