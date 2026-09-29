import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'

import { ApiError } from '@/api/apiError'
import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { PageShell } from '@/components/PageShell'
import { TextField } from '@/components/TextField'
import { useRegister } from '@/hooks/auth/useRegister'
import { buildAuthPath } from '@/lib/authRedirects'
import { zodFormResolver } from '@/lib/zodFormResolver'
import {
  registerFormSchema,
  type RegisterFormInput,
  type RegisterFormOutput,
} from '@/schemas/auth/authSchemas'

const DUPLICATE_EMAIL_MESSAGE = 'อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const registration = useRegister()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterFormOutput>({
    resolver: zodFormResolver(registerFormSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(({ email, password }) =>
    registration.mutate(
      { email, password },
      {
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setError(
              'email',
              { message: DUPLICATE_EMAIL_MESSAGE },
              { shouldFocus: true },
            )
          }
        },
      },
    ),
  )

  const showFormAlert =
    registration.error &&
    !(
      registration.error instanceof ApiError &&
      registration.error.status === 409
    )

  return (
    <PageShell title="สร้างบัญชี">
      <p className="rounded-sm border-2 border-dashed border-line-soft bg-cream p-3 text-small">
        ไม่ต้องมีบัญชีก็ใช้งานแนะนำเมนูได้ บัญชีใช้สำหรับฟีเจอร์เสริมเท่านั้น:
        เข้าสู่ระบบ เมนูโปรด ค่าเริ่มต้นการแนะนำ และประวัติเมนูที่คุณเลือก
        อีเมลใช้เป็นชื่อสำหรับเข้าสู่ระบบ
        และจะไม่ถูกใช้เพื่อโฆษณาหรือส่งต่อให้บุคคลภายนอกเพื่อวัตถุประสงค์อื่น
      </p>
      <form noValidate className="flex flex-col gap-4" onSubmit={onSubmit}>
        {showFormAlert ? (
          <FormAlert
            key={registration.submittedAt}
            message="สร้างบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
          />
        ) : null}
        <TextField
          id="register-email"
          type="email"
          label="อีเมล"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          id="register-password"
          type="password"
          label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          id="register-confirm-password"
          type="password"
          label="ยืนยันรหัสผ่าน"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button
          type="submit"
          disabled={registration.isPending}
          aria-busy={registration.isPending}
        >
          {registration.isPending ? 'กำลังสร้างบัญชี…' : 'สร้างบัญชี'}
        </Button>
      </form>
      <p className="text-small">
        มีบัญชีอยู่แล้ว?{' '}
        <Link
          to={buildAuthPath('/login', searchParams.get('returnTo'))}
          className="rounded-xs font-bold underline"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </PageShell>
  )
}
