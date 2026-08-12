import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '@/App'
import type { AuthState } from '@/context/auth-context'
import { ANONYMOUS, AWAITING, SIGNED_IN } from '@/test/fixtures'
import { renderWithAuth } from '@/test/render'

function headingAt(path: string, state: AuthState) {
  renderWithAuth(<App />, { path, state })
  return screen.getByRole('heading').textContent
}

test.each([
  ['/dashboard', 'Sign in'],
  ['/mfa', 'Sign in'],
  ['/login', 'Sign in'],
  ['/signup', 'Create an account'],
  ['/nonsense', 'Sign in'],
])('anonymous at %s sees %s', (path, expected) => {
  expect(headingAt(path, ANONYMOUS)).toBe(expected)
})

test.each([
  ['/mfa', 'Two-factor authentication'],
  ['/login', 'Two-factor authentication'],
  ['/dashboard', 'Two-factor authentication'],
  ['/', 'Two-factor authentication'],
])('awaiting mfa at %s sees %s', (path, expected) => {
  expect(headingAt(path, AWAITING)).toBe(expected)
})

test.each([
  ['/dashboard', 'Dashboard'],
  ['/login', 'Dashboard'],
  ['/mfa', 'Dashboard'],
  ['/', 'Dashboard'],
])('authenticated at %s sees %s', (path, expected) => {
  expect(headingAt(path, SIGNED_IN)).toBe(expected)
})

test('a password alone never reaches the dashboard', () => {
  renderWithAuth(<App />, { path: '/dashboard', state: AWAITING })

  expect(screen.queryByText(/Signed in as/)).not.toBeInTheDocument()
})
