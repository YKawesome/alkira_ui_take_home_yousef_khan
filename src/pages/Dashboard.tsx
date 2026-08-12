import { useAuth, useAuthenticatedUser } from '@/hooks/useAuth'

export function Dashboard() {
  const user = useAuthenticatedUser()
  const { logout } = useAuth()

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Signed in as {user.name} ({user.role})
      </p>
      <button type="button" onClick={logout}>
        Sign out
      </button>
    </div>
  )
}
