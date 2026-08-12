import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '@/context/auth-context'
import { ANONYMOUS } from '@/test/fixtures'

type Options = Partial<AuthContextValue> & { path?: string }

export function renderWithAuth(ui: ReactNode, options: Options = {}) {
  const { path = '/', ...overrides } = options

  const value: AuthContextValue = {
    state: ANONYMOUS,
    pending: false,
    error: null,
    login: vi.fn(async () => {}),
    verifyMfa: vi.fn(async () => {}),
    logout: vi.fn(),
    ...overrides,
  }

  render(
    <AuthContext value={value}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </AuthContext>,
  )

  return value
}
