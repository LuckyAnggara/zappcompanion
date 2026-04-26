import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'

// We will implement the app in src/main/bridge.ts
// For now, these tests will fail because the file doesn't exist or is empty.

describe('Express Bridge API', () => {
  let app: any

  beforeAll(async () => {
    try {
      const module = await import('./main/bridge')
      app = module.default
    } catch (e) {
      // Expected to fail until bridge.ts is created
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
