import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(12, 'Use at least 12 characters.')
    .regex(/[a-z]/, 'Include a lowercase letter.')
    .regex(/[A-Z]/, 'Include an uppercase letter.')
    .regex(/\d/, 'Include a number.'),
})

type SignUpValues = z.infer<typeof schema>

const FIELDS = [
  { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'new-password',
  },
] as const

export function SignUp() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  })

  return (
    <AuthLayout
      title="Create an account"
      description="Per the spec, this doesn't actually create an account :) It does validate the password though!"
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={handleSubmit(() => setSubmitted(true))}
      >
        {submitted && (
          <Alert>
            <AlertDescription>
              All set! Since this is a demo, this won't actually create an account, but you can go to the{' '}
              <Link to="/login" className="text-foreground underline underline-offset-4">
                login page
              </Link>{' '}
              and sign in with a demo account :)
            </AlertDescription>
          </Alert>
        )}

        {FIELDS.map((field) => (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] && `${field.name}-error`}
              {...register(field.name)}
            />
            {errors[field.name] && (
              <p id={`${field.name}-error`} className="text-sm text-destructive">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}

        <Button type="submit" size="lg">
          Create account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
