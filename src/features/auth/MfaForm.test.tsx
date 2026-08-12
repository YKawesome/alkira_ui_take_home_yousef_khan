import { fireEvent, screen, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'
import { MfaForm } from '@/features/auth/MfaForm'
import { AWAITING, CHALLENGE } from '@/test/fixtures'
import { renderWithAuth } from '@/test/render'

function enter(code: string) {
  fireEvent.change(screen.getByLabelText('Verification code'), {
    target: { value: code },
  })
}

test('shows which address the code went to', () => {
  renderWithAuth(<MfaForm />, { state: AWAITING })

  expect(
    screen.getByText(`Enter the 6-digit code sent to ${CHALLENGE.email}.`),
  ).toBeVisible()
})

test('a short code is rejected without spending an attempt', async () => {
  const auth = renderWithAuth(<MfaForm />, { state: AWAITING })

  enter('123')
  fireEvent.click(screen.getByRole('button', { name: 'Verify' }))

  expect(await screen.findByText('Enter the 6-digit code.')).toBeVisible()
  expect(auth.verifyMfa).not.toHaveBeenCalled()
})

test('six digits submit without waiting for a click', async () => {
  const auth = renderWithAuth(<MfaForm />, { state: AWAITING })

  enter('123456')

  await waitFor(() => expect(auth.verifyMfa).toHaveBeenCalledWith('123456'))
})

test('a rejected code is surfaced with the attempts left', () => {
  renderWithAuth(<MfaForm />, {
    state: AWAITING,
    error: 'Incorrect code. 2 attempts remaining.',
  })

  expect(
    screen.getByText('Incorrect code. 2 attempts remaining.'),
  ).toBeVisible()
})

test('cancelling resets the auth state rather than navigating', () => {
  const auth = renderWithAuth(<MfaForm />, { state: AWAITING })

  fireEvent.click(screen.getByRole('button', { name: 'Use a different account' }))

  expect(auth.logout).toHaveBeenCalled()
})
