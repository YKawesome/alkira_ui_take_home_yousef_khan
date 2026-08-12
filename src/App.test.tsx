import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import App from '@/App'
import { AuthProvider } from '@/context/AuthContext'
import { ADMIN, ENABLED_SEGMENT, VIEWER, wrongCode } from '@/test/fixtures'

function renderApp() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function signIn(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: password },
  })
  fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
}

function enterCode(code: string) {
  fireEvent.change(screen.getByLabelText('Verification code'), {
    target: { value: code },
  })
}

const disableAction = `Disable ${ENABLED_SEGMENT.name}`
const enableAction = `Enable ${ENABLED_SEGMENT.name}`

test('read/write user: login → mfa → dashboard with live actions', async () => {
  renderApp()

  signIn(ADMIN.email, ADMIN.password)
  expect(
    await screen.findByRole('heading', { name: 'Two-factor authentication' }),
  ).toBeVisible()

  enterCode(ADMIN.mfaCode)
  expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible()

  const action = screen.getByRole('button', { name: disableAction })
  expect(action).toBeEnabled()
  fireEvent.click(action)
  expect(screen.getByRole('button', { name: enableAction })).toBeVisible()
})

test('read-only user reaches the same screen with actions disabled', async () => {
  renderApp()

  signIn(VIEWER.email, VIEWER.password)
  await screen.findByRole('heading', { name: 'Two-factor authentication' })

  enterCode(VIEWER.mfaCode)
  expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible()

  expect(screen.getByRole('button', { name: disableAction })).toBeDisabled()
})

test('bad credentials never leave the login screen', async () => {
  renderApp()

  signIn(ADMIN.email, 'wrong-password')

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Incorrect email or password.',
  )
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})

test('a wrong code holds the user at the mfa step', async () => {
  renderApp()

  signIn(ADMIN.email, ADMIN.password)
  await screen.findByRole('heading', { name: 'Two-factor authentication' })

  enterCode(wrongCode(ADMIN.mfaCode))

  expect(await screen.findByText(/2 attempts remaining/)).toBeVisible()
  expect(
    screen.getByRole('heading', { name: 'Two-factor authentication' }),
  ).toBeVisible()
})

test('signing out returns to login and forgets the session', async () => {
  renderApp()

  signIn(ADMIN.email, ADMIN.password)
  await screen.findByRole('heading', { name: 'Two-factor authentication' })
  enterCode(ADMIN.mfaCode)
  await screen.findByRole('heading', { name: 'Dashboard' })

  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeVisible()
  expect(sessionStorage.getItem('alkira.session')).toBeNull()
})
