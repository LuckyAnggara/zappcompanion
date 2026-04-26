import { expect, test, vi, beforeEach } from 'vitest'

// Mock electron-store
vi.mock('electron-store', () => {
  return {
    default: class {
      data = { settings: { downloadPath: '' }, history: [] }
      get(key: string) { return (this.data as any)[key] }
      set(key: string, val: any) { (this.data as any)[key] = val }
    }
  }
})

beforeEach(() => {
  vi.resetModules()
})

test('store manages settings correctly', async () => {
  const storeModule = await import('./main/store')
  const store = storeModule.default
  
  const newSettings = { downloadPath: '/custom/path' }
  store.set('settings', newSettings)
  expect(store.get('settings')).toEqual(newSettings)
})

test('store manages history correctly', async () => {
  const storeModule = await import('./main/store')
  const store = storeModule.default
  
  const historyItem = {
    id: '123',
    url: 'https://test.com',
    title: 'Test Video',
    thumbnail: 'test.jpg',
    filePath: '/path/to/test.mp4',
    date: new Date().toISOString(),
    status: 'completed'
  }
  
  store.set('history', [historyItem])
  const history = store.get('history')
  expect(history).toHaveLength(1)
  expect(history[0].id).toBe('123')
})
