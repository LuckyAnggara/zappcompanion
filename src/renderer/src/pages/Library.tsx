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

  const openFile = (path: string): void => window.api.openFile(path)
  const showInFolder = (path: string): void => window.api.showInFolder(path)

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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
