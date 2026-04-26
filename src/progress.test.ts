import { expect, test } from 'vitest'

test('progress parsing regex', () => {
  const line = '[download]  10.5% of 100MiB at 1.5MiB/s ETA 01:00'
  const match = line.match(/\[download\]\s+(\d+\.\d+)%/)
  expect(match).toBeDefined()
  expect(match![1]).toBe('10.5')
  expect(parseFloat(match![1])).toBe(10.5)
})
