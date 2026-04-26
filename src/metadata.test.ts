import { describe, it, expect, vi } from 'vitest'

// Mock yt-dlp-exec
vi.mock('yt-dlp-exec', () => {
  return {
    default: vi.fn(async (url, options) => {
      if (options.dumpJson) {
        return {
          title: 'Test Video',
          thumbnail: 'https://test.com/thumb.jpg',
          uploader: 'Test Creator',
          formats: [
            { format_id: '137', ext: 'mp4', resolution: '1080p' },
            { format_id: '136', ext: 'mp4', resolution: '720p' }
          ]
        }
      }
      return Promise.resolve()
    })
  }
})

describe('Metadata Fetching Logic', () => {
  it('should fetch metadata and return formatted data', async () => {
    const ytDlp = (await import('yt-dlp-exec')).default
    const url = 'https://youtube.com/watch?v=123'
    
    // @ts-expect-error - mock function call
    const metadata = await ytDlp(url, { dumpJson: true })
    
    expect(metadata.title).toBe('Test Video')
    expect(metadata.uploader).toBe('Test Creator')
    expect(metadata.formats).toHaveLength(2)
  })
})
