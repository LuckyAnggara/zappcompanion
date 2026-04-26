import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import App from './renderer/src/App'
import '@testing-library/jest-dom/vitest'

// Mock Electron IPC
// @ts-expect-error - mock window
window.electron = {
  ipcRenderer: {
    send: vi.fn(),
    on: vi.fn()
  }
}

describe('Brutalist UI components', () => {
  it('renders title, input, and download button', () => {
    render(<App />)
    expect(screen.getByText(/yt-dlp Bridge/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter video URL/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
  })

  it('updates input value on change', () => {
    render(<App />)
    const input = screen.getByPlaceholderText(/Enter video URL/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'https://youtube.com/test' } })
    expect(input.value).toBe('https://youtube.com/test')
  })

  it('triggers download on button click', () => {
    render(<App />)
    const input = screen.getByPlaceholderText(/Enter video URL/i)
    const button = screen.getByRole('button', { name: /Download/i })
    
    fireEvent.change(input, { target: { value: 'https://youtube.com/test' } })
    fireEvent.click(button)
    
    // This will be implemented via IPC
    expect(window.electron.ipcRenderer.send).toHaveBeenCalledWith('download-video', 'https://youtube.com/test')
  })
})
