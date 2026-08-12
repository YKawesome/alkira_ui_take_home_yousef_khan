import { Link } from 'react-router-dom'

export function SignUp() {
  return (
    <div>
      <h1>Create an account</h1>
      <p>Registration is out of scope for this exercise.</p>
      <Link to="/login">Back to sign in</Link>
    </div>
  )
}
