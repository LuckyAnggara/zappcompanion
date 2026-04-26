import { expect, test } from 'vitest'

test('core dependencies are installable', async () => {
  const ytDlp = await import('yt-dlp-exec')
  const express = await import('express')
  const cors = await import('cors')
  
  expect(ytDlp).toBeDefined()
  expect(express).toBeDefined()
  expect(cors).toBeDefined()
})
