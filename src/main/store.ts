import Store from 'electron-store'

interface AppSettings {
  downloadPath: string
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
  defaults: {
    settings: {
      downloadPath: ''
    },
    history: []
  }
})

export default store
