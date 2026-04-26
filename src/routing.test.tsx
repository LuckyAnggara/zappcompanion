/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
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
  getMetadata: vi.fn(),
  getSettings: vi.fn(async () => ({ downloadPath: '' })),
  getHistory: vi.fn(async () => []),
}

describe('App Routing', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders DownloaderPage by default (via redirect)', async () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Fetch/i })).toBeInTheDocument()
  })
})
