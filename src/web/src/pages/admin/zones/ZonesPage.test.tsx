import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Zone } from '@/schemas/admin/zones/zoneSchemas'
import {
  errorResponse,
  fakeAuthApi,
  jsonResponse,
  renderApp,
  testAdmin,
} from '@/test/renderApp'

const frontGate: Zone = {
  id: 'zone_1',
  name: { th: 'หน้ามอ', en: 'Front Gate' },
  description: { th: 'ร้านรอบประตูหน้า', en: 'Around the front gate' },
  sortOrder: 1,
}

const backGate: Zone = {
  id: 'zone_2',
  name: { th: 'หลังมอ', en: 'Back Gate' },
  description: null,
  sortOrder: 2,
}

type ZoneBody = {
  name: Zone['name']
  description?: Zone['description']
  sortOrder: number
}

// Stateful zone API on top of the auth fake; overrides replace individual routes.
function fakeZonesApi(
  initialZones: Zone[] = [frontGate, backGate],
  overrides: Record<string, (body: unknown) => Response> = {},
) {
  let zones = [...initialZones]

  return fakeAuthApi({
    currentUser: testAdmin,
    responses: {
      'GET /api/zones': () => jsonResponse(200, { data: { items: zones } }),
      'POST /api/zones': (body) => {
        const { description = null, ...fields } = body as ZoneBody
        const zone = { id: 'zone_new', description, ...fields }
        zones = [...zones, zone]
        return jsonResponse(201, { data: { zone } })
      },
      [`PATCH /api/zones/${frontGate.id}`]: (body) => {
        const zone = { ...frontGate, ...(body as Partial<ZoneBody>) }
        zones = zones.map((item) => (item.id === zone.id ? zone : item))
        return jsonResponse(200, { data: { zone } })
      },
      [`DELETE /api/zones/${frontGate.id}`]: () => {
        zones = zones.filter((item) => item.id !== frontGate.id)
        return new Response(null, { status: 204 })
      },
      ...overrides,
    },
  })
}

function zoneRequests(api: ReturnType<typeof fakeZonesApi>, method: string) {
  return api.requests.filter(
    (request) =>
      request.method === method && request.path.startsWith('/api/zones'),
  )
}

async function openZonesPage() {
  const app = renderApp('/admin/zones')
  await screen.findByRole('table', { name: 'รายการโซน' })
  return app
}

function dialog() {
  return within(screen.getByRole('dialog'))
}

function errorFor(field: HTMLElement) {
  return document.getElementById(field.getAttribute('aria-describedby') ?? '')
    ?.textContent
}

describe('ZonesPage list', () => {
  it('lets ADMIN see every zone with its fields and the special-option note', async () => {
    fakeZonesApi()
    await openZonesPage()

    expect(screen.getByRole('heading', { name: 'จัดการโซน' })).toBeTruthy()
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.map((row) => row.textContent)).toEqual([
      'หน้ามอFront Gateร้านรอบประตูหน้าAround the front gate1แก้ไขลบ',
      'หลังมอBack Gateไม่มีไม่มี2แก้ไขลบ',
    ])
    expect(
      screen.getByText(
        'ตัวเลือก “ที่ไหนก็ได้” เป็นตัวเลือกพิเศษในหน้าสุ่มเมนู ไม่ต้องสร้างเป็นโซน',
      ),
    ).toBeTruthy()
    expect(
      within(screen.getByRole('table')).queryByText(/ที่ไหนก็ได้/),
    ).toBeNull()
  })

  it('shows the empty state when there are no zones', async () => {
    fakeZonesApi([])
    renderApp('/admin/zones')

    expect(await screen.findByText('ยังไม่มีโซน')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('shows a load error with a retry that refetches the list', async () => {
    let failures = 1
    const api = fakeZonesApi([frontGate], {
      'GET /api/zones': () =>
        failures-- > 0
          ? errorResponse(500, 'INTERNAL_SERVER_ERROR')
          : jsonResponse(200, { data: { items: [frontGate] } }),
    })
    const { user } = renderApp('/admin/zones')

    await user.click(await screen.findByRole('button', { name: 'ลองใหม่' }))

    expect(await screen.findByRole('table')).toBeTruthy()
    expect(zoneRequests(api, 'GET')).toHaveLength(2)
  })

  it('has no GPS or coordinate fields', async () => {
    fakeZonesApi()
    const { user } = await openZonesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มโซน' }))

    expect(
      dialog()
        .getAllByRole('textbox')
        .map((field) => field.id),
    ).toEqual([
      'zone-name-th',
      'zone-name-en',
      'zone-description-th',
      'zone-description-en',
      'zone-sort-order',
    ])
    expect(screen.queryByText(/GPS|พิกัด|latitude|longitude/i)).toBeNull()
  })
})

describe('ZonesPage create', () => {
  it('validates required names and integer sortOrder, focusing the first invalid field', async () => {
    const api = fakeZonesApi()
    const { user } = await openZonesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มโซน' }))
    await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), '1.5')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มโซน' }))

    const nameTh = dialog().getByLabelText('ชื่อโซนภาษาไทย')
    await waitFor(() => expect(document.activeElement).toBe(nameTh))
    expect(errorFor(nameTh)).toBe('กรุณากรอกชื่อภาษาไทย')
    expect(errorFor(dialog().getByLabelText('ชื่อโซนภาษาอังกฤษ'))).toBe(
      'กรุณากรอกชื่อภาษาอังกฤษ',
    )
    expect(errorFor(dialog().getByLabelText('ลำดับการแสดงผล'))).toBe(
      'ลำดับการแสดงผลต้องเป็นจำนวนเต็ม',
    )
    expect(zoneRequests(api, 'POST')).toEqual([])
  })

  it('creates a zone with trimmed values and refreshes the list', async () => {
    const api = fakeZonesApi()
    const { user } = await openZonesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มโซน' }))
    await user.type(dialog().getByLabelText('ชื่อโซนภาษาไทย'), '  โรงอาหาร ')
    await user.type(dialog().getByLabelText('ชื่อโซนภาษาอังกฤษ'), 'Canteen ')
    await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), '3')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มโซน' }))

    expect(
      await screen.findByRole('rowheader', { name: 'โรงอาหาร' }),
    ).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText('เพิ่มโซน โรงอาหาร แล้ว')).toBeTruthy()
    expect(zoneRequests(api, 'POST')).toEqual([
      {
        method: 'POST',
        path: '/api/zones',
        credentials: 'include',
        body: {
          name: { th: 'โรงอาหาร', en: 'Canteen' },
          description: null,
          sortOrder: 3,
        },
      },
    ])
    expect(zoneRequests(api, 'GET')).toHaveLength(2)
  })

  it('marks both name fields when the API reports a duplicate name', async () => {
    fakeZonesApi([frontGate], {
      'POST /api/zones': () =>
        errorResponse(409, 'ZONE_NAME_ALREADY_EXISTS', {
          'name.th': 'Already used by another zone.',
        }),
    })
    const { user } = await openZonesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มโซน' }))
    await user.type(dialog().getByLabelText('ชื่อโซนภาษาไทย'), 'หน้ามอ')
    await user.type(dialog().getByLabelText('ชื่อโซนภาษาอังกฤษ'), 'Other')
    await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), '9')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มโซน' }))

    const nameTh = dialog().getByLabelText('ชื่อโซนภาษาไทย')
    await waitFor(() => expect(document.activeElement).toBe(nameTh))
    expect(errorFor(nameTh)).toBe('มีโซนอื่นใช้ชื่อนี้แล้ว กรุณาใช้ชื่ออื่น')
    expect(
      errorFor(dialog().getByLabelText('ชื่อโซนภาษาอังกฤษ')),
    ).toBeUndefined()
  })

  it('shows a form alert for other save failures and keeps the dialog open', async () => {
    fakeZonesApi([frontGate], {
      'POST /api/zones': () => errorResponse(500, 'INTERNAL_SERVER_ERROR'),
    })
    const { user } = await openZonesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มโซน' }))
    await user.type(dialog().getByLabelText('ชื่อโซนภาษาไทย'), 'โรงอาหาร')
    await user.type(dialog().getByLabelText('ชื่อโซนภาษาอังกฤษ'), 'Canteen')
    await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), '3')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มโซน' }))

    const alert = await dialog().findByRole('alert')
    expect(alert.textContent).toBe('บันทึกโซนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    expect(document.activeElement).toBe(alert)
  })
})

describe('ZonesPage edit', () => {
  it('pre-fills the form and PATCHes only the changed fields', async () => {
    const api = fakeZonesApi()
    const { user } = await openZonesPage()

    await user.click(screen.getByRole('button', { name: 'แก้ไขโซน หน้ามอ' }))
    expect(
      dialog().getByLabelText<HTMLInputElement>('ชื่อโซนภาษาไทย').value,
    ).toBe('หน้ามอ')
    expect(
      dialog().getByLabelText<HTMLInputElement>(
        'คำอธิบายภาษาอังกฤษ (ไม่บังคับ)',
      ).value,
    ).toBe('Around the front gate')

    const sortOrder = dialog().getByLabelText('ลำดับการแสดงผล')
    await user.clear(sortOrder)
    await user.type(sortOrder, '5')
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await screen.findByText('บันทึกการแก้ไขโซน หน้ามอ แล้ว')
    expect(zoneRequests(api, 'PATCH').map((request) => request.body)).toEqual([
      { sortOrder: 5 },
    ])
    const row = screen.getByRole('rowheader', { name: 'หน้ามอ' }).closest('tr')
    expect(row?.textContent).toContain('5')
  })

  it('closes without a request when nothing changed', async () => {
    const api = fakeZonesApi()
    const { user } = await openZonesPage()

    await user.click(screen.getByRole('button', { name: 'แก้ไขโซน หน้ามอ' }))
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    expect(await screen.findByText('ไม่มีข้อมูลที่เปลี่ยนแปลง')).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(zoneRequests(api, 'PATCH')).toEqual([])
  })
})

describe('ZonesPage delete', () => {
  it('asks for confirmation, then deletes and refreshes the list', async () => {
    const api = fakeZonesApi()
    const { user } = await openZonesPage()

    await user.click(screen.getByRole('button', { name: 'ลบโซน หน้ามอ' }))
    expect(dialog().getByRole('heading', { name: 'ลบโซนนี้?' })).toBeTruthy()
    expect(zoneRequests(api, 'DELETE')).toEqual([])

    await user.click(dialog().getByRole('button', { name: 'ลบโซน' }))

    await screen.findByText('ลบโซน หน้ามอ แล้ว')
    expect(screen.queryByRole('rowheader', { name: 'หน้ามอ' })).toBeNull()
    expect(zoneRequests(api, 'DELETE').map((request) => request.path)).toEqual([
      '/api/zones/zone_1',
    ])
    // The deleted row's button is gone, so focus falls back to the create button.
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'เพิ่มโซน' }),
    )
  })

  it('cancels without deleting and returns focus to the row action', async () => {
    const api = fakeZonesApi()
    const { user } = await openZonesPage()

    const deleteButton = screen.getByRole('button', { name: 'ลบโซน หน้ามอ' })
    await user.click(deleteButton)
    await user.click(dialog().getByRole('button', { name: 'ยกเลิก' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(deleteButton)
    expect(zoneRequests(api, 'DELETE')).toEqual([])
  })

  it('shows the approved message when the zone is still used by restaurants', async () => {
    fakeZonesApi([frontGate], {
      [`DELETE /api/zones/${frontGate.id}`]: () =>
        errorResponse(409, 'ZONE_IN_USE'),
    })
    const { user } = await openZonesPage()

    await user.click(screen.getByRole('button', { name: 'ลบโซน หน้ามอ' }))
    await user.click(dialog().getByRole('button', { name: 'ลบโซน' }))

    expect((await dialog().findByRole('alert')).textContent).toBe(
      'ยังลบโซนนี้ไม่ได้ เพราะมีร้านอาหารใช้งานอยู่ กรุณาย้ายร้านไปโซนอื่นก่อน',
    )
    expect(screen.getByRole('rowheader', { name: 'หน้ามอ' })).toBeTruthy()
  })
})

describe('ZonesPage dialog keyboard behavior', () => {
  it('focuses the first field, traps Tab, makes the page inert, and closes on Escape', async () => {
    fakeZonesApi()
    const { user } = await openZonesPage()
    const createButton = screen.getByRole('button', { name: 'เพิ่มโซน' })

    await user.click(createButton)
    const nameTh = dialog().getByLabelText('ชื่อโซนภาษาไทย')
    expect(document.activeElement).toBe(nameTh)
    expect(screen.getByRole('main').closest('[inert]')).toBeTruthy()

    await user.tab({ shift: true })
    expect(document.activeElement).toBe(
      dialog().getByRole('button', { name: 'เพิ่มโซน' }),
    )
    await user.tab()
    expect(document.activeElement).toBe(nameTh)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(createButton)
    expect(document.querySelector('[inert]')).toBeNull()
  })
})
