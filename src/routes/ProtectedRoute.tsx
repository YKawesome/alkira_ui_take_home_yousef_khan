import { Navigate, Outlet } from 'react-router-dom'
import type { AuthStatus } from '@/context/auth-context'
import { useAuth } from '@/hooks/useAuth'

const HOME_FOR: Record<AuthStatus, string> = {
  'anonymous': '/login',
  'awaiting-mfa': '/mfa',
  'authenticated': '/dashboard',
}

export function ProtectedRoute({
  allow = 'authenticated',
}: {
  allow?: AuthStatus
}) {
  const { state } = useAuth()

  if (state.status !== allow) {
    return <Navigate to={HOME_FOR[state.status]} replace />
  }

  return <Outlet />
}
