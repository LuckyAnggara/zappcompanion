import Store from 'electron-store'

interface AppSettings {
  downloadPath: string
  devMode: boolean
}

interface DownloadHistory {
  id: string
  url: string
  title: string
  thumbnail: string
  filePath: string
  date: string
  status: 'completed' | 'failed'
}

interface Schema {
  settings: AppSettings
  history: DownloadHistory[]
}

const store = new Store<Schema>({
  name: 'yt-dlp-bridge-settings',
  defaults: {
    settings: {
      downloadPath: '',
      devMode: false
    },
    history: []
  }
})

export default store
