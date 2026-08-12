import { fireEvent, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Dashboard } from '@/pages/Dashboard'
import { SIGNED_IN, SIGNED_IN_READ_ONLY } from '@/test/fixtures'
import { renderWithAuth } from '@/test/render'

/** The row whose header cell is `name`, so assertions stay row-scoped. */
function row(name: string) {
  return within(screen.getByRole('row', { name: new RegExp(name) }))
}

test('a read/write user gets enabled actions', () => {
  renderWithAuth(<Dashboard />, { state: SIGNED_IN })

  expect(
    screen.getByRole('button', { name: 'Disable prod-payments' }),
  ).toBeEnabled()
  expect(screen.queryByText(/not change them/)).not.toBeInTheDocument()
})

test('a read/write user can flip a segment', () => {
  renderWithAuth(<Dashboard />, { state: SIGNED_IN })

  expect(row('prod-payments').getByText('Enabled')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Disable prod-payments' }))

  expect(row('prod-payments').getByText('Disabled')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Enable prod-payments' }),
  ).toBeVisible()
})

test('a read-only user gets disabled actions and a reason', () => {
  renderWithAuth(<Dashboard />, { state: SIGNED_IN_READ_ONLY })

  const action = screen.getByRole('button', { name: 'Disable prod-payments' })
  expect(action).toBeDisabled()
  expect(action).toHaveAccessibleDescription(
    'Your role can view segments but not change them.',
  )
})

test('a read-only user cannot flip a segment', () => {
  renderWithAuth(<Dashboard />, { state: SIGNED_IN_READ_ONLY })

  fireEvent.click(screen.getByRole('button', { name: 'Disable prod-payments' }))

  expect(row('prod-payments').getByText('Enabled')).toBeVisible()
})

test('every segment action is gated, not just the first', () => {
  renderWithAuth(<Dashboard />, { state: SIGNED_IN_READ_ONLY })

  for (const action of screen.getAllByRole('button', {
    name: /^(Enable|Disable) /,
  })) {
    expect(action).toBeDisabled()
  }
})

test('the role is shown and sign out is wired up', () => {
  const auth = renderWithAuth(<Dashboard />, { state: SIGNED_IN_READ_ONLY })

  expect(screen.getByText('read-only')).toBeVisible()

  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
  expect(auth.logout).toHaveBeenCalled()
})
