import { createContext } from 'react'
import type { MfaChallenge, User } from '@/services/authService'

export type AuthState =
  | { status: 'anonymous' }
  | { status: 'awaiting-mfa'; challenge: MfaChallenge }
  | { status: 'authenticated'; user: User }

export type AuthStatus = AuthState['status']

export type AuthContextValue = {
  state: AuthState
  pending: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  verifyMfa: (code: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
