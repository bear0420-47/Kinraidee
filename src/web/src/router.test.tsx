import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  currentPath,
  fakeAuthApi,
  renderApp,
  testAdmin,
  testUser,
} from '@/test/renderApp'

function header() {
  return within(screen.getByRole('banner'))
}

describe('site header', () => {
  it('shows เข้าสู่ระบบ to anonymous visitors with the current page as returnTo', async () => {
    fakeAuthApi()
    renderApp('/')

    const link = await header().findByRole('link', { name: 'เข้าสู่ระบบ' })
    expect(link.getAttribute('href')).toBe('/login?returnTo=%2F')
    expect(header().queryByRole('link', { name: 'จัดการระบบ' })).toBeNull()
  })

  it('shows บัญชีของฉัน to USER accounts', async () => {
    fakeAuthApi({ currentUser: testUser })
    renderApp('/')

    const link = await header().findByRole('link', { name: 'บัญชีของฉัน' })
    expect(link.getAttribute('href')).toBe('/account')
    expect(header().queryByRole('link', { name: 'จัดการระบบ' })).toBeNull()
  })

  it('shows จัดการระบบ to ADMIN accounts', async () => {
    fakeAuthApi({ currentUser: testAdmin })
    renderApp('/')

    const link = await header().findByRole('link', { name: 'จัดการระบบ' })
    expect(link.getAttribute('href')).toBe('/admin')
  })

  it('links the brand to Home', async () => {
    fakeAuthApi()
    renderApp('/login')

    expect(
      (await header().findByRole('link', { name: 'Kinraidee' })).getAttribute(
        'href',
      ),
    ).toBe('/')
  })
})

describe('route guards', () => {
  it.each(['/account', '/account/favorites', '/admin', '/admin/zones?page=2'])(
    'redirects anonymous %s to login with returnTo',
    async (path) => {
      fakeAuthApi()
      const { router } = renderApp(path)

      await screen.findByRole('heading', { name: 'เข้าสู่ระบบ' })
      expect(currentPath(router)).toBe(
        `/login?${new URLSearchParams({ returnTo: path })}`,
      )
    },
  )

  it('redirects USER away from admin routes with the approved message', async () => {
    fakeAuthApi({ currentUser: testUser })
    const { router } = renderApp('/admin/zones')

    await screen.findByRole('heading', { name: 'บัญชีของฉัน' })
    expect(currentPath(router)).toBe('/account')
    expect(screen.getByRole('status').textContent).toBe(
      'บัญชีนี้ไม่มีสิทธิ์จัดการระบบ',
    )
  })

  it('lets ADMIN open admin routes and lists only approved admin links', async () => {
    fakeAuthApi({ currentUser: testAdmin })
    renderApp('/admin')

    await screen.findByRole('heading', { name: 'จัดการระบบ' })
    const links = within(
      screen.getByRole('navigation', { name: 'เมนูจัดการระบบ' }),
    ).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/admin/zones',
      '/admin/food-types',
      '/admin/tastes',
      '/admin/restaurants',
      '/admin/menu-items',
      '/admin/audit-logs',
    ])
  })

  it('shows account navigation for approved account features only', async () => {
    fakeAuthApi({ currentUser: testUser })
    renderApp('/account')

    await screen.findByRole('heading', { name: 'บัญชีของฉัน' })
    const links = within(
      screen.getByRole('navigation', { name: 'เมนูบัญชี' }),
    ).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/account/favorites',
      '/account/history',
      '/account/preferences',
    ])
    expect(screen.queryByRole('status')).toBeNull()
  })

  it.each([
    [testAdmin, '/admin'],
    [testUser, '/account'],
  ])(
    'redirects authenticated %o away from /login to %s',
    async (account, expected) => {
      fakeAuthApi({ currentUser: account })
      const { router } = renderApp('/login')

      await waitFor(() => expect(currentPath(router)).toBe(expected))
    },
  )

  it('shows an error instead of redirecting when the session check fails', async () => {
    fakeAuthApi({
      responses: {
        'GET /api/auth/me': () => new Response(null, { status: 500 }),
      },
    })
    const { router } = renderApp('/account')

    expect((await screen.findByRole('alert')).textContent).toContain(
      'ตรวจสอบสถานะการเข้าสู่ระบบไม่สำเร็จ',
    )
    expect(currentPath(router)).toBe('/account')
  })
})

describe('logout', () => {
  it('calls the API, clears the current user, and returns Home', async () => {
    const api = fakeAuthApi({ currentUser: testUser })
    const { router, user } = renderApp('/account')

    await user.click(await screen.findByRole('button', { name: 'ออกจากระบบ' }))

    await header().findByRole('link', { name: 'เข้าสู่ระบบ' })
    expect(currentPath(router)).toBe('/')
    expect(api.requests).toContainEqual(
      expect.objectContaining({
        method: 'POST',
        path: '/api/auth/logout',
        credentials: 'include',
      }),
    )
  })

  it('keeps anonymous recommendation state in sessionStorage', async () => {
    fakeAuthApi({ currentUser: testAdmin })
    sessionStorage.setItem('kinraidee:recommendation', '{"budget":"UNDER_50"}')
    const { user } = renderApp('/admin')

    await user.click(await screen.findByRole('button', { name: 'ออกจากระบบ' }))
    await header().findByRole('link', { name: 'เข้าสู่ระบบ' })

    expect(sessionStorage.getItem('kinraidee:recommendation')).toBe(
      '{"budget":"UNDER_50"}',
    )
  })

  it('shows a retryable error when logout fails', async () => {
    fakeAuthApi({
      currentUser: testUser,
      responses: {
        'POST /api/auth/logout': () => new Response(null, { status: 500 }),
      },
    })
    const { router, user } = renderApp('/account')

    await user.click(await screen.findByRole('button', { name: 'ออกจากระบบ' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('ออกจากระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    expect(document.activeElement).toBe(alert)
    expect(currentPath(router)).toBe('/account')
  })
})

describe('admin font area', () => {
  it('marks the document as the admin area only while an admin route is shown', async () => {
    fakeAuthApi({ currentUser: testAdmin })
    const { router } = renderApp('/')

    await screen.findByRole('link', { name: 'จัดการระบบ' })
    expect(document.documentElement.dataset.area).toBeUndefined()

    await router.navigate('/admin')
    await screen.findByRole('heading', { name: 'จัดการระบบ' })
    expect(document.documentElement.dataset.area).toBe('admin')

    await router.navigate('/')
    await waitFor(() =>
      expect(document.documentElement.dataset.area).toBeUndefined(),
    )
  })

  it('does not mark the admin area for a USER redirected away from it', async () => {
    fakeAuthApi({ currentUser: testUser })
    renderApp('/admin')

    await screen.findByRole('heading', { name: 'บัญชีของฉัน' })
    expect(document.documentElement.dataset.area).toBeUndefined()
  })
})
