import express from 'express'
import cors from 'cors'
import { app as electronApp } from 'electron'
import { join } from 'path'
import ytDlp from 'yt-dlp-exec'

const app = express()
const PORT = 4000

// Strict CORS: Allow only specified origins
const allowedOrigins = [
  'https://my-downloader-web.app',
  'http://localhost:3000',
  'http://localhost:5173' // Vite default
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
  res.json({ status: 'ok' })
})

app.post('/download', async (req, res) => {
  const { url } = req.body

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ status: 'error', message: 'Invalid URL' })
  }

  // Determine download path (user's Downloads folder)
  const downloadPath = electronApp ? electronApp.getPath('downloads') : join(process.cwd(), 'downloads')

  // Trigger yt-dlp download in the background
  // For now, we just trigger it and return immediately as requested
  ytDlp(url, {
    output: join(downloadPath, '%(title)s.%(ext)s'),
    noCheckCertificates: true,
    noWarnings: true,
    addHeader: ['referer:youtube.com', 'user-agent:googlebot']
  }).catch((err) => {
    console.error('yt-dlp error:', err)
  })

  return res.json({ status: 'downloading', message: 'Unduhan dimulai di latar belakang.' })
})

export default app
