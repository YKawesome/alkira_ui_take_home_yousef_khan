import { fireEvent, screen, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'
import { LoginForm } from '@/features/auth/LoginForm'
import { ADMIN } from '@/test/fixtures'
import { renderWithAuth } from '@/test/render'

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
}

test('an empty submit reports both fields and calls nothing', async () => {
  const auth = renderWithAuth(<LoginForm />)

  submit()

  expect(await screen.findByText('Enter a valid email address.')).toBeVisible()
  expect(screen.getByText('Password is required.')).toBeVisible()
  expect(auth.login).not.toHaveBeenCalled()
})

test('a malformed email is rejected before any request', async () => {
  const auth = renderWithAuth(<LoginForm />)

  fill('Email', 'not-an-email')
  fill('Password', ADMIN.password)
  submit()

  expect(await screen.findByText('Enter a valid email address.')).toBeVisible()
  expect(auth.login).not.toHaveBeenCalled()
})

test('a valid submit passes the credentials through', async () => {
  const auth = renderWithAuth(<LoginForm />)

  fill('Email', ADMIN.email)
  fill('Password', ADMIN.password)
  submit()

  await waitFor(() =>
    expect(auth.login).toHaveBeenCalledWith(ADMIN.email, ADMIN.password),
  )
})

test('the invalid email is announced to assistive tech', async () => {
  renderWithAuth(<LoginForm />)

  submit()
  await screen.findByText('Enter a valid email address.')

  const email = screen.getByLabelText('Email')
  expect(email).toHaveAttribute('aria-invalid', 'true')
  expect(email).toHaveAccessibleDescription('Enter a valid email address.')
})

test('a failed sign-in from the service is surfaced', () => {
  renderWithAuth(<LoginForm />, { error: 'Incorrect email or password.' })

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Incorrect email or password.',
  )
})

test('the submit button reflects the pending request', () => {
  renderWithAuth(<LoginForm />, { pending: true })

  expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
})
