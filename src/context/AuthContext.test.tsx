import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { ADMIN, publicUser, wrongCode } from '@/test/fixtures'

const SESSION_KEY = 'alkira.session'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

function mount() {
  return renderHook(() => useAuth(), { wrapper })
}

async function signIn(result: { current: ReturnType<typeof useAuth> }) {
  await act(() => result.current.login(ADMIN.email, ADMIN.password))
  await act(() => result.current.verifyMfa(ADMIN.mfaCode))
}

beforeEach(() => {
  sessionStorage.clear()
})

test('starts anonymous', () => {
  const { result } = mount()

  expect(result.current.state.status).toBe('anonymous')
  expect(result.current.error).toBeNull()
})

test('a correct password stops at awaiting-mfa, not authenticated', async () => {
  const { result } = mount()

  await act(() => result.current.login(ADMIN.email, ADMIN.password))

  expect(result.current.state.status).toBe('awaiting-mfa')
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
})

test('bad credentials leave the user anonymous with an error', async () => {
  const { result } = mount()

  await act(() => result.current.login(ADMIN.email, 'wrong'))

  expect(result.current.state.status).toBe('anonymous')
  expect(result.current.error).toBe('Incorrect email or password.')
})

test('a valid code authenticates and persists the session', async () => {
  const { result } = mount()

  await signIn(result)

  expect(result.current.state).toEqual({
    status: 'authenticated',
    user: publicUser(ADMIN),
  })
  expect(JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')).toEqual(
    publicUser(ADMIN),
  )
})

test('a wrong code keeps the challenge alive', async () => {
  const { result } = mount()

  await act(() => result.current.login(ADMIN.email, ADMIN.password))
  await act(() => result.current.verifyMfa(wrongCode(ADMIN.mfaCode)))

  expect(result.current.state.status).toBe('awaiting-mfa')
  expect(result.current.error).toContain('2 attempts remaining')
})

test('exhausting the attempts drops back to anonymous', async () => {
  const { result } = mount()
  const bad = wrongCode(ADMIN.mfaCode)

  await act(() => result.current.login(ADMIN.email, ADMIN.password))
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await act(() => result.current.verifyMfa(bad))
  }

  expect(result.current.state.status).toBe('anonymous')
  expect(result.current.error).toBe(
    'Too many incorrect codes. Please sign in again.',
  )
})

test('logout clears the session', async () => {
  const { result } = mount()
  await signIn(result)

  act(() => result.current.logout())

  expect(result.current.state.status).toBe('anonymous')
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
})

test('a persisted session is restored on mount', async () => {
  const first = mount()
  await signIn(first.result)
  first.unmount()

  const { result } = mount()

  expect(result.current.state).toEqual({
    status: 'authenticated',
    user: publicUser(ADMIN),
  })
})

test('a corrupt persisted session is ignored', () => {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...publicUser(ADMIN), role: 'superuser' }),
  )

  const { result } = mount()

  expect(result.current.state.status).toBe('anonymous')
})
