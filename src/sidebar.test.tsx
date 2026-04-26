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
  getMetadata: vi.fn(),
  getSettings: vi.fn(async () => ({ downloadPath: '' })),
  getHistory: vi.fn(async () => []),
}

describe('Sidebar Navigation', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders all three navigation icons', () => {
    render(<App />)
    // Check for icons (aria-hidden is true for Lucide, so we check link hrefs or tooltips)
    expect(screen.getByRole('link', { name: /Downloader/i })).toHaveAttribute('href', '#/downloader')
    expect(screen.getByRole('link', { name: /Library/i })).toHaveAttribute('href', '#/library')
    expect(screen.getByRole('link', { name: /Settings/i })).toHaveAttribute('href', '#/settings')
  })

  it('navigates to library page when library icon is clicked', async () => {
    render(<App />)
    const libraryLink = screen.getByRole('link', { name: /Library/i })
    fireEvent.click(libraryLink)
    
    await waitFor(() => {
      expect(screen.getByText(/Download Library/i)).toBeInTheDocument()
    })
  })

  it('navigates to settings page when settings icon is clicked', async () => {
    render(<App />)
    const settingsLink = screen.getByRole('link', { name: /Settings/i })
    fireEvent.click(settingsLink)
    
    await waitFor(() => {
      expect(screen.getByText(/About Bridge/i)).toBeInTheDocument()
    })
  })
})
