import { expect, test } from 'vitest'
import { can } from '@/lib/permissions'

test('read-only can read but not write', () => {
  expect(can('read-only', 'segment:read')).toBe(true)
  expect(can('read-only', 'segment:write')).toBe(false)
})

test('read-write can do both', () => {
  expect(can('read-write', 'segment:read')).toBe(true)
  expect(can('read-write', 'segment:write')).toBe(true)
})
