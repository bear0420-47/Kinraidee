import { ForkKnife } from '@phosphor-icons/react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'
import { fakeCollectionApi } from '@/test/fakeCollectionApi'
import { dialog, errorFor } from '@/test/formQueries'
import { errorResponse, renderApp } from '@/test/renderApp'

const spicy: Taste = {
  id: 'taste_1',
  name: { th: 'เผ็ด', en: 'Spicy' },
  icon: 'flame',
  sortOrder: 1,
}

const mild: Taste = {
  id: 'taste_2',
  name: { th: 'กลมกล่อม', en: 'Mild' },
  icon: null,
  sortOrder: 2,
}

function fakeTastesApi(
  items: Taste[] = [spicy, mild],
  overrides: Record<string, (body: unknown) => Response> = {},
) {
  return fakeCollectionApi({
    path: '/api/tastes',
    itemKey: 'taste',
    items,
    create: (body) => {
      const { icon = null, ...fields } = body as Omit<Taste, 'id'>
      return { id: 'taste_new', icon, ...fields }
    },
    overrides,
  })
}

async function openTastesPage() {
  const app = renderApp('/admin/tastes')
  await screen.findByRole('table', { name: 'รายการรสชาติ' })
  return app
}

function iconSelect() {
  return dialog().getByRole<HTMLSelectElement>('combobox', {
    name: 'ไอคอน (ไม่บังคับ)',
  })
}

async function fillTaste(
  user: ReturnType<typeof renderApp>['user'],
  { th, en, sortOrder }: { th: string; en: string; sortOrder: string },
) {
  await user.type(dialog().getByLabelText('ชื่อรสชาติภาษาไทย'), th)
  await user.type(dialog().getByLabelText('ชื่อรสชาติภาษาอังกฤษ'), en)
  await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), sortOrder)
}

describe('TastesPage list', () => {
  it('lets ADMIN see every taste with its icon label and the special-option note', async () => {
    fakeTastesApi()
    await openTastesPage()

    expect(screen.getByRole('heading', { name: 'จัดการรสชาติ' })).toBeTruthy()
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.map((row) => row.textContent)).toEqual([
      'เผ็ดSpicyเปลวไฟ1แก้ไขลบ',
      'กลมกล่อมMildไอคอนเริ่มต้น2แก้ไขลบ',
    ])
    expect(
      screen.getByText(
        'ตัวเลือก “อะไรก็ได้” เป็นตัวเลือกพิเศษในหน้าสุ่มเมนู ไม่ต้องสร้างเป็นรสชาติ',
      ),
    ).toBeTruthy()
    expect(
      within(screen.getByRole('table')).queryByText(/อะไรก็ได้/),
    ).toBeNull()
  })

  it('renders the fallback Phosphor icon for null and unknown icon keys', async () => {
    fakeTastesApi([mild, { ...spicy, icon: 'chili' }])
    await openTastesPage()

    const fallback = render(
      <ForkKnife aria-hidden size={24} className="shrink-0" />,
    ).container.innerHTML
    const iconCells = screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.querySelectorAll('td')[1])
    expect(
      iconCells.map((cell) => cell?.querySelector('svg')?.outerHTML),
    ).toEqual([fallback, fallback])
    expect(iconCells.map((cell) => cell?.textContent)).toEqual([
      'ไอคอนเริ่มต้น',
      'ไอคอนเริ่มต้น (ไม่รู้จัก chili)',
    ])
  })

  it('shows the empty state when there are no tastes', async () => {
    fakeTastesApi([])
    renderApp('/admin/tastes')

    expect(await screen.findByText('ยังไม่มีรสชาติ')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('has no description field and offers only the taste registry keys', async () => {
    fakeTastesApi()
    const { user } = await openTastesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มรสชาติ' }))

    expect(
      dialog()
        .getAllByRole('textbox')
        .map((field) => field.id),
    ).toEqual(['taste-name-th', 'taste-name-en', 'taste-sort-order'])
    expect(screen.queryByText(/คำอธิบาย/)).toBeNull()
    expect(
      [...iconSelect().options].map((option) => option.textContent),
    ).toEqual([
      'ไม่เลือก (ใช้ไอคอนเริ่มต้น)',
      'เปลวไฟ (flame)',
      'ใบไม้ (leaf)',
      'ประกาย (sparkles)',
      'หัวใจ (heart)',
      'ชาม (bowl)',
    ])
    expect(
      document.getElementById(
        iconSelect().getAttribute('aria-describedby') ?? '',
      )?.textContent,
    ).toBe('เลือกไอคอนจากชุดที่กำหนดไว้ หากไม่เลือก ระบบจะใช้ไอคอนเริ่มต้น')
  })
})

describe('TastesPage create', () => {
  it('validates localized names and integer sortOrder, focusing the first invalid field', async () => {
    const api = fakeTastesApi()
    const { user } = await openTastesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มรสชาติ' }))
    await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), '2.5')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มรสชาติ' }))

    const nameTh = dialog().getByLabelText('ชื่อรสชาติภาษาไทย')
    await waitFor(() => expect(document.activeElement).toBe(nameTh))
    expect(errorFor(nameTh)).toBe('กรุณากรอกชื่อภาษาไทย')
    expect(errorFor(dialog().getByLabelText('ชื่อรสชาติภาษาอังกฤษ'))).toBe(
      'กรุณากรอกชื่อภาษาอังกฤษ',
    )
    expect(errorFor(dialog().getByLabelText('ลำดับการแสดงผล'))).toBe(
      'ลำดับการแสดงผลต้องเป็นจำนวนเต็ม',
    )
    expect(api.requestsFor('POST')).toEqual([])
  })

  it('creates a taste with a chosen icon and refreshes the list', async () => {
    const api = fakeTastesApi()
    const { user } = await openTastesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มรสชาติ' }))
    await fillTaste(user, { th: ' เปรี้ยว ', en: 'Sour', sortOrder: '3' })
    await user.selectOptions(iconSelect(), 'leaf')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มรสชาติ' }))

    expect(
      await screen.findByRole('rowheader', { name: 'เปรี้ยว' }),
    ).toBeTruthy()
    expect(screen.getByText('เพิ่มรสชาติ เปรี้ยว แล้ว')).toBeTruthy()
    expect(api.requestsFor('POST').map((request) => request.body)).toEqual([
      { name: { th: 'เปรี้ยว', en: 'Sour' }, icon: 'leaf', sortOrder: 3 },
    ])
    expect(api.requestsFor('GET')).toHaveLength(2)
  })

  it('sends null when no icon is chosen', async () => {
    const api = fakeTastesApi()
    const { user } = await openTastesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มรสชาติ' }))
    await fillTaste(user, { th: 'หวาน', en: 'Sweet', sortOrder: '4' })
    await user.click(dialog().getByRole('button', { name: 'เพิ่มรสชาติ' }))

    await screen.findByRole('rowheader', { name: 'หวาน' })
    expect(api.requestsFor('POST')[0]?.body).toMatchObject({ icon: null })
  })

  it('marks both name fields when the API does not say which name is duplicated', async () => {
    fakeTastesApi([spicy], {
      'POST /api/tastes': () =>
        errorResponse(409, 'TASTE_NAME_ALREADY_EXISTS', {
          name: 'Already used by another taste.',
        }),
    })
    const { user } = await openTastesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มรสชาติ' }))
    await fillTaste(user, { th: 'เผ็ด', en: 'Spicy', sortOrder: '9' })
    await user.click(dialog().getByRole('button', { name: 'เพิ่มรสชาติ' }))

    const nameTh = dialog().getByLabelText('ชื่อรสชาติภาษาไทย')
    await waitFor(() => expect(document.activeElement).toBe(nameTh))
    const message = 'มีรสชาติอื่นใช้ชื่อนี้แล้ว กรุณาใช้ชื่ออื่น'
    expect(errorFor(nameTh)).toBe(message)
    expect(errorFor(dialog().getByLabelText('ชื่อรสชาติภาษาอังกฤษ'))).toBe(
      message,
    )
  })
})

describe('TastesPage edit', () => {
  it('pre-fills the form and PATCHes only the changed fields', async () => {
    const api = fakeTastesApi()
    const { user } = await openTastesPage()

    await user.click(screen.getByRole('button', { name: 'แก้ไขรสชาติ เผ็ด' }))
    expect(
      dialog().getByLabelText<HTMLInputElement>('ชื่อรสชาติภาษาไทย').value,
    ).toBe('เผ็ด')
    expect(iconSelect().value).toBe('flame')

    await user.selectOptions(iconSelect(), 'heart')
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await screen.findByText('บันทึกการแก้ไขรสชาติ เผ็ด แล้ว')
    expect(api.requestsFor('PATCH').map((request) => request.body)).toEqual([
      { icon: 'heart' },
    ])
    const row = screen.getByRole('rowheader', { name: 'เผ็ด' }).closest('tr')
    expect(row?.textContent).toContain('หัวใจ')
  })
})

describe('TastesPage delete', () => {
  it('asks for confirmation, then deletes and refreshes the list', async () => {
    const api = fakeTastesApi()
    const { user } = await openTastesPage()

    await user.click(screen.getByRole('button', { name: 'ลบรสชาติ เผ็ด' }))
    expect(dialog().getByRole('heading', { name: 'ลบรสชาตินี้?' })).toBeTruthy()
    expect(api.requestsFor('DELETE')).toEqual([])

    await user.click(dialog().getByRole('button', { name: 'ลบรสชาติ' }))

    await screen.findByText('ลบรสชาติ เผ็ด แล้ว')
    expect(screen.queryByRole('rowheader', { name: 'เผ็ด' })).toBeNull()
    expect(api.requestsFor('DELETE').map((request) => request.path)).toEqual([
      '/api/tastes/taste_1',
    ])
  })

  it('shows the approved message when menu items still use the taste', async () => {
    fakeTastesApi([spicy], {
      [`DELETE /api/tastes/${spicy.id}`]: () =>
        errorResponse(409, 'TASTE_IN_USE'),
    })
    const { user } = await openTastesPage()

    await user.click(screen.getByRole('button', { name: 'ลบรสชาติ เผ็ด' }))
    await user.click(dialog().getByRole('button', { name: 'ลบรสชาติ' }))

    expect((await dialog().findByRole('alert')).textContent).toBe(
      'ยังลบรสชาตินี้ไม่ได้ เพราะมีเมนูใช้งานอยู่ กรุณาแก้ไขเมนูที่ใช้รสชาตินี้ก่อน',
    )
    expect(screen.getByRole('rowheader', { name: 'เผ็ด' })).toBeTruthy()
  })
})

describe('TastesPage keyboard behavior', () => {
  // jsdom does not simulate arrow keys on a native select; the browser check covers that.
  it('reaches the icon select by Tab, and Escape returns focus', async () => {
    fakeTastesApi()
    const { user } = await openTastesPage()
    const createButton = screen.getByRole('button', { name: 'เพิ่มรสชาติ' })

    await user.click(createButton)
    await user.tab()
    await user.tab()
    expect(document.activeElement).toBe(iconSelect())

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(createButton)
  })
})
