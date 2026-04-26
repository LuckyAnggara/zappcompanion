import React, { useState } from 'react'

function App(): React.JSX.Element {
  const [url, setUrl] = useState('')

  const handleDownload = (): void => {
    if (url) {
      window.electron.ipcRenderer.send('download-video', url)
    }
  }

  return (
    <div className="container">
      <header className="brutalist-header">
        <h1>yt-dlp Bridge</h1>
      </header>
      
      <main className="brutalist-main">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter video URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="brutalist-input"
          />
          <button onClick={handleDownload} className="brutalist-button">
            Download
          </button>
        </div>
        
        <div className="status-area">
          <p>Ready to bridge.</p>
        </div>
      </main>

      <style>{`
        :root {
          --orange: #ff5722;
          --blue: #2196f3;
          --white: #ffffff;
          --black: #000000;
        }

        body {
          background-color: var(--white);
          color: var(--black);
          font-family: 'Courier New', Courier, monospace;
          margin: 0;
          padding: 20px;
        }

        .container {
          border: 4px solid var(--black);
          padding: 20px;
          background-color: var(--white);
        }

        .brutalist-header {
          background-color: var(--orange);
          border-bottom: 4px solid var(--black);
          margin: -20px -20px 20px -20px;
          padding: 10px 20px;
        }

        h1 {
          margin: 0;
          text-transform: uppercase;
          font-size: 2.5rem;
          color: var(--white);
          -webkit-text-stroke: 1px var(--black);
        }

        .input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .brutalist-input {
          flex-grow: 1;
          border: 4px solid var(--black);
          padding: 10px;
          font-size: 1.2rem;
          background-color: var(--white);
          outline: none;
        }

        .brutalist-input:focus {
          background-color: #fff9c4;
        }

        .brutalist-button {
          background-color: var(--blue);
          color: var(--white);
          border: 4px solid var(--black);
          padding: 10px 20px;
          font-size: 1.2rem;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.1s;
        }

        .brutalist-button:active {
          transform: translate(2px, 2px);
        }

        .status-area {
          border: 4px solid var(--black);
          padding: 10px;
          background-color: #eeeeee;
          min-height: 100px;
        }
      `}</style>
    </div>
  )
}

export default App
