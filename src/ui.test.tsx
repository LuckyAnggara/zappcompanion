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
  getHistory: vi.fn(async () => [])
}

describe('Brutalist UI components', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders title, input, and fetch button', () => {
    render(<App />)
    expect(screen.getByText(/yt-dlp Bridge/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter video URL/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fetch/i })).toBeInTheDocument()
  })

  it('updates input value on change', () => {
    render(<App />)
    const input = screen.getByPlaceholderText(/Enter video URL/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'https://youtube.com/test' } })
    expect(input.value).toBe('https://youtube.com/test')
  })

  it('fetches metadata and then shows download button', async () => {
    render(<App />)
    const input = screen.getByPlaceholderText(/Enter video URL/i)
    const fetchButton = screen.getByRole('button', { name: /Fetch/i })
    
    fireEvent.change(input, { target: { value: 'https://youtube.com/test' } })
    fireEvent.click(fetchButton)
    
    expect(window.api.getMetadata).toHaveBeenCalledWith('https://youtube.com/test')
    
    await waitFor(() => {
      expect(screen.getByText(/Test Video/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Download Selected/i })).toBeInTheDocument()
    })
  })
})
