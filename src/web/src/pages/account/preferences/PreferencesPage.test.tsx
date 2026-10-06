import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { preferencesQueryKey } from '@/hooks/preferences/usePreference'
import type { Preference } from '@/schemas/preferences/preferenceSchemas'
import { fakePreferences } from '@/test/fakePreferencesApi'
import { masterDataResponses } from '@/test/fakeRecommendationApi'
import {
  currentPath,
  errorResponse,
  fakeAuthApi,
  renderApp,
  testAdmin,
  testUser,
} from '@/test/renderApp'

const saved: Preference = {
  budget: 'BETWEEN_50_100',
  tasteId: 'taste_1',
  foodTypeId: null,
  zoneId: 'zone_1',
}

function fakeApi(
  options: Parameters<typeof fakePreferences>[0] = {},
  currentUser = testUser,
) {
  const preferences = fakePreferences(options)
  const api = fakeAuthApi({
    currentUser,
    responses: masterDataResponses,
    handle: preferences.handle,
  })
  const calls = (method: string, path: string) =>
    api.requests.filter(
      (request) => request.method === method && request.path === path,
    )
  return { ...api, preferences, calls }
}

function select(label: string) {
  return screen.getByLabelText<HTMLSelectElement>(label)
}

async function openPage() {
  const app = renderApp('/account/preferences')
  await screen.findByLabelText('งบประมาณ')
  return app
}

describe('PreferencesPage', () => {
  it('sends an anonymous visitor to log in first', async () => {
    fakeAuthApi()
    const { router } = renderApp('/account/preferences')

    await screen.findByRole('heading', { name: 'เข้าสู่ระบบ' })
    expect(currentPath(router)).toBe('/login?returnTo=%2Faccount%2Fpreferences')
  })

  it('offers "not set", then "any", then each master-data list', async () => {
    const api = fakeApi()
    await openPage()

    expect(
      screen.getByRole('heading', { name: 'ค่าเริ่มต้นการสุ่มเมนู' }),
    ).toBeTruthy()
    expect(screen.getByText('ยังไม่ได้ตั้งค่าเริ่มต้น')).toBeTruthy()
    const optionsOf = (label: string) =>
      [...select(label).options].map((option) => option.text)
    // Budget has no "any": the meal flow always asks for a budget range.
    expect(optionsOf('งบประมาณ')).toEqual([
      'ไม่ตั้งค่า',
      'ไม่เกิน ฿50',
      '฿50–100',
      '฿101–200',
      'มากกว่า ฿200',
    ])
    expect(optionsOf('รสชาติ')).toEqual(['ไม่ตั้งค่า', 'อะไรก็ได้', 'เผ็ด'])
    expect(optionsOf('ประเภทอาหาร')).toEqual([
      'ไม่ตั้งค่า',
      'อะไรก็ได้',
      'ข้าว',
    ])
    expect(optionsOf('โซน')).toEqual(['ไม่ตั้งค่า', 'ที่ไหนก็ได้', 'หน้ามอ'])
    for (const path of ['/api/tastes', '/api/food-types', '/api/zones']) {
      expect(api.calls('GET', path).length).toBeGreaterThan(0)
    }
  })

  it('fills the form from the saved preference', async () => {
    fakeApi({ saved })
    await openPage()

    expect(select('งบประมาณ').value).toBe('BETWEEN_50_100')
    expect(select('รสชาติ').value).toBe('taste_1')
    expect(select('ประเภทอาหาร').value).toBe('')
    expect(select('โซน').value).toBe('zone_1')
    expect(screen.queryByText('ยังไม่ได้ตั้งค่าเริ่มต้น')).toBeNull()
  })

  it('saves the complete four-field object and announces it', async () => {
    const api = fakeApi({ saved })
    const { user } = await openPage()

    await user.selectOptions(select('โซน'), '')
    await user.selectOptions(select('ประเภทอาหาร'), 'food_1')
    await user.click(screen.getByRole('button', { name: 'บันทึกค่าเริ่มต้น' }))

    expect(await screen.findByText('บันทึกค่าเริ่มต้นแล้ว')).toBeTruthy()
    expect(screen.getByText('บันทึกค่าเริ่มต้นแล้ว').getAttribute('role')).toBe(
      'status',
    )
    expect(api.calls('PUT', '/api/preferences').map((r) => r.body)).toEqual([
      {
        budget: 'BETWEEN_50_100',
        tasteId: 'taste_1',
        foodTypeId: 'food_1',
        zoneId: null,
      },
    ])
    // The preference lives only in the query cache, never in browser storage.
    expect(localStorage.length).toBe(0)
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('food_1')
  })

  it('saves "any" as a real choice, even with nothing else set', async () => {
    const api = fakeApi()
    const { user } = await openPage()

    await user.selectOptions(select('รสชาติ'), 'ANY')
    await user.selectOptions(select('ประเภทอาหาร'), 'ANY')
    await user.selectOptions(select('โซน'), 'ANY')
    await user.click(screen.getByRole('button', { name: 'บันทึกค่าเริ่มต้น' }))

    expect(await screen.findByText('บันทึกค่าเริ่มต้นแล้ว')).toBeTruthy()
    expect(api.calls('PUT', '/api/preferences').map((r) => r.body)).toEqual([
      { budget: null, tasteId: 'ANY', foodTypeId: 'ANY', zoneId: 'ANY' },
    ])
  })

  it('shows a saved "any" as selected', async () => {
    fakeApi({ saved: { ...saved, tasteId: 'ANY' } })
    await openPage()

    expect(select('รสชาติ').selectedOptions[0]?.text).toBe('อะไรก็ได้')
  })

  it('refuses an all-empty save with the approved message on the first field', async () => {
    const api = fakeApi()
    const { user } = await openPage()

    await user.click(screen.getByRole('button', { name: 'บันทึกค่าเริ่มต้น' }))

    const budget = select('งบประมาณ')
    const message = await screen.findByText(
      'เลือกอย่างน้อยหนึ่งค่า หรือกดล้างค่าเริ่มต้น',
    )
    expect(budget.getAttribute('aria-invalid')).toBe('true')
    expect(budget.getAttribute('aria-describedby')).toBe(message.id)
    expect(document.activeElement).toBe(budget)
    expect(api.calls('PUT', '/api/preferences')).toEqual([])
  })

  it('clears only after confirmation, then resets the form', async () => {
    const api = fakeApi({ saved })
    const { user } = await openPage()

    await user.click(screen.getByRole('button', { name: 'ล้างค่าเริ่มต้น' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'ล้างค่าเริ่มต้น?',
    })
    await user.click(within(dialog).getByRole('button', { name: 'ยกเลิก' }))
    expect(api.calls('DELETE', '/api/preferences')).toEqual([])

    await user.click(screen.getByRole('button', { name: 'ล้างค่าเริ่มต้น' }))
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'ล้างค่าเริ่มต้น',
      }),
    )

    expect(await screen.findByText('ล้างค่าเริ่มต้นแล้ว')).toBeTruthy()
    expect(api.calls('DELETE', '/api/preferences')).toHaveLength(1)
    expect(api.preferences.current()).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(select('งบประมาณ').value).toBe('')
    expect(select('โซน').value).toBe('')
    expect(screen.getByText('ยังไม่ได้ตั้งค่าเริ่มต้น')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'ล้างค่าเริ่มต้น' })).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'บันทึกค่าเริ่มต้น' }),
    )
  })

  it('marks a choice that no longer exists and reloads the lists', async () => {
    const api = fakeApi({
      saved,
      failSave: () =>
        errorResponse(400, 'VALIDATION_ERROR', { zoneId: 'Unknown zone ID.' }),
    })
    const { user } = await openPage()
    const zoneLoads = api.calls('GET', '/api/zones').length

    await user.click(screen.getByRole('button', { name: 'บันทึกค่าเริ่มต้น' }))

    const message = await screen.findByText(
      'ตัวเลือกนี้ไม่มีในระบบแล้ว กรุณาเลือกใหม่',
    )
    expect(select('โซน').getAttribute('aria-describedby')).toBe(message.id)
    expect(document.activeElement).toBe(select('โซน'))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(api.calls('GET', '/api/zones').length).toBeGreaterThan(zoneLoads)
  })

  it('shows a general alert for any other failed save', async () => {
    fakeApi({ saved, failSave: () => errorResponse(500, 'INTERNAL_ERROR') })
    const { user } = await openPage()

    await user.click(screen.getByRole('button', { name: 'บันทึกค่าเริ่มต้น' }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'บันทึกค่าเริ่มต้นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
    )
  })

  it('works the same for an ADMIN account', async () => {
    fakeApi({ saved }, testAdmin)
    await openPage()

    expect(select('งบประมาณ').value).toBe('BETWEEN_50_100')
  })

  it('is linked from the account page, and logging out drops the cached preference', async () => {
    fakeApi({ saved })
    const { user, queryClient } = renderApp('/account')

    await user.click(
      await screen.findByRole('link', { name: 'ค่าเริ่มต้นการสุ่มเมนู' }),
    )
    await screen.findByLabelText('งบประมาณ')
    expect(
      queryClient.getQueriesData({ queryKey: preferencesQueryKey }),
    ).not.toEqual([])

    await user.click(screen.getByRole('link', { name: 'กลับไปบัญชีของฉัน' }))
    await user.click(await screen.findByRole('button', { name: 'ออกจากระบบ' }))
    await screen.findByRole('heading', { name: 'วันนี้กินอะไรดี?' })
    expect(
      queryClient.getQueriesData({ queryKey: preferencesQueryKey }),
    ).toEqual([])
  })
})
