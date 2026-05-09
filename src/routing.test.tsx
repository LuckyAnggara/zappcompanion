/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
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
  getSettings: vi.fn(async () => ({ downloadPath: '', devMode: false, unlockQuality: false })),
  getHistory: vi.fn(async () => []),
  getYtDlpVersion: vi.fn(async () => '2025.01.01'),
  updateYtDlp: vi.fn(async () => ({ success: true, version: '2025.01.01' })),
  checkMuxer: vi.fn(async () => true),
  downloadMuxer: vi.fn(async () => ({ success: true })),
  getAppVersion: vi.fn(async () => '1.0.7'),
  checkForUpdates: vi.fn(async () => ({ success: true }))
}

describe('App Routing', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders DownloaderPage by default (via redirect)', async () => {
    render(<App />)
    
    // 1. Wait for startup to finish
    await waitFor(() => {
      expect(screen.queryByText(/System Startup/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // 2. Wait for the DownloaderPage content to appear (Analyze button)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Analyze/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
