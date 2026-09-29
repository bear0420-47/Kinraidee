import { ForkKnife } from '@phosphor-icons/react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'
import { fakeCollectionApi } from '@/test/fakeCollectionApi'
import { dialog, errorFor } from '@/test/formQueries'
import { errorResponse, renderApp } from '@/test/renderApp'

const noodles: FoodType = {
  id: 'food_type_1',
  name: { th: 'ก๋วยเตี๋ยว', en: 'Noodles' },
  icon: 'noodles',
  sortOrder: 1,
}

const dessert: FoodType = {
  id: 'food_type_2',
  name: { th: 'ของหวาน', en: 'Dessert' },
  icon: null,
  sortOrder: 2,
}

function fakeFoodTypesApi(
  items: FoodType[] = [noodles, dessert],
  overrides: Record<string, (body: unknown) => Response> = {},
) {
  return fakeCollectionApi({
    path: '/api/food-types',
    itemKey: 'foodType',
    items,
    create: (body) => {
      const { icon = null, ...fields } = body as Omit<FoodType, 'id'>
      return { id: 'food_type_new', icon, ...fields }
    },
    overrides,
  })
}

async function openFoodTypesPage() {
  const app = renderApp('/admin/food-types')
  await screen.findByRole('table', { name: 'รายการประเภทอาหาร' })
  return app
}

function iconSelect() {
  return dialog().getByRole<HTMLSelectElement>('combobox', {
    name: 'ไอคอน (ไม่บังคับ)',
  })
}

describe('FoodTypesPage list', () => {
  it('lets ADMIN see every food type with its icon label and the special-option note', async () => {
    fakeFoodTypesApi()
    await openFoodTypesPage()

    expect(
      screen.getByRole('heading', { name: 'จัดการประเภทอาหาร' }),
    ).toBeTruthy()
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.map((row) => row.textContent)).toEqual([
      'ก๋วยเตี๋ยวNoodlesเส้น1แก้ไขลบ',
      'ของหวานDessertไอคอนเริ่มต้น2แก้ไขลบ',
    ])
    expect(
      screen.getByText(
        'ตัวเลือก “อะไรก็ได้” เป็นตัวเลือกพิเศษในหน้าสุ่มเมนู ไม่ต้องสร้างเป็นประเภทอาหาร',
      ),
    ).toBeTruthy()
    expect(
      within(screen.getByRole('table')).queryByText(/อะไรก็ได้/),
    ).toBeNull()
  })

  it('renders the fallback Phosphor icon for null and unknown icon keys', async () => {
    fakeFoodTypesApi([dessert, { ...noodles, icon: 'dumpling' }])
    await openFoodTypesPage()

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
      'ไอคอนเริ่มต้น (ไม่รู้จัก dumpling)',
    ])
  })

  it('shows the empty state when there are no food types', async () => {
    fakeFoodTypesApi([])
    renderApp('/admin/food-types')

    expect(await screen.findByText('ยังไม่มีประเภทอาหาร')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('has no description field', async () => {
    fakeFoodTypesApi()
    const { user } = await openFoodTypesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))

    expect(
      dialog()
        .getAllByRole('textbox')
        .map((field) => field.id),
    ).toEqual([
      'food-type-name-th',
      'food-type-name-en',
      'food-type-sort-order',
    ])
    expect(screen.queryByText(/คำอธิบาย/)).toBeNull()
  })
})

describe('FoodTypesPage icon field', () => {
  it('offers only the controlled registry keys with text labels and a helper', async () => {
    fakeFoodTypesApi()
    const { user } = await openFoodTypesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))

    const select = iconSelect()
    expect([...select.options].map((option) => option.value)).toEqual([
      '',
      'rice',
      'noodles',
      'sandwich',
      'soup',
      'salad',
      'sparkles',
    ])
    expect([...select.options].map((option) => option.textContent)).toEqual([
      'ไม่เลือก (ใช้ไอคอนเริ่มต้น)',
      'ข้าว (rice)',
      'เส้น (noodles)',
      'แซนด์วิช (sandwich)',
      'ซุป (soup)',
      'สลัด (salad)',
      'พิเศษ (sparkles)',
    ])
    expect(
      document.getElementById(select.getAttribute('aria-describedby') ?? '')
        ?.textContent,
    ).toBe('เลือกไอคอนจากชุดที่กำหนดไว้ หากไม่เลือก ระบบจะใช้ไอคอนเริ่มต้น')
  })
})

describe('FoodTypesPage create', () => {
  it('validates localized names and integer sortOrder, focusing the first invalid field', async () => {
    const api = fakeFoodTypesApi()
    const { user } = await openFoodTypesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))
    await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), 'abc')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))

    const nameTh = dialog().getByLabelText('ชื่อประเภทอาหารภาษาไทย')
    await waitFor(() => expect(document.activeElement).toBe(nameTh))
    expect(errorFor(nameTh)).toBe('กรุณากรอกชื่อภาษาไทย')
    expect(errorFor(dialog().getByLabelText('ชื่อประเภทอาหารภาษาอังกฤษ'))).toBe(
      'กรุณากรอกชื่อภาษาอังกฤษ',
    )
    expect(errorFor(dialog().getByLabelText('ลำดับการแสดงผล'))).toBe(
      'ลำดับการแสดงผลต้องเป็นจำนวนเต็ม',
    )
    expect(api.requestsFor('POST')).toEqual([])
  })

  it('creates a food type without an icon as null and refreshes the list', async () => {
    const api = fakeFoodTypesApi()
    const { user } = await openFoodTypesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))
    await user.type(
      dialog().getByLabelText('ชื่อประเภทอาหารภาษาไทย'),
      ' ข้าวผัด ',
    )
    await user.type(
      dialog().getByLabelText('ชื่อประเภทอาหารภาษาอังกฤษ'),
      'Fried rice',
    )
    await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), '3')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))

    expect(
      await screen.findByRole('rowheader', { name: 'ข้าวผัด' }),
    ).toBeTruthy()
    expect(screen.getByText('เพิ่มประเภทอาหาร ข้าวผัด แล้ว')).toBeTruthy()
    expect(api.requestsFor('POST').map((request) => request.body)).toEqual([
      { name: { th: 'ข้าวผัด', en: 'Fried rice' }, icon: null, sortOrder: 3 },
    ])
    expect(api.requestsFor('GET')).toHaveLength(2)
  })

  it('sends the chosen registry key', async () => {
    const api = fakeFoodTypesApi()
    const { user } = await openFoodTypesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))
    await user.type(
      dialog().getByLabelText('ชื่อประเภทอาหารภาษาไทย'),
      'ข้าวมันไก่',
    )
    await user.type(
      dialog().getByLabelText('ชื่อประเภทอาหารภาษาอังกฤษ'),
      'Chicken rice',
    )
    await user.selectOptions(iconSelect(), 'rice')
    await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), '4')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))

    await screen.findByRole('rowheader', { name: 'ข้าวมันไก่' })
    expect(api.requestsFor('POST')[0]?.body).toMatchObject({ icon: 'rice' })
  })

  it('marks the name fields when the API reports a duplicate name', async () => {
    fakeFoodTypesApi([noodles], {
      'POST /api/food-types': () =>
        errorResponse(409, 'FOOD_TYPE_NAME_ALREADY_EXISTS', {
          'name.en': 'Already used by another food type.',
        }),
    })
    const { user } = await openFoodTypesPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))
    await user.type(dialog().getByLabelText('ชื่อประเภทอาหารภาษาไทย'), 'เส้น')
    await user.type(
      dialog().getByLabelText('ชื่อประเภทอาหารภาษาอังกฤษ'),
      'Noodles',
    )
    await user.type(dialog().getByLabelText('ลำดับการแสดงผล'), '9')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มประเภทอาหาร' }))

    const nameEn = dialog().getByLabelText('ชื่อประเภทอาหารภาษาอังกฤษ')
    await waitFor(() => expect(document.activeElement).toBe(nameEn))
    expect(errorFor(nameEn)).toBe(
      'มีประเภทอาหารอื่นใช้ชื่อนี้แล้ว กรุณาใช้ชื่ออื่น',
    )
  })
})

describe('FoodTypesPage edit', () => {
  it('pre-fills the form and PATCHes only the changed fields', async () => {
    const api = fakeFoodTypesApi()
    const { user } = await openFoodTypesPage()

    await user.click(
      screen.getByRole('button', { name: 'แก้ไขประเภทอาหาร ก๋วยเตี๋ยว' }),
    )
    expect(
      dialog().getByLabelText<HTMLInputElement>('ชื่อประเภทอาหารภาษาอังกฤษ')
        .value,
    ).toBe('Noodles')
    expect(iconSelect().value).toBe('noodles')

    await user.selectOptions(iconSelect(), '')
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await screen.findByText('บันทึกการแก้ไขประเภทอาหาร ก๋วยเตี๋ยว แล้ว')
    expect(api.requestsFor('PATCH').map((request) => request.body)).toEqual([
      { icon: null },
    ])
  })

  it('keeps an unknown stored icon key when the icon is not touched', async () => {
    const api = fakeFoodTypesApi([{ ...noodles, icon: 'dumpling' }])
    const { user } = await openFoodTypesPage()

    await user.click(
      screen.getByRole('button', { name: 'แก้ไขประเภทอาหาร ก๋วยเตี๋ยว' }),
    )
    const sortOrder = dialog().getByLabelText('ลำดับการแสดงผล')
    await user.clear(sortOrder)
    await user.type(sortOrder, '2')
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await screen.findByText('บันทึกการแก้ไขประเภทอาหาร ก๋วยเตี๋ยว แล้ว')
    expect(api.requestsFor('PATCH').map((request) => request.body)).toEqual([
      { sortOrder: 2 },
    ])
  })
})

describe('FoodTypesPage delete', () => {
  it('asks for confirmation, then deletes and refreshes the list', async () => {
    const api = fakeFoodTypesApi()
    const { user } = await openFoodTypesPage()

    await user.click(
      screen.getByRole('button', { name: 'ลบประเภทอาหาร ก๋วยเตี๋ยว' }),
    )
    expect(
      dialog().getByRole('heading', { name: 'ลบประเภทอาหารนี้?' }),
    ).toBeTruthy()
    expect(api.requestsFor('DELETE')).toEqual([])

    await user.click(dialog().getByRole('button', { name: 'ลบประเภทอาหาร' }))

    await screen.findByText('ลบประเภทอาหาร ก๋วยเตี๋ยว แล้ว')
    expect(screen.queryByRole('rowheader', { name: 'ก๋วยเตี๋ยว' })).toBeNull()
    expect(api.requestsFor('DELETE').map((request) => request.path)).toEqual([
      '/api/food-types/food_type_1',
    ])
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'เพิ่มประเภทอาหาร' }),
    )
  })

  it('shows the approved message when menu items still use the food type', async () => {
    fakeFoodTypesApi([noodles], {
      [`DELETE /api/food-types/${noodles.id}`]: () =>
        errorResponse(409, 'FOOD_TYPE_IN_USE'),
    })
    const { user } = await openFoodTypesPage()

    await user.click(
      screen.getByRole('button', { name: 'ลบประเภทอาหาร ก๋วยเตี๋ยว' }),
    )
    await user.click(dialog().getByRole('button', { name: 'ลบประเภทอาหาร' }))

    expect((await dialog().findByRole('alert')).textContent).toBe(
      'ยังลบประเภทอาหารนี้ไม่ได้ เพราะมีเมนูใช้งานอยู่ กรุณาย้ายเมนูไปประเภทอื่นก่อน',
    )
    expect(screen.getByRole('rowheader', { name: 'ก๋วยเตี๋ยว' })).toBeTruthy()
  })
})

describe('FoodTypesPage keyboard behavior', () => {
  // jsdom does not simulate arrow keys on a native select; the browser check covers that.
  it('reaches the icon select by Tab, and Escape returns focus', async () => {
    fakeFoodTypesApi()
    const { user } = await openFoodTypesPage()
    const createButton = screen.getByRole('button', {
      name: 'เพิ่มประเภทอาหาร',
    })

    await user.click(createButton)
    await user.tab()
    await user.tab()
    expect(document.activeElement).toBe(iconSelect())

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(createButton)
  })
})
