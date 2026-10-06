import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  currentPath,
  fakeAuthApi,
  renderApp,
  testAdmin,
  testUser,
} from '@/test/renderApp'

const mainNav = () => screen.findByRole('navigation', { name: 'เมนูหลัก' })

describe('SiteHeader home link', () => {
  it('hides the home link on Home itself', async () => {
    fakeAuthApi()
    renderApp('/')

    const nav = await mainNav()
    expect(within(nav).queryByRole('link', { name: 'หน้าแรก' })).toBeNull()
  })

  it('links Home from the meal flow', async () => {
    fakeAuthApi()
    const { router, user } = renderApp('/meal')

    await user.click(
      within(await mainNav()).getByRole('link', { name: 'หน้าแรก' }),
    )

    await waitFor(() => expect(currentPath(router)).toBe('/'))
  })

  it('keeps both account links for an admin next to the home link', async () => {
    fakeAuthApi({ currentUser: testAdmin })
    renderApp('/account')

    await screen.findByRole('link', { name: 'จัดการระบบ' })
    expect(
      within(await mainNav())
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/', '/account', '/admin'])
  })
})

describe('AccountPage', () => {
  it('links back to Home', async () => {
    fakeAuthApi({ currentUser: testUser })
    const { router, user } = renderApp('/account')

    await user.click(await screen.findByRole('link', { name: 'กลับหน้าแรก' }))

    await waitFor(() => expect(currentPath(router)).toBe('/'))
  })
})
