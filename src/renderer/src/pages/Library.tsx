import React, { useState, useEffect } from 'react'

interface DownloadItem {
  id: string
  url: string
  title: string
  thumbnail: string
  filePath: string
  date: string
  status: 'completed' | 'failed'
}

export default function LibraryPage(): React.JSX.Element {
  const [history, setHistory] = useState<DownloadItem[]>([])

  const refreshHistory = async (): Promise<void> => {
    if (window.api) {
      const data = await window.api.getHistory()
      setHistory(data)
    }
  }

  useEffect(() => {
    refreshHistory()
  }, [])

  const openFile = async (path: string): Promise<void> => {
    await window.api.openFile(path)
  }

  const showInFolder = async (path: string): Promise<void> => {
    await window.api.showInFolder(path)
  }

  const handleDelete = async (id: string, filePath: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this video? This will permanently remove the file from your computer.')) {
      const res = await window.api.deleteHistoryItem(id, filePath)
      if (res.success) {
        refreshHistory()
      } else {
        alert(`Failed to delete: ${res.error}`)
      }
    }
  }

  return (
    <div className="library-page">
      <h2>Download Library</h2>
      <div className="library-list">
        {history.length === 0 && <p className="empty-msg">No downloads in history.</p>}
        {history.map((item) => (
          <div key={item.id} className="library-item">
            {item.thumbnail && <img src={item.thumbnail} alt="Thumb" className="item-thumb" />}
            <div className="item-details">
              <div className="item-title">{item.title}</div>
              <div className="item-meta">{new Date(item.date).toLocaleString()}</div>
              <div className="item-actions">
                <button onClick={() => openFile(item.filePath)} className="action-btn">Play</button>
                <button onClick={() => showInFolder(item.filePath)} className="action-btn">Folder</button>
                <button onClick={() => handleDelete(item.id, item.filePath)} className="action-btn delete-btn">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
