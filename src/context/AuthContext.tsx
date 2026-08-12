import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  AuthError,
  login as requestLogin,
  verifyMfa as requestMfaCode,
} from '@/services/authService'
import type { AuthErrorCode, User } from '@/services/authService'
import { AuthContext, type AuthState } from '@/context/auth-context'

const SESSION_KEY = 'alkira.session'

const ANONYMOUS: AuthState = { status: 'anonymous' }

const RESTART_CODES = new Set<AuthErrorCode>([
  'unknown-challenge',
  'challenge-expired',
  'too-many-attempts',
])

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    (candidate.role === 'read-only' || candidate.role === 'read-write')
  )
}

function restore(): AuthState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return ANONYMOUS
    const parsed: unknown = JSON.parse(raw)
    return isUser(parsed) ? { status: 'authenticated', user: parsed } : ANONYMOUS
  } catch {
    return ANONYMOUS
  }
}

function toMessage(error: unknown): string {
  return error instanceof AuthError
    ? error.message
    : 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(restore)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (state.status === 'authenticated') {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.user))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [state])

  const login = useCallback(async (email: string, password: string) => {
    setPending(true)
    setError(null)
    try {
      const challenge = await requestLogin(email, password)
      setState({ status: 'awaiting-mfa', challenge })
    } catch (err) {
      setError(toMessage(err))
    } finally {
      setPending(false)
    }
  }, [])

  const challengeId = state.status === 'awaiting-mfa' ? state.challenge.id : null

  const verifyMfa = useCallback(
    async (code: string) => {
      if (!challengeId) return

      setPending(true)
      setError(null)
      try {
        const user = await requestMfaCode(challengeId, code)
        setState({ status: 'authenticated', user })
      } catch (err) {
        setError(toMessage(err))
        if (err instanceof AuthError && RESTART_CODES.has(err.code)) {
          setState(ANONYMOUS)
        }
      } finally {
        setPending(false)
      }
    },
    [challengeId],
  )

  const logout = useCallback(() => {
    setState(ANONYMOUS)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({ state, pending, error, login, verifyMfa, logout }),
    [state, pending, error, login, verifyMfa, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
