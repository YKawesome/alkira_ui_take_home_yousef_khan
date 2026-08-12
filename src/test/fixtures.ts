import type { AuthState } from '@/context/auth-context'
import usersData from '@/data/users.json'
import { INITIAL_SEGMENTS, type Segment } from '@/features/segments/segments'
import type { MfaChallenge, Role, User } from '@/services/authService'

type DemoAccount = User & { password: string; mfaCode: string }

function accountFor(role: Role): DemoAccount {
  const match = (usersData as DemoAccount[]).find((user) => user.role === role)
  if (!match) throw new Error(`users.json has no ${role} account`)
  return match
}

export const ADMIN = accountFor('read-write')
export const VIEWER = accountFor('read-only')

export function publicUser({ id, name, email, role }: DemoAccount): User {
  return { id, name, email, role }
}

export function wrongCode(real: string): string {
  return real.replace(/\d/g, (digit) => String((Number(digit) + 1) % 10))
}

function firstEnabledSegment(): Segment {
  const match = INITIAL_SEGMENTS.find((segment) => segment.enabled)
  if (!match) throw new Error('segments.json has no enabled segment')
  return match
}

export const ENABLED_SEGMENT = firstEnabledSegment()

export const CHALLENGE: MfaChallenge = {
  id: 'ch_test',
  email: ADMIN.email,
  expiresAt: Date.now() + 60_000,
  devCode: ADMIN.mfaCode,
}

export const ANONYMOUS: AuthState = { status: 'anonymous' }
export const AWAITING: AuthState = { status: 'awaiting-mfa', challenge: CHALLENGE }
export const SIGNED_IN: AuthState = {
  status: 'authenticated',
  user: publicUser(ADMIN),
}
export const SIGNED_IN_READ_ONLY: AuthState = {
  status: 'authenticated',
  user: publicUser(VIEWER),
}
