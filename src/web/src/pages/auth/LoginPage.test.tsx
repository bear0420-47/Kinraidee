import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  currentPath,
  errorResponse,
  fakeAuthApi,
  renderApp,
  testAdmin,
} from '@/test/renderApp'

async function fillLogin(
  user: ReturnType<typeof renderApp>['user'],
  email: string,
  password: string,
) {
  await user.type(await screen.findByLabelText('อีเมล'), email)
  await user.type(screen.getByLabelText('รหัสผ่าน'), password)
}

describe('LoginPage', () => {
  it('submits through the typed client with cookies and returns to a safe returnTo', async () => {
    const api = fakeAuthApi()
    const { router, user } = renderApp('/login?returnTo=%2F')

    await fillLogin(user, ' User@Example.com ', 'password1')
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

    await waitFor(() => expect(currentPath(router)).toBe('/'))
    expect(api.requests).toContainEqual({
      method: 'POST',
      path: '/api/auth/login',
      credentials: 'include',
      body: { email: 'User@Example.com', password: 'password1' },
    })
  })

  it('ignores an external returnTo and falls back by role', async () => {
    fakeAuthApi({ loginAs: testAdmin })
    const { router, user } = renderApp(
      '/login?returnTo=https%3A%2F%2Fevil.example',
    )

    await fillLogin(user, 'admin@example.com', 'password1')
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

    await screen.findByRole('heading', { name: 'จัดการระบบ' })
    expect(currentPath(router)).toBe('/admin')
  })

  it('rejects a protocol-relative returnTo', async () => {
    fakeAuthApi()
    const { router, user } = renderApp('/login?returnTo=%2F%2Fevil.example')

    await fillLogin(user, 'user@example.com', 'password1')
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

    await screen.findByRole('heading', { name: 'บัญชีของฉัน' })
    expect(currentPath(router)).toBe('/account')
  })

  it('shows one generic message for invalid credentials and focuses it', async () => {
    fakeAuthApi({
      responses: {
        'POST /api/auth/login': () => errorResponse(401, 'UNAUTHENTICATED'),
      },
    })
    const { router, user } = renderApp('/login')

    await fillLogin(user, 'nobody@example.com', 'password1')
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    expect(document.activeElement).toBe(alert)
    expect(currentPath(router)).toBe('/login')
  })

  it('moves focus to the first invalid field and links errors with aria-describedby', async () => {
    const api = fakeAuthApi()
    const { user } = renderApp('/login')

    await user.click(await screen.findByRole('button', { name: 'เข้าสู่ระบบ' }))

    const email = screen.getByLabelText('อีเมล')
    await waitFor(() => expect(document.activeElement).toBe(email))
    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(
      document.getElementById(email.getAttribute('aria-describedby') ?? '')
        ?.textContent,
    ).toBe('กรุณากรอกอีเมล')
    expect(
      api.requests.some((request) => request.path === '/api/auth/login'),
    ).toBe(false)
  })

  it('works by keyboard: tab through fields and submit with Enter', async () => {
    fakeAuthApi()
    const { router, user } = renderApp('/login')
    await screen.findByLabelText('อีเมล')

    // Header brand, home link, and login link come first in tab order.
    await user.tab()
    await user.tab()
    await user.tab()
    await user.tab()
    expect(document.activeElement).toBe(screen.getByLabelText('อีเมล'))
    await user.keyboard('user@example.com')
    await user.tab()
    expect(document.activeElement).toBe(screen.getByLabelText('รหัสผ่าน'))
    await user.keyboard('password1{Enter}')

    await waitFor(() => expect(currentPath(router)).toBe('/account'))
  })

  it('keeps passwords and tokens out of browser storage and preserves recommendation state', async () => {
    fakeAuthApi()
    sessionStorage.setItem('kinraidee:recommendation', '{"zoneId":null}')
    const { router, user } = renderApp('/login?returnTo=%2F')

    await user.click(await screen.findByRole('link', { name: 'สร้างบัญชี' }))
    expect(currentPath(router)).toBe('/register?returnTo=%2F')
    await user.click(
      within(screen.getByRole('main')).getByRole('link', {
        name: 'เข้าสู่ระบบ',
      }),
    )
    await fillLogin(user, 'user@example.com', 'secret-password')
    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))
    await waitFor(() => expect(currentPath(router)).toBe('/'))

    const stored = [localStorage, sessionStorage]
      .flatMap((storage) =>
        Object.keys(storage).map((key) => `${key}=${storage.getItem(key)}`),
      )
      .join('\n')
    expect(stored).not.toContain('secret-password')
    expect(stored.toLowerCase()).not.toContain('token')
    expect(sessionStorage.getItem('kinraidee:recommendation')).toBe(
      '{"zoneId":null}',
    )
    expect(document.cookie).toBe('')
  })
})
