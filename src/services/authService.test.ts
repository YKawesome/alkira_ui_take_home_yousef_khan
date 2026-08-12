import { expect, test } from 'vitest'
import { AuthError, login, verifyMfa } from '@/services/authService'
import { ADMIN, VIEWER, publicUser, wrongCode } from '@/test/fixtures'

test('happy path returns the user without secrets', async () => {
  const challenge = await login(
    ` ${ADMIN.email.toUpperCase()} `,
    ADMIN.password,
  )
  const user = await verifyMfa(challenge.id, ADMIN.mfaCode)

  expect(user).toEqual(publicUser(ADMIN))
  expect(Object.keys(user)).not.toContain('password')
})

test('bad password is indistinguishable from unknown email', async () => {
  const a = await login(ADMIN.email, 'wrong').catch((e) => e)
  const b = await login('nobody@alkira.dev', 'wrong').catch((e) => e)

  expect(a.code).toBe('invalid-credentials')
  expect(a.message).toBe(b.message)
})

test('challenge is consumed after three bad codes', async () => {
  const challenge = await login(VIEWER.email, VIEWER.password)
  const bad = wrongCode(VIEWER.mfaCode)

  const errs: AuthError[] = []
  for (const code of [bad, bad, bad, VIEWER.mfaCode]) {
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
  const challenge = await login(VIEWER.email, VIEWER.password)
  await verifyMfa(challenge.id, VIEWER.mfaCode)

  const err = await verifyMfa(challenge.id, VIEWER.mfaCode).catch((e) => e)

  expect(err.code).toBe('unknown-challenge')
})
