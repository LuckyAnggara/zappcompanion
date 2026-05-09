/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react'
import React from 'react'
import DownloaderPage from './renderer/src/pages/Downloader'
import { DownloaderProvider } from './renderer/src/App'
import '@testing-library/jest-dom/vitest'

// Mock ResizeObserver for Radix UI Slider
global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
}

// Mock Electron IPC & API
let ipcHandlers: Record<string, any> = {}
// @ts-expect-error - mock window
window.electron = {
  ipcRenderer: {
    send: vi.fn(),
    on: vi.fn((channel, cb) => {
      ipcHandlers[channel] = cb
    }),
    removeAllListeners: vi.fn((channel) => {
      delete ipcHandlers[channel]
    })
  }
}

// @ts-expect-error - mock window
window.api = {
  getSettings: vi.fn(async () => ({ downloadPath: '', devMode: false, unlockQuality: false })),
  getMetadata: vi.fn(async () => ({
    title: 'Test Video',
    thumbnail: 'test.jpg',
    uploader: 'Test Creator',
    formats: [{ format_id: '137', resolution: '1080p', ext: 'mp4', vcodec: 'avc1' }],
    duration: 3600
  })),
  getAppVersion: vi.fn(async () => '1.1.3'),
}

describe('Downloader Page Transitions', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    ipcHandlers = {}
  })

  it('shows persistent metadata and progress when downloading starts', async () => {
    render(
      <DownloaderProvider>
        <DownloaderPage />
      </DownloaderProvider>
    )
    
    // 1. Fetch metadata
    const input = screen.getByPlaceholderText(/Paste link here/i)
    fireEvent.change(input, { target: { value: 'https://youtube.com/test' } })
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }))
    
    await waitFor(() => expect(screen.getByText(/Test Video/i)).toBeInTheDocument())
    
    // 2. Start download
    fireEvent.click(screen.getByRole('button', { name: /ZAP CLIP \(DOWNLOAD\)/i }))
    
    // 3. Simulate progress event
    act(() => {
      if (ipcHandlers['download-progress']) {
        ipcHandlers['download-progress']({}, { url: 'https://youtube.com/test', progress: 50.5 })
      }
    })
    
    // 4. Verify UI state
    await waitFor(() => {
      // Input form should remain but button should be 'Processing...'
      expect(screen.getByRole('button', { name: /Processing.../i })).toBeDisabled()
      // Progress bar should be visible
      expect(screen.getByText(/50.5%/i)).toBeInTheDocument()
      expect(screen.getByText(/ACTIVE DOWNLOAD PROCESS/i)).toBeInTheDocument()
      // Metadata should still be visible
      expect(screen.getByText(/Test Video/i)).toBeInTheDocument()
    })
  })

  it('restores button state when download completes', async () => {
    render(
      <DownloaderProvider>
        <DownloaderPage />
      </DownloaderProvider>
    )
    
    // 1. Trigger download state
    const input = screen.getByPlaceholderText(/Paste link here/i)
    fireEvent.change(input, { target: { value: 'https://youtube.com/test' } })
    fireEvent.click(screen.getByRole('button', { name: /Analyze/i }))
    await waitFor(() => expect(screen.getByText(/Test Video/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /ZAP CLIP \(DOWNLOAD\)/i }))
    
    act(() => {
      if (ipcHandlers['download-progress']) {
        ipcHandlers['download-progress']({}, { url: 'https://youtube.com/test', progress: 99.9 })
      }
    })
    
    await waitFor(() => expect(screen.getByRole('button', { name: /Processing.../i })).toBeInTheDocument())

    // 2. Simulate complete
    act(() => {
      if (ipcHandlers['download-complete']) {
        ipcHandlers['download-complete']({}, { url: 'https://youtube.com/test' })
      }
    })

    // 3. Verify restore
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ZAP CLIP \(DOWNLOAD\)/i })).not.toBeDisabled()
      expect(screen.getByText(/Success: Processed/i)).toBeInTheDocument()
    })
  })
})
