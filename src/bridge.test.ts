import { describe, it, expect, beforeAll, vi } from 'vitest'
import request from 'supertest'

// Mock Electron and Store before importing bridge
vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/mock/downloads') }
}))

vi.mock('electron-store', () => {
  return {
    default: class {
      get() { return { downloadPath: '' } }
      set() { }
    }
  }
})

describe('Express Bridge API', () => {
  let app: any

  beforeAll(async () => {
    try {
      const module = await import('./main/bridge')
      app = module.default
    } catch (e) {
      console.error(e)
    }
  })

  it('GET /ping should return status ok', async () => {
    if (!app) throw new Error('App not initialized')
    const response = await request(app).get('/ping')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('POST /download should validate URL and return downloading status', async () => {
    if (!app) throw new Error('App not initialized')
    const response = await request(app)
      .post('/download')
      .send({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
    
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('downloading')
  })

  it('POST /download should return 400 for invalid URL', async () => {
    if (!app) throw new Error('App not initialized')
    const response = await request(app)
      .post('/download')
      .send({ url: 'invalid-url' })
    
    expect(response.status).toBe(400)
  })
})
