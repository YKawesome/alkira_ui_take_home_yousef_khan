import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function MfaForm() {
  const { state, verifyMfa, logout, pending, error } = useAuth()
  const [code, setCode] = useState('')

  const challenge = state.status === 'awaiting-mfa' ? state.challenge : null

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void verifyMfa(code)
      }}
    >
      <h1>Two-factor authentication</h1>
      {challenge && <p>Enter the code sent to {challenge.email}.</p>}
      {challenge && <p>Demo code: {challenge.devCode}</p>}
      {error && <p role="alert">{error}</p>}

      <label htmlFor="code">Verification code</label>
      <input
        id="code"
        inputMode="numeric"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />

      <button type="submit" disabled={pending}>
        {pending ? 'Verifying…' : 'Verify'}
      </button>

      <button type="button" onClick={logout}>
        Use a different account
      </button>
    </form>
  )
}
