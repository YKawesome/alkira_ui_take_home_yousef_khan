import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SegmentTable } from '@/features/segments/SegmentTable'
import { INITIAL_SEGMENTS } from '@/features/segments/segments'
import { useAuth, useAuthenticatedUser } from '@/hooks/useAuth'
import { can } from '@/lib/permissions'

export function Dashboard() {
  const user = useAuthenticatedUser()
  const { logout } = useAuth()
  const [segments, setSegments] = useState(INITIAL_SEGMENTS)

  const canWrite = can(user.role, 'segment:write')

  const toggle = useCallback((id: string) => {
    setSegments((current) =>
      current.map((segment) =>
        segment.id === id
          ? { ...segment, enabled: !segment.enabled }
          : segment,
      ),
    )
  }, [])

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <h1 className="font-heading text-base font-medium">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as {user.name} ({user.email})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground">
              {user.role}
            </span>
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Network segments</CardTitle>
            <CardDescription>
              Enable or disable traffic for each segment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* The single place the role is consulted. Passing the handler
                only when permitted keeps the gate off the row components. */}
            <SegmentTable
              segments={segments}
              onToggle={canWrite ? toggle : undefined}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
