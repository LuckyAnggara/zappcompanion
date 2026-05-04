import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, createWriteStream, rmSync } from 'fs'
import pkg from 'follow-redirects'
const { https } = pkg
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import updater from 'electron-updater'
const { autoUpdater } = updater
import bridgeApp from './bridge'
import ytDlp from 'yt-dlp-exec'
import store from './store'

// Setup paths for Engine and Muxer
const binDir = join(app.getPath('userData'), 'bin')
if (!existsSync(binDir)) mkdirSync(binDir, { recursive: true })

const ffmpegPath = join(binDir, 'ffmpeg.exe')

const binaryPath = !app.isPackaged 
  ? undefined 
  : join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe')

// @ts-expect-error - create exists in runtime
const core = binaryPath ? ytDlp.create(binaryPath) : ytDlp

const BRIDGE_PORT = 4000

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
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
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    const htmlPath = join(__dirname, '../renderer/index.html')
    mainWindow.loadFile(htmlPath)
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  bridgeApp.listen(BRIDGE_PORT, () => {
    console.log(`Bridge server listening on port ${BRIDGE_PORT}`)
  })

  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify()
    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Restart the app to apply the update?',
        buttons: ['Restart', 'Later']
      }).then((result) => {
        if (result.response === 0) autoUpdater.quitAndInstall()
      })
    })
  }

  // Assets Management IPC
  ipcMain.handle('check-muxer', async () => {
    return existsSync(ffmpegPath)
  })

  ipcMain.handle('download-muxer', async (event) => {
    const url = 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-win-64.zip'
    // Note: To keep it simple in this demo, we assume a direct exe download or simple zip.
    // For production, usually we point to a verified direct .exe mirror.
    const directExeUrl = 'https://github.com/eugeneware/ffmpeg-static/releases/latest/download/ffmpeg-win32-x64'
    
    return new Promise((resolve) => {
      https.get(directExeUrl, (response) => {
        if (response.statusCode !== 200) {
          resolve({ success: false, error: `Server returned ${response.statusCode}` })
          return
        }

        const file = createWriteStream(ffmpegPath)
        response.pipe(file)

        file.on('finish', () => {
          file.close()
          resolve({ success: true })
        })

        file.on('error', (err) => {
          resolve({ success: false, error: err.message })
        })
      }).on('error', (err) => {
        resolve({ success: false, error: err.message })
      })
    })
  })

  ipcMain.handle('get-settings', () => store.get('settings'))
  ipcMain.handle('set-settings', (_event, settings) => {
    store.set('settings', settings)
    return true
  })
  ipcMain.handle('select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (canceled) return null
    return filePaths[0]
  })
  ipcMain.handle('get-history', () => store.get('history'))
  
  ipcMain.handle('delete-history-item', async (_event, id: string, filePath: string) => {
    try {
      const history = store.get('history') as any[]
      store.set('history', history.filter(item => item.id !== id))
      if (existsSync(filePath)) {
        rmSync(filePath, { force: true })
      }
      return { success: true }
    } catch (err: any) {
      console.error('Delete error:', err)
      return { success: false, error: err.message }
    }
  })
  
  ipcMain.handle('get-metadata', async (_event, url: string) => {
    try {
      return await core(url, {
        dumpJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: ['referer:youtube.com', 'user-agent:googlebot']
      })
    } catch (err: any) {
      throw new Error(err.message)
    }
  })

  ipcMain.handle('open-file', async (_event, path: string) => { await shell.openPath(path) })
  ipcMain.handle('show-in-folder', async (_event, path: string) => { shell.showItemInFolder(path) })
  
  ipcMain.handle('get-yt-dlp-version', async () => {
    try {
      const version = await core('--version')
      return version.trim()
    } catch (err: any) { return 'Not Found' }
  })

  ipcMain.handle('update-yt-dlp', async () => {
    try {
      await core('-U')
      const newVersion = await core('--version')
      return { success: true, version: newVersion.trim() }
    } catch (err: any) { return { success: false, error: err.message } }
  })

  ipcMain.on('download-video', (event, { url, formatId, metadata }) => {
    const settings = store.get('settings')
    const downloadPath = settings.downloadPath || app.getPath('downloads')
    const options: any = {
      output: join(downloadPath, '%(title)s.%(ext)s'),
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
      mergeOutputFormat: 'mp4',
      newline: true,
      ffmpegLocation: ffmpegPath // Use our downloaded/managed ffmpeg
    }
    if (formatId) options.format = formatId === 'best' ? 'bestvideo+bestaudio/best' : `${formatId}+bestaudio/best`

    const dlProcess = core.exec(url, options)
    dlProcess.stdout?.on('data', (data: string) => {
      const match = data.toString().match(/\[download\]\s+(\d+\.\d+)%/)
      if (match) event.reply('download-progress', { url, progress: parseFloat(match[1]) })
    })
    dlProcess.then(() => {
      const history = store.get('history') as any[]
      store.set('history', [{ id: Date.now().toString(), url, title: metadata?.title || 'Video', thumbnail: metadata?.thumbnail || '', filePath: downloadPath, date: new Date().toISOString(), status: 'completed' }, ...history])
      event.reply('download-complete', { status: 'success', url })
    }).catch((err: any) => {
      event.reply('download-error', { status: 'error', message: err.message, url })
    })
  })

  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
