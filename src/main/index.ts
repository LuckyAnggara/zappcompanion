import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import bridgeApp from './bridge'
import ytDlp from 'yt-dlp-exec'
import store from './store'

const BRIDGE_PORT = 4000

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log('Loading URL:', process.env['ELECTRON_RENDERER_URL'])
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    const htmlPath = join(__dirname, '../renderer/index.html')
    console.log('Loading File:', htmlPath)
    mainWindow.loadFile(htmlPath)
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Start Express Bridge
  bridgeApp.listen(BRIDGE_PORT, () => {
    console.log(`Bridge server listening on port ${BRIDGE_PORT}`)
  })

  // Settings IPC
  ipcMain.handle('get-settings', () => {
    return store.get('settings')
  })

  ipcMain.handle('set-settings', (_event, settings) => {
    store.set('settings', settings)
    return true
  })

  ipcMain.handle('select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (canceled) return null
    return filePaths[0]
  })

  // History IPC
  ipcMain.handle('get-history', () => {
    return store.get('history')
  })

  // Metadata IPC
  ipcMain.handle('get-metadata', async (_event, url: string) => {
    try {
      const metadata = await ytDlp(url, {
        dumpJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: ['referer:youtube.com', 'user-agent:googlebot']
      })
      return metadata
    } catch (err: any) {
      throw new Error(err.message)
    }
  })

  // IPC Download Handler
  ipcMain.on('download-video', (event, { url, formatId, metadata }: { url: string; formatId?: string; metadata?: any }) => {
    const settings = store.get('settings')
    const downloadPath = settings.downloadPath || app.getPath('downloads')

    const options: any = {
      output: join(downloadPath, '%(title)s.%(ext)s'),
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
      mergeOutputFormat: 'mp4',
      newline: true
    }

    if (formatId) {
      options.format = formatId === 'best' ? 'bestvideo+bestaudio/best' : `${formatId}+bestaudio/best`
    }

    const process = ytDlp.exec(url, options)

    process.stdout?.on('data', (data: string) => {
      const line = data.toString()
      const match = line.match(/\[download\]\s+(\d+\.\d+)%/)
      if (match) {
        const progress = parseFloat(match[1])
        event.reply('download-progress', { url, progress })
      }
    })

    process.stderr?.on('data', (data: string) => {
      console.error('yt-dlp stderr:', data.toString())
    })

    process.then(() => {
      // Add to history after successful download
      const history = store.get('history') as any[]
      const newItem = {
        id: Date.now().toString(),
        url,
        title: metadata?.title || 'Downloaded Video',
        thumbnail: metadata?.thumbnail || '',
        filePath: downloadPath,
        date: new Date().toISOString(),
        status: 'completed'
      }
      store.set('history', [newItem, ...history])

      event.reply('download-complete', { status: 'success', url })
    }).catch(err => {
      event.reply('download-error', { status: 'error', message: err.message, url })
    })
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
