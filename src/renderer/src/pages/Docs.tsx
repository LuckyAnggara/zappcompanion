import React from 'react'

export default function DocsPage(): React.JSX.Element {
  const endpoints = [
    {
      method: 'GET',
      path: '/ping',
      desc: 'Check if the companion app is active.',
      response: '{ "status": "ok" }'
    },
    {
      method: 'GET',
      path: '/metadata?url=<URL>',
      desc: 'Fetch video title, thumbnail, and quality formats.',
      response: '{ "title": "...", "formats": [...] }'
    },
    {
      method: 'POST',
      path: '/download',
      desc: 'Trigger a local video download.',
      body: '{ "url": "...", "formatId": "optional" }',
      response: '{ "status": "downloading" }'
    },
    {
      method: 'GET',
      path: '/progress?url=<URL>',
      desc: 'Poll the current download percentage.',
      response: '{ "progress": 45.5, "status": "downloading" }'
    },
    {
      method: 'GET',
      path: '/result?url=<URL>',
      desc: 'Stream the downloaded file binary (useful for OPFS sync).',
      response: 'File Binary (Blob)'
    }
  ]

  return (
    <div className="docs-page">
      <h2>API Documentation</h2>
      <p className="docs-intro">
        Use these endpoints to connect your Web App to the <strong>ZC Companion Engine</strong>.
        The bridge runs on <code>http://localhost:4000</code>.
      </p>

      <div className="endpoint-list">
        {endpoints.map((ep, i) => (
          <div key={i} className="endpoint-card">
            <div className="endpoint-header">
              <span className={`method ${ep.method.toLowerCase()}`}>{ep.method}</span>
              <code className="path">{ep.path}</code>
            </div>
            <p className="desc">{ep.desc}</p>
            {ep.body && (
              <div className="code-block">
                <span>Request Body:</span>
                <pre>{ep.body}</pre>
              </div>
            )}
            <div className="code-block">
              <span>Expected Response:</span>
              <pre>{ep.response}</pre>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .docs-page {
          display: flex;
          flex-direction: column;
        }

        .docs-intro {
          margin-bottom: 30px;
          font-size: 1.1rem;
          line-height: 1.5;
        }

        .endpoint-list {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .endpoint-card {
          border: 4px solid var(--black);
          padding: 20px;
          background-color: var(--white);
          box-shadow: 8px 8px 0px var(--black);
        }

        .endpoint-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
        }

        .method {
          padding: 5px 12px;
          font-weight: 900;
          color: white;
          text-transform: uppercase;
          border: 2px solid var(--black);
        }

        .method.get { background-color: var(--blue); }
        .method.post { background-color: var(--orange); }

        .path {
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--black);
        }

        .desc {
          margin: 10px 0;
          font-weight: bold;
        }

        .code-block {
          margin-top: 15px;
          background-color: var(--gray);
          border: 2px solid var(--black);
          padding: 10px;
        }

        .code-block span {
          display: block;
          font-size: 0.8rem;
          text-transform: uppercase;
          margin-bottom: 5px;
          opacity: 0.7;
        }

        pre {
          margin: 0;
          font-family: inherit;
          font-size: 0.9rem;
          white-space: pre-wrap;
          word-break: break-all;
        }
      `}</style>
    </div>
  )
}
