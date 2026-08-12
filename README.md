# Yousef Khan | Alkira UI Take-Home - Login + MFA

A React SPA demonstrating a two-step authentication flow and role-based access control:

```
Login  →  MFA  →  Protected Screen
```

There is no backend per the spec, so authentication is mocked. See
[Known limitations](#known-limitations) for more information :)

## Technologies used

| Area          | Choice                                              |
| ------------- | --------------------------------------------------- |
| Framework     | React 19 + TypeScript 6                             |
| Build tooling | Vite 8                                              |
| Routing       | React Router 7                                      |
| Forms         | React Hook Form + Zod 4 (via `@hookform/resolvers`) |
| UI components | shadcn/ui on Base UI primitives                     |
| Styling       | Tailwind CSS v4                                     |
| Testing       | Vitest 4 + Testing Library + jsdom                  |
| Linting       | ESLint 10 (flat config) + typescript-eslint         |

State is handled with React Context and `useState`.

## Setup

Requires **Node 20.19+ or 22.12+** (Vite 8). Developed on Node 22.22.3.

```bash
git clone https://github.com/YKawesome/alkira_ui_take_home_yousef_khan.git
cd alkira_ui_take_home_yousef_khan
npm install
```

## Running locally

```bash
npm run dev        # http://localhost:5173 by default
```

Other scripts:

```bash
npm test           # run the test suite once (51 tests)
npm run lint       # eslint
npm run build      # typecheck + production build
npm run preview    # serve the production build
```

## Mock users

Both accounts use the same password. The MFA code is shown on screen during the
demo flow, so there is nothing to memorise!

| Email               | Password      | MFA code | Role           |
| ------------------- | ------------- | -------- | -------------- |
| `admin@alkira.dev`  | `Alkira!2026` | `123456` | **read-write** |
| `viewer@alkira.dev` | `Alkira!2026` | `654321` | **read-only**  |

Defined in [`src/data/users.json`](src/data/users.json).

**Roles**

- **read-write** — segment actions are visible and enabled
- **read-only** — the same actions are visible but disabled, with an
  explanation of why

When on read-only mode, controls are disabled instead of hidden so the user
is well-aware of why / what is missing. This disabled state is also included via
`aria-describedBy` for accessibility purposes.

## How to test the login / MFA flow

### Manually

1. Run `npm run dev` and open the app; you'll be redirected to `/login`.
2. **Validation**: submit the empty form; you should see both fields report errors and no
   request made. Enter something like `not-an-email` to see format validation.
3. **Bad credentials**: sign in with a wrong password. You stay on the login
   screen with _"Incorrect email or password."_
4. **Sign up**: the "Sign up" link reaches its own screen. It validates the password but doesn't actually create an account.
5. **Login**: sign in as `admin@alkira.dev`. You land on the MFA screen, which
   displays the demo code.
6. **Wrong code**: enter `000000`. You stay on the MFA screen and see
   _"Incorrect code. 2 attempts remaining."_ Repeat twice more and the challenge
   is destroyed, returning you to login with an explanation.
7. **MFA**: enter the correct code. It submits automatically on the sixth
   digit and you land on the dashboard.
8. **Read-write**: the Enable/Disable buttons are live; clicking one flips the status (frontend-only)
9. **Guards**: with the dashboard open, manually navigate to `/login` or
   `/mfa`. Both redirect back to `/dashboard`.
10. **Read-only**: sign out, then repeat as `viewer@alkira.dev`. The same buttons are disabled with an explanatory notice.
11. **Session**: refresh the dashboard. You stay signed in. Refresh _during_
    the MFA step and you are returned to login by design.

### Automated

```bash
npm test
```

51 tests across 8 files:

| File                               | Tests | Covers                                                                   |
| ---------------------------------- | ----- | ------------------------------------------------------------------------ |
| `services/authService.test.ts`     | 4     | Email normalisation, anti-enumeration, attempt limits, replay protection |
| `context/AuthContext.test.tsx`     | 9     | State transitions, session persistence, tampered-session rejection       |
| `routes/ProtectedRoute.test.tsx`   | 14    | Every auth status against every route                                    |
| `features/auth/LoginForm.test.tsx` | 6     | Field validation, accessibility wiring, pending state                    |
| `features/auth/MfaForm.test.tsx`   | 5     | Code validation, auto-submit, cancelling                                 |
| `pages/Dashboard.test.tsx`         | 6     | Role gating in both directions                                           |
| `lib/permissions.test.ts`          | 2     | The permission grant table                                               |
| `App.test.tsx`                     | 5     | **Full flow** against the real provider and service                      |


## Key design decisions & assumptions

### `login()` provides challenge, not a user

A user cannot be created except by going through the `MfaChallenge` flow; there is
no path to produce a user otherwise.

### Auth has three states

```ts
type AuthState =
  | { status: "anonymous" }
  | { status: "awaiting-mfa"; challenge: MfaChallenge }
  | { status: "authenticated"; user: User };
```

Using a discriminated union prevents having to track login state and mfa completion.
`user` only exists on the authenticated branch.

### Route guards

`ProtectedRoute` takes an `allow` status and redirects anyone else to wherever
they actually belong, from a single lookup table.

### The role is consulted in exactly one place

`Dashboard` computes `can(user.role, 'segment:write')` once and passes the
toggle handler _only_ when permitted. `SegmentTable` then derives its disabled state
from the handler's absence so a live button cannot be rendered with a dead handler.

### MFA challenges are single-use and limited by time and attempts

Using the code with a `crypto.randomUUID()` challenge id, a 5-minute TTL, 3 attempts,
and destruction of the challenge on every terminal path is significantly more secure.

### Errors carry codes, not just messages

`AuthError` exposes a typed `code`, so the UI branches on a stable identifier
while copy stays free to change.

### Assumptions made
- **Sign-up does not register.** The spec states full registration is not
  required, so the screen validates input and explains that it stops there.
- **Refreshing mid-MFA restarts sign-in.** Only the authenticated session
  persists. This prevents errors in challenge regeneration.
- **A 600ms delay is added to mock requests** so loading and disabled states are
  actually visible while visually testing; this delay is set to zero for testing.

## Known limitations

These are consequences of having no backend.

1. Credentials ship in the client bundle.
2. MFA codes are static per user.
3. Access control is only presentational, since there is no server-side validation.
4. Dashboard edits are not persisted since data has nowhere to go.

## Demo

https://github.com/user-attachments/assets/a5c42086-34d7-4624-bba6-fa7970063880
