import usersData from '@/data/users.json'

export type Role = 'read-only' | 'read-write'

export type User = {
  id: string
  name: string
  email: string
  role: Role
}

type UserRecord = User & {
  password: string
  mfaCode: string
}

export type MfaChallenge = {
  id: string
  email: string
  expiresAt: number
  devCode: string
}

export type AuthErrorCode =
  | 'invalid-credentials'
  | 'unknown-challenge'
  | 'challenge-expired'
  | 'invalid-code'
  | 'too-many-attempts'

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000
const MAX_ATTEMPTS = 3
const LATENCY_MS = import.meta.env.MODE === 'test' ? 0 : 600

type PendingChallenge = {
  userId: string
  expiresAt: number
  attemptsLeft: number
}

const challenges = new Map<string, PendingChallenge>()

const users = usersData as UserRecord[]

function latency() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
}

function toPublicUser({ id, name, email, role }: UserRecord): User {
  return { id, name, email, role }
}

export async function login(
  email: string,
  password: string,
): Promise<MfaChallenge> {
  await latency()

  const normalized = email.trim().toLowerCase()
  const record = users.find((user) => user.email.toLowerCase() === normalized)

  if (!record || record.password !== password) {
    throw new AuthError('invalid-credentials', 'Incorrect email or password.')
  }

  const id = crypto.randomUUID()
  const expiresAt = Date.now() + CHALLENGE_TTL_MS
  challenges.set(id, {
    userId: record.id,
    expiresAt,
    attemptsLeft: MAX_ATTEMPTS,
  })

  return { id, email: record.email, expiresAt, devCode: record.mfaCode }
}

export async function verifyMfa(
  challengeId: string,
  code: string,
): Promise<User> {
  await latency()

  const challenge = challenges.get(challengeId)
  if (!challenge) {
    throw new AuthError(
      'unknown-challenge',
      'Your sign-in session has ended. Please sign in again.',
    )
  }

  if (Date.now() > challenge.expiresAt) {
    challenges.delete(challengeId)
    throw new AuthError(
      'challenge-expired',
      'That code has expired. Please sign in again.',
    )
  }

  const record = users.find((user) => user.id === challenge.userId)
  if (!record) {
    challenges.delete(challengeId)
    throw new AuthError(
      'unknown-challenge',
      'Your sign-in session has ended. Please sign in again.',
    )
  }

  if (record.mfaCode !== code.trim()) {
    challenge.attemptsLeft -= 1

    if (challenge.attemptsLeft <= 0) {
      challenges.delete(challengeId)
      throw new AuthError(
        'too-many-attempts',
        'Too many incorrect codes. Please sign in again.',
      )
    }

    const { attemptsLeft } = challenge
    throw new AuthError(
      'invalid-code',
      `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`,
    )
  }

  challenges.delete(challengeId)
  return toPublicUser(record)
}
