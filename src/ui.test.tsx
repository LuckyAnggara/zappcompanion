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
    on: vi.fn(),
    removeAllListeners: vi.fn()
  }
}

// @ts-expect-error - mock window
window.api = {
  getMetadata: vi.fn(),
  getSettings: vi.fn(async () => ({ downloadPath: '' })),
  getHistory: vi.fn(async () => []),
  getYtDlpVersion: vi.fn(async () => '2025.01.01'),
  updateYtDlp: vi.fn(async () => ({ success: true, version: '2025.01.01' })),
  checkMuxer: vi.fn(async () => true),
  downloadMuxer: vi.fn(async () => ({ success: true }))
}

describe('UI Regression Tests (Temporary Commented out during overhaul)', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders app logo in sidebar', async () => {
    render(<App />)
    // There are two 'ZC' logos now (one in startup, one in sidebar)
    const logos = await screen.findAllByText(/ZC/i)
    expect(logos.length).toBeGreaterThan(0)
  })
})
