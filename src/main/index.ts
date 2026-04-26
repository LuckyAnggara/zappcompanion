import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import bridgeApp from './bridge'
import ytDlp from 'yt-dlp-exec'

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

  // IPC Download Handler
  ipcMain.on('download-video', (event, url: string) => {
    const downloadPath = app.getPath('downloads')

    ytDlp(url, {
      output: join(downloadPath, '%(title)s.%(ext)s'),
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    })
      .then(() => {
        event.reply('download-complete', { status: 'success', url })
      })
      .catch(err => {
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
