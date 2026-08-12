import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

type LoginValues = z.infer<typeof schema>

export function LoginForm() {
  const { login, pending, error } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <AuthLayout title="Sign in" description="Use your Alkira account to continue.">
      <form
        noValidate
        className="grid gap-4"
        onSubmit={handleSubmit(({ email, password }) => login(email, password))}
      >
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email && 'email-error'}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password && 'password-error'}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
