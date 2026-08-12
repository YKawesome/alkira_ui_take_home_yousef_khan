import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { LoginForm } from '@/features/auth/LoginForm'
import { MfaForm } from '@/features/auth/MfaForm'
import { SignUp } from '@/features/auth/SignUp'
import { Dashboard } from '@/pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allow="anonymous" />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      <Route element={<ProtectedRoute allow="awaiting-mfa" />}>
        <Route path="/mfa" element={<MfaForm />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
