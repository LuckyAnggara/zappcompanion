import { expect, test } from 'vitest'
import fs from 'fs'
import path from 'path'

test('core files exist', () => {
  const files = [
    'package.json',
    'electron.vite.config.ts',
    'tsconfig.json',
    'src/main/index.ts',
    'src/preload/index.ts',
    'src/renderer/index.html'
  ]
  files.forEach(file => {
    expect(fs.existsSync(path.resolve(__dirname, '..', file))).toBe(true)
  })
})
