import { expect, test } from 'vitest'
import { AuthError, login, verifyMfa } from './authService'

test('happy path returns the user without secrets', async () => {
  const challenge = await login('ADMIN@alkira.dev ', 'Alkira!2024')
  const user = await verifyMfa(challenge.id, '123456')
  expect(user).toEqual({
    id: 'usr_001',
    name: 'Ahd Min',
    email: 'admin@alkira.dev',
    role: 'read-write',
  })
  expect(Object.keys(user)).not.toContain('password')
})

test('bad password is indistinguishable from unknown email', async () => {
  const a = await login('admin@alkira.dev', 'wrong').catch((e) => e)
  const b = await login('nobody@alkira.dev', 'wrong').catch((e) => e)
  expect(a.code).toBe('invalid-credentials')
  expect(a.message).toBe(b.message)
})

test('challenge is consumed after three bad codes', async () => {
  const challenge = await login('viewer@alkira.dev', 'Alkira!2024')
  const errs: AuthError[] = []
  for (const code of ['000000', '111111', '222222', '654321']) {
    errs.push(await verifyMfa(challenge.id, code).catch((e) => e))
  }
  expect(errs.map((e) => e.code)).toEqual([
    'invalid-code',
    'invalid-code',
    'too-many-attempts',
    'unknown-challenge',
  ])
  expect(errs[0].message).toContain('2 attempts remaining')
  expect(errs[1].message).toContain('1 attempt remaining')
})

test('a challenge cannot be replayed', async () => {
  const challenge = await login('viewer@alkira.dev', 'Alkira!2024')
  await verifyMfa(challenge.id, '654321')
  const err = await verifyMfa(challenge.id, '654321').catch((e) => e)
  expect(err.code).toBe('unknown-challenge')
})
