/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import React from 'react'
import App from './renderer/src/App'
import '@testing-library/jest-dom/vitest'

// Mock Electron IPC & API
// @ts-expect-error - mock window
window.electron = {
  ipcRenderer: {
    send: vi.fn(),
    on: vi.fn()
  }
}

// @ts-expect-error - mock window
window.api = {
  getMetadata: vi.fn(async () => ({
    title: 'Test Video',
    thumbnail: 'test.jpg',
    uploader: 'Test Creator',
    formats: []
  })),
  getSettings: vi.fn(async () => ({ downloadPath: '' })),
  setSettings: vi.fn(),
  selectDirectory: vi.fn(),
  getHistory: vi.fn(async () => [
    { id: '1', title: 'Old Video', filePath: '/path/1', date: new Date().toISOString(), status: 'completed' }
  ]),
  openFile: vi.fn(),
  showInFolder: vi.fn()
}

describe('UI Regression Tests (Temporary Commented out during overhaul)', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders app logo in sidebar', async () => {
    render(<App />)
    expect(screen.getByText(/YT/i)).toBeInTheDocument()
  })
})
