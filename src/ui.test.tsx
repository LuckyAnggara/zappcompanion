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

describe('Brutalist UI with Library and Settings', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders library items from history', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/Old Video/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Play/i })).toBeInTheDocument()
    })
  })

  it('toggles settings section', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: /Settings/i })
    fireEvent.click(toggle)
    expect(screen.getByText(/Download Location:/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Close Settings/i }))
    expect(screen.queryByText(/Download Location:/i)).not.toBeInTheDocument()
  })

  it('calls directory selector when changing path', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }))
    const changeBtn = screen.getByRole('button', { name: /Change/i })
    fireEvent.click(changeBtn)
    expect(window.api.selectDirectory).toHaveBeenCalled()
  })
})
