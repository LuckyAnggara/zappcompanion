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
    on: vi.fn(),
    removeAllListeners: vi.fn()
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

describe('Sidebar Navigation', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders all three navigation icons', async () => {
    render(<App />)
    // Wait for startup modal to disappear
    await waitFor(() => {
      expect(screen.queryByText(/System Startup/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })

    expect(screen.getByRole('link', { name: /Clipper/i })).toHaveAttribute('href', '#/downloader')
    expect(screen.getByRole('link', { name: /Library/i })).toHaveAttribute('href', '#/library')
    expect(screen.getByRole('link', { name: /Settings/i })).toHaveAttribute('href', '#/settings')
    expect(screen.queryByRole('link', { name: /Documentation/i })).not.toBeInTheDocument()
  })

  it('navigates to library page when library icon is clicked', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.queryByText(/System Startup/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })

    const libraryLink = screen.getByRole('link', { name: /Library/i })
    fireEvent.click(libraryLink)
    
    await waitFor(() => {
      expect(screen.getByText(/Download Library/i)).toBeInTheDocument()
    })
  })

  it('navigates to settings page when settings icon is clicked', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.queryByText(/System Startup/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })

    const settingsLink = screen.getByRole('link', { name: /Settings/i })
    fireEvent.click(settingsLink)
    
    await waitFor(() => {
      expect(screen.getByText(/About App/i)).toBeInTheDocument()
    })
  })
})
