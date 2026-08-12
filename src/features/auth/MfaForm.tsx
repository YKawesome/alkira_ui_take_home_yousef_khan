import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { useAuth } from '@/hooks/useAuth'

const CODE_LENGTH = 6

const schema = z.object({
  code: z
    .string()
    .regex(new RegExp(`^\\d{${CODE_LENGTH}}$`), 'Enter the 6-digit code.'),
})

type MfaValues = z.infer<typeof schema>

export function MfaForm() {
  const { state, verifyMfa, logout, pending, error } = useAuth()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  })

  const challenge = state.status === 'awaiting-mfa' ? state.challenge : null

  const submit = handleSubmit(({ code }) => verifyMfa(code))

  return (
    <AuthLayout
      title="Two-factor authentication"
      description={
        challenge
          ? `Enter the 6-digit code sent to ${challenge.email}.`
          : undefined
      }
    >
      <form noValidate className="grid gap-4" onSubmit={submit}>
        {challenge && (
          <Alert>
            <AlertDescription>
              Demo code: <span className="font-mono">{challenge.devCode}</span>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-2">
          <Label htmlFor="code">Verification code</Label>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <InputOTP
                {...field}
                id="code"
                maxLength={CODE_LENGTH}
                disabled={pending}
                aria-invalid={Boolean(errors.code)}
                aria-describedby={errors.code && 'code-error'}
                onComplete={() => {
                  if (!pending) void submit()
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {errors.code && (
            <p id="code-error" className="text-sm text-destructive">
              {errors.code.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Verifying…' : 'Verify'}
        </Button>

        <Button type="button" variant="ghost" size="lg" onClick={logout}>
          Use a different account
        </Button>
      </form>
    </AuthLayout>
  )
}
