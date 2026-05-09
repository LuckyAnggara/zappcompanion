import express from 'express'
import cors from 'cors'
import { app as electronApp, BrowserWindow } from 'electron'
import { join } from 'path'
import ytDlp from 'yt-dlp-exec'
import store from './store'

// Fix for executing binary in production asar
const ytdlpExeName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
const binaryPath = !electronApp.isPackaged 
  ? undefined 
  : join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'yt-dlp-exec', 'bin', ytdlpExeName)

const binDir = join(electronApp.getPath('userData'), 'bin')
const ffmpegExeName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
const ffmpegPath = join(binDir, ffmpegExeName)

// @ts-expect-error - create exists in runtime but not in types
const core = binaryPath ? ytDlp.create(binaryPath) : ytDlp

// In-memory store for polling progress
const progressMap = new Map<string, { progress: number; status: string }>()

// Helper to send logs to UI
const logToUI = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  try {
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      windows.forEach(win => {
        win.webContents.send('api-log', `[BRIDGE] ${timestamp} - ${message}`)
      })
    }
  } catch (e) {}
}

const app = express()
const PORT = 4000

// Strict CORS
const allowedOrigins = [
  'https://zap-clipper.web.id',
  'https://zap-clipper.vercel.app',
  'https://zap-clipper.app',
  'https://zapclipper.com',
  'https://my-downloader-web.app',
  'http://localhost:3000',
  'http://localhost:5173'
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  })
)

app.use(express.json())

app.get('/ping', (_req, res) => {
  logToUI('Incoming check: GET /ping')
  res.json({ status: 'ok' })
})

app.get('/progress', (req, res) => {
  const { url } = req.query as { url: string }
  const data = progressMap.get(url) || { progress: 0, status: 'pending' }
  res.json(data)
})

app.get('/result', (req, res) => {
  const { url } = req.query as { url: string }
  logToUI(`Web App requesting file stream: GET /result (URL: ${url})`)

  const history = store.get('history') as any[]
  const item = history.find((h) => h.url === url)

  if (!item || !item.filePath) {
    logToUI(`Error: Result data not found in history for ${url}`)
    return res.status(404).json({ error: 'Download data not found' })
  }

  res.download(item.filePath, (err) => {
    if (err) {
      logToUI(`Error: Failed to stream file - ${err.message}`)
      if (!res.headersSent) res.status(500).send(err.message)
    } else {
      logToUI(`Success: File streamed to Web App for ${url}`)
    }
  })
})

app.get('/metadata', async (req, res) => {
  const { url } = req.query as { url: string }
  logToUI(`Incoming request: GET /metadata (URL: ${url})`)

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  try {
    const metadata = await core(url, {
      dumpJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    })
    logToUI(`Success: Metadata fetched for ${metadata.title}`)
    res.json(metadata)
  } catch (err: any) {
    logToUI(`Error: Failed to fetch metadata - ${err.message}`)
    res.status(500).json({ error: err.message })
  }
})

app.post('/download', async (req, res) => {
  const { url, formatId, sectionStart, sectionEnd } = req.body
  logToUI(`Incoming request: POST /download (URL: ${url})`)

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ status: 'error', message: 'Invalid URL' })
  }

  try {
    // 1. Get real filename before starting
    const metadata = await core(url, {
      dumpJson: true,
      noCheckCertificates: true,
      noWarnings: true
    })

    const settings = store.get('settings')
    const downloadDir = settings.downloadPath || (electronApp ? electronApp.getPath('downloads') : join(process.cwd(), 'downloads'))
    
    // Construct real file path
    const safeTitle = metadata.title.replace(/[\\/:*?"<>|]/g, '_')
    const finalFilePath = join(downloadDir, `${safeTitle}.mp4`)

    const options: any = {
      output: finalFilePath,
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
      mergeOutputFormat: 'mp4',
      newline: true,
      ffmpegLocation: ffmpegPath
    }

    const bestFormat = settings.unlockQuality ? 'bestvideo+bestaudio/best' : 'bestvideo[height<=1080]+bestaudio/best'
    if (formatId && formatId !== 'best') {
      options.format = `${formatId}+bestaudio/best`
    } else {
      options.format = bestFormat
    }

    if (sectionStart || sectionEnd) {
      const start = sectionStart || '0'
      const end = sectionEnd || 'inf'
      options.downloadSections = `*${start}-${end}`
      options.forceKeyframesAtCuts = true // Recommended for section downloads
    }

    progressMap.set(url, { progress: 0, status: 'downloading' })

    const dlProcess = core.exec(url, options)

    dlProcess.stdout?.on('data', (data: string) => {
      const line = data.toString()
      const match = line.match(/\[download\]\s+(\d+\.\d+)%/)
      if (match) {
        progressMap.set(url, { progress: parseFloat(match[1]), status: 'downloading' })
      }
    })

    dlProcess.then(() => {
      progressMap.set(url, { progress: 100, status: 'completed' })
      
      const history = store.get('history') as any[]
      const newItem = {
        id: Date.now().toString(),
        url,
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        filePath: finalFilePath,
        date: new Date().toISOString(),
        status: 'completed'
      }
      store.set('history', [newItem, ...history])
      
      logToUI(`Success: Download finished and recorded for ${url}`)
      setTimeout(() => progressMap.delete(url), 60000)
    }).catch((err: any) => {
      progressMap.set(url, { progress: 0, status: 'error' })
      logToUI(`Error: Download failed - ${err.message}`)
    })

    return res.json({ status: 'downloading', message: 'Process started.' })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
})

export default app
