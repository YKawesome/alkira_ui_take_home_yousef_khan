import type { AuthState } from '@/context/auth-context'
import type { MfaChallenge, User } from '@/services/authService'

export const CHALLENGE: MfaChallenge = {
  id: 'ch_test',
  email: 'admin@alkira.dev',
  expiresAt: Date.now() + 60_000,
  devCode: '123456',
}

export const USER: User = {
  id: 'usr_001',
  name: 'Ahd Min',
  email: 'admin@alkira.dev',
  role: 'read-write',
}

export const READ_ONLY_USER: User = {
  id: 'usr_002',
  name: 'Reed Ohnly',
  email: 'viewer@alkira.dev',
  role: 'read-only',
}

export const ANONYMOUS: AuthState = { status: 'anonymous' }
export const AWAITING: AuthState = { status: 'awaiting-mfa', challenge: CHALLENGE }
export const SIGNED_IN: AuthState = { status: 'authenticated', user: USER }
export const SIGNED_IN_READ_ONLY: AuthState = {
  status: 'authenticated',
  user: READ_ONLY_USER,
}
