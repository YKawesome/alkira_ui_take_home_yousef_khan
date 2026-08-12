import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '@/context/auth-context'
import type { User } from '@/services/authService'

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return value
}

export function useAuthenticatedUser(): User {
  const { state } = useAuth()
  if (state.status !== 'authenticated') {
    throw new Error('useAuthenticatedUser must be used inside a protected route')
  }
  return state.user
}
