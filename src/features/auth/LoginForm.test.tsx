import { fireEvent, screen, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'
import { LoginForm } from '@/features/auth/LoginForm'
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
  fill('Password', 'Alkira!2024')
  submit()

  expect(await screen.findByText('Enter a valid email address.')).toBeVisible()
  expect(auth.login).not.toHaveBeenCalled()
})

test('a valid submit passes the credentials through', async () => {
  const auth = renderWithAuth(<LoginForm />)

  fill('Email', 'admin@alkira.dev')
  fill('Password', 'Alkira!2024')
  submit()

  await waitFor(() =>
    expect(auth.login).toHaveBeenCalledWith('admin@alkira.dev', 'Alkira!2024'),
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
