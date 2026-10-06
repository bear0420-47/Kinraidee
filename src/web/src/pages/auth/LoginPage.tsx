import { useForm } from 'react-hook-form'
import { Link, useLocation, useSearchParams } from 'react-router'

import { ApiError } from '@/api/apiError'
import { Button } from '@/components/Button'
import { FormAlert } from '@/components/FormAlert'
import { PageShell } from '@/components/PageShell'
import { TextField } from '@/components/TextField'
import { useLogin } from '@/hooks/auth/useLogin'
import {
  buildAuthPath,
  readLoginNotice,
  type LoginNotice,
} from '@/lib/authRedirects'
import { zodFormResolver } from '@/lib/zodFormResolver'
import {
  loginFormSchema,
  type AuthCredentials,
  type LoginFormInput,
} from '@/schemas/auth/authSchemas'

function getLoginErrorMessage(error: Error) {
  if (error instanceof ApiError && error.status === 401) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  }
  return 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
}

const loginNoticeMessages: Record<LoginNotice, string> = {
  FAVORITE_LOGIN: 'เข้าสู่ระบบเพื่อบันทึกเมนูโปรด',
}

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const notice = readLoginNotice(useLocation().state)
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput, unknown, AuthCredentials>({
    resolver: zodFormResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <PageShell title="เข้าสู่ระบบ">
      {notice ? (
        <p
          role="status"
          className="rounded-sm border-2 border-paper bg-cream p-3 font-bold"
        >
          {loginNoticeMessages[notice]}
        </p>
      ) : null}
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((credentials) => login.mutate(credentials))}
      >
        {login.error ? (
          <FormAlert
            key={login.submittedAt}
            message={getLoginErrorMessage(login.error)}
          />
        ) : null}
        <TextField
          id="login-email"
          type="email"
          label="อีเมล"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          id="login-password"
          type="password"
          label="รหัสผ่าน"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button
          type="submit"
          disabled={login.isPending}
          aria-busy={login.isPending}
        >
          {login.isPending ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </Button>
      </form>
      <p className="text-small">
        ยังไม่มีบัญชี?{' '}
        <Link
          to={buildAuthPath('/register', searchParams.get('returnTo'))}
          className="rounded-xs font-bold underline"
        >
          สร้างบัญชี
        </Link>
      </p>
    </PageShell>
  )
}
