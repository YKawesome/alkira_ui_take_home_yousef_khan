import type { Role } from '@/services/authService'

export type Permission = 'segment:read' | 'segment:write'

const GRANTS: Record<Role, readonly Permission[]> = {
  'read-only': ['segment:read'],
  'read-write': ['segment:read', 'segment:write'],
}

export function can(role: Role, permission: Permission): boolean {
  return GRANTS[role].includes(permission)
}
