import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import App from '@/App'
import { AuthContext, type AuthState } from '@/context/auth-context'
import type { MfaChallenge, User } from '@/services/authService'

const CHALLENGE: MfaChallenge = {
  id: 'ch_test',
  email: 'admin@alkira.dev',
  expiresAt: Date.now() + 60_000,
  devCode: '123456',
}

const USER: User = {
  id: 'usr_001',
  name: 'Riley Chen',
  email: 'admin@alkira.dev',
  role: 'read-write',
}

const ANONYMOUS: AuthState = { status: 'anonymous' }
const AWAITING: AuthState = { status: 'awaiting-mfa', challenge: CHALLENGE }
const SIGNED_IN: AuthState = { status: 'authenticated', user: USER }

function renderAt(path: string, state: AuthState) {
  return render(
    <AuthContext
      value={{
        state,
        pending: false,
        error: null,
        login: vi.fn(async () => {}),
        verifyMfa: vi.fn(async () => {}),
        logout: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AuthContext>,
  )
}

function heading() {
  return screen.getByRole('heading').textContent
}

test.each([
  ['/dashboard', 'Sign in'],
  ['/mfa', 'Sign in'],
  ['/login', 'Sign in'],
  ['/signup', 'Create an account'],
  ['/nonsense', 'Sign in'],
])('anonymous at %s sees %s', (path, expected) => {
  renderAt(path, ANONYMOUS)
  expect(heading()).toBe(expected)
})

test.each([
  ['/mfa', 'Two-factor authentication'],
  ['/login', 'Two-factor authentication'],
  ['/dashboard', 'Two-factor authentication'],
  ['/', 'Two-factor authentication'],
])('awaiting mfa at %s sees %s', (path, expected) => {
  renderAt(path, AWAITING)
  expect(heading()).toBe(expected)
})

test.each([
  ['/dashboard', 'Dashboard'],
  ['/login', 'Dashboard'],
  ['/mfa', 'Dashboard'],
  ['/', 'Dashboard'],
])('authenticated at %s sees %s', (path, expected) => {
  renderAt(path, SIGNED_IN)
  expect(heading()).toBe(expected)
})

test('a password alone never reaches the dashboard', () => {
  renderAt('/dashboard', AWAITING)
  expect(screen.queryByText(/Signed in as/)).not.toBeInTheDocument()
})
