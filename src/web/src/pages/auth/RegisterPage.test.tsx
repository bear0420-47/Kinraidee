import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  currentPath,
  errorResponse,
  fakeAuthApi,
  renderApp,
} from '@/test/renderApp'

async function fillRegister(
  user: ReturnType<typeof renderApp>['user'],
  {
    email = 'new@example.com',
    password = 'password1',
    confirm = password,
  }: { email?: string; password?: string; confirm?: string } = {},
) {
  await user.type(await screen.findByLabelText('อีเมล'), email)
  await user.type(
    screen.getByLabelText('รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)'),
    password,
  )
  await user.type(screen.getByLabelText('ยืนยันรหัสผ่าน'), confirm)
}

describe('RegisterPage', () => {
  it('sends only email and password with cookies, then lands on the account page', async () => {
    const api = fakeAuthApi()
    const { router, user } = renderApp('/register')

    await fillRegister(user)
    await user.click(screen.getByRole('button', { name: 'สร้างบัญชี' }))

    await screen.findByRole('heading', { name: 'บัญชีของฉัน' })
    expect(currentPath(router)).toBe('/account')
    expect(api.requests).toContainEqual({
      method: 'POST',
      path: '/api/auth/register',
      credentials: 'include',
      body: { email: 'new@example.com', password: 'password1' },
    })
  })

  it('shows a field error and focuses email when the email is already registered', async () => {
    fakeAuthApi({
      responses: {
        'POST /api/auth/register': () =>
          errorResponse(409, 'EMAIL_ALREADY_REGISTERED'),
      },
    })
    const { router, user } = renderApp('/register')

    await fillRegister(user)
    await user.click(screen.getByRole('button', { name: 'สร้างบัญชี' }))

    const email = screen.getByLabelText('อีเมล')
    await waitFor(() => expect(document.activeElement).toBe(email))
    expect(
      document.getElementById(email.getAttribute('aria-describedby') ?? '')
        ?.textContent,
    ).toBe('อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(currentPath(router)).toBe('/register')
  })

  it('blocks submission when the confirmation does not match', async () => {
    const api = fakeAuthApi()
    const { user } = renderApp('/register')

    await fillRegister(user, { confirm: 'different1' })
    await user.click(screen.getByRole('button', { name: 'สร้างบัญชี' }))

    const confirm = screen.getByLabelText('ยืนยันรหัสผ่าน')
    await waitFor(() => expect(document.activeElement).toBe(confirm))
    expect(confirm.getAttribute('aria-invalid')).toBe('true')
    expect(
      api.requests.some((request) => request.path === '/api/auth/register'),
    ).toBe(false)
  })

  it('shows a focused form alert for unexpected failures', async () => {
    fakeAuthApi({
      responses: {
        'POST /api/auth/register': () => new Response(null, { status: 500 }),
      },
    })
    const { user } = renderApp('/register')

    await fillRegister(user)
    await user.click(screen.getByRole('button', { name: 'สร้างบัญชี' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('สร้างบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    expect(document.activeElement).toBe(alert)
  })

  it('has no role selector or email-verification wording', async () => {
    fakeAuthApi()
    renderApp('/register')

    await screen.findByLabelText('อีเมล')
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.queryByRole('radio')).toBeNull()
    expect(document.body.textContent).not.toMatch(/ยืนยันอีเมล|verify/i)
  })

  it('redirects an authenticated visitor using the safe returnTo', async () => {
    fakeAuthApi({
      currentUser: { id: 'u', email: 'u@example.com', role: 'USER' },
    })
    const { router } = renderApp('/register?returnTo=%2F')

    await waitFor(() => expect(currentPath(router)).toBe('/'))
  })
})
