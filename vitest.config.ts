import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
      ['src/ui.test.tsx', 'jsdom']
    ]
  }
})
