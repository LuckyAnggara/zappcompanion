import { expect, test, vi } from 'vitest'

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

test('store defaults and updates', async () => {
  const storeModule = await import('./main/store')
  const store = storeModule.default
  
  expect(store.get('settings').downloadPath).toBe('')
  
  store.set('settings', { downloadPath: '/downloads' })
  expect(store.get('settings').downloadPath).toBe('/downloads')
  
  const historyItem = { id: '1', title: 'Test', status: 'completed' }
  store.set('history', [historyItem])
  expect(store.get('history')).toHaveLength(1)
  expect(store.get('history')[0].title).toBe('Test')
})
