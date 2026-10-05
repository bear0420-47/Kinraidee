import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { FoodType } from '@/schemas/admin/food-types/foodTypeSchemas'
import type { MenuItem } from '@/schemas/admin/menu-items/menuItemSchemas'
import type { Restaurant } from '@/schemas/admin/restaurants/restaurantSchemas'
import type { Taste } from '@/schemas/admin/tastes/tasteSchemas'
import { dialog, errorFor } from '@/test/formQueries'
import {
  errorResponse,
  fakeAuthApi,
  jsonResponse,
  renderApp,
  testAdmin,
} from '@/test/renderApp'

const oldKey = '11111111-1111-4111-8111-111111111111.webp'
const deletedAt = '2026-10-02T00:00:00.000Z'

function restaurant(
  id: string,
  th: string,
  en: string,
  fields: Partial<Restaurant> = {},
): Restaurant {
  return {
    id,
    zoneId: 'zone_1',
    zone: { id: 'zone_1', name: { th: 'หน้ามอ', en: 'Front Gate' } },
    name: { th, en },
    description: null,
    phone: null,
    imageKey: null,
    imageUrl: null,
    deletedAt: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...fields,
  }
}

const thaiKitchen = restaurant('restaurant_1', 'ครัวไทย', 'Thai Kitchen')
const boatNoodles = restaurant('restaurant_2', 'ก๋วยเตี๋ยวเรือ', 'Boat Noodles')
const closedShop = restaurant('restaurant_3', 'ร้านปิดแล้ว', 'Closed Shop', {
  deletedAt,
})
const restaurants = [thaiKitchen, boatNoodles, closedShop]

const foodTypes: FoodType[] = [
  {
    id: 'food_1',
    name: { th: 'ข้าว', en: 'Rice' },
    icon: 'rice',
    sortOrder: 1,
  },
  {
    id: 'food_2',
    name: { th: 'เส้น', en: 'Noodles' },
    icon: 'noodles',
    sortOrder: 2,
  },
]

const tastes: Taste[] = [
  {
    id: 'taste_1',
    name: { th: 'เผ็ด', en: 'Spicy' },
    icon: 'flame',
    sortOrder: 1,
  },
  {
    id: 'taste_2',
    name: { th: 'หวาน', en: 'Sweet' },
    icon: 'heart',
    sortOrder: 2,
  },
]

function menuItem(
  id: string,
  th: string,
  en: string,
  fields: Partial<MenuItem> = {},
): MenuItem {
  return {
    id,
    restaurantId: thaiKitchen.id,
    foodTypeId: 'food_1',
    restaurant: { id: thaiKitchen.id, name: thaiKitchen.name, deletedAt: null },
    foodType: { id: 'food_1', name: foodTypes[0]!.name, icon: 'rice' },
    tastes: [{ id: 'taste_1', name: tastes[0]!.name, icon: 'flame' }],
    name: { th, en },
    description: null,
    price: 50,
    imageKey: null,
    imageUrl: null,
    deletedAt: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...fields,
  }
}

const padKrapao = menuItem('menu_1', 'ผัดกะเพรา', 'Basil Stir-fry', {
  price: 1250,
  imageKey: oldKey,
  imageUrl: `/uploads/${oldKey}`,
})
const boatNoodleBowl = menuItem('menu_2', 'ก๋วยเตี๋ยว', 'Noodle Bowl', {
  restaurantId: boatNoodles.id,
  restaurant: { id: boatNoodles.id, name: boatNoodles.name, deletedAt: null },
  foodTypeId: 'food_2',
  foodType: { id: 'food_2', name: foodTypes[1]!.name, icon: 'noodles' },
  tastes: [
    { id: 'taste_1', name: tastes[0]!.name, icon: 'flame' },
    { id: 'taste_2', name: tastes[1]!.name, icon: 'heart' },
  ],
  imageUrl: 'https://images.example.com/noodles.jpg',
})
const retiredDish = menuItem('menu_3', 'เมนูเลิกขาย', 'Retired Dish', {
  deletedAt,
})
const orphanedDish = menuItem('menu_4', 'เมนูร้านปิด', 'Closed Shop Dish', {
  restaurantId: closedShop.id,
  restaurant: { id: closedShop.id, name: closedShop.name, deletedAt },
  deletedAt,
})

function uploadKey(n: number) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}.webp`
}

type CreateBody = {
  restaurantId: string
  foodTypeId: string
  tasteIds: string[]
} & Partial<MenuItem>

// Stateful MenuItem, catalog option, and upload API for an ADMIN session.
function fakeMenuItemsApi({
  items: initialItems = [padKrapao, boatNoodleBowl, retiredDish, orphanedDish],
  overrides = {},
}: {
  items?: MenuItem[]
  overrides?: Record<string, (body: unknown) => Response | Promise<Response>>
} = {}) {
  let items = [...initialItems]
  let uploads = 0

  function withRelations(fields: CreateBody, base: MenuItem): MenuItem {
    const owner = restaurants.find((r) => r.id === fields.restaurantId)!
    const foodType = foodTypes.find((f) => f.id === fields.foodTypeId)!
    return {
      ...base,
      ...fields,
      restaurant: {
        id: owner.id,
        name: owner.name,
        deletedAt: owner.deletedAt,
      },
      foodType: { id: foodType.id, name: foodType.name, icon: foodType.icon },
      tastes: tastes
        .filter((taste) => fields.tasteIds.includes(taste.id))
        .map(({ id, name, icon }) => ({ id, name, icon })),
    }
  }

  function setDeleted(ids: string[], value: string | null) {
    let updatedCount = 0
    items = items.map((item) => {
      if (!ids.includes(item.id) || (item.deletedAt !== null) === !!value) {
        return item
      }
      updatedCount += 1
      return { ...item, deletedAt: value }
    })
    return updatedCount
  }

  const api = fakeAuthApi({
    currentUser: testAdmin,
    responses: {
      'GET /api/food-types': () =>
        jsonResponse(200, { data: { items: foodTypes } }),
      'GET /api/tastes': () => jsonResponse(200, { data: { items: tastes } }),
      ...overrides,
    },
    handle: (method, url, body) => {
      const path = url.pathname
      const params = url.searchParams
      const id = path.match(/^\/api\/menu-items\/([^/]+)/)?.[1]
      const current = items.find((item) => item.id === id)

      if (method === 'GET' && path === '/api/restaurants') {
        const page = Number(params.get('page') ?? 1)
        const pageSize = Number(params.get('pageSize') ?? 20)
        return jsonResponse(200, {
          data: {
            items: restaurants.slice((page - 1) * pageSize, page * pageSize),
          },
          meta: { page, pageSize, total: restaurants.length },
        })
      }
      if (method === 'GET' && path === '/api/menu-items') {
        const search = params.get('search') ?? ''
        const page = Number(params.get('page') ?? 1)
        const pageSize = Number(params.get('pageSize') ?? 20)
        const matches = items.filter(
          (item) =>
            (params.get('includeDeleted') === 'true' || !item.deletedAt) &&
            [null, item.restaurantId].includes(params.get('restaurantId')) &&
            [null, item.foodTypeId].includes(params.get('foodTypeId')) &&
            (!params.get('tasteId') ||
              item.tastes.some(
                (taste) => taste.id === params.get('tasteId'),
              )) &&
            (item.name.th.includes(search) || item.name.en.includes(search)),
        )
        return jsonResponse(200, {
          data: {
            items: matches.slice((page - 1) * pageSize, page * pageSize),
          },
          meta: { page, pageSize, total: matches.length },
        })
      }
      if (method === 'POST' && path === '/api/menu-items') {
        const created = withRelations(
          body as CreateBody,
          menuItem('menu_new', '', ''),
        )
        items = [...items, created]
        return jsonResponse(201, { data: { menuItem: created } })
      }
      if (method === 'POST' && path === '/api/menu-items/bulk-delete') {
        const { ids } = body as { ids: string[] }
        const updatedCount = setDeleted(ids, '2026-10-05T00:00:00.000Z')
        return jsonResponse(200, { data: { updatedCount } })
      }
      if (method === 'POST' && path === '/api/menu-items/bulk-restore') {
        const { ids } = body as { ids: string[] }
        const updatedCount = setDeleted(ids, null)
        return jsonResponse(200, { data: { updatedCount } })
      }
      if (current && method === 'PATCH') {
        const patch = body as Partial<CreateBody>
        const updated = withRelations(
          {
            restaurantId: current.restaurantId,
            foodTypeId: current.foodTypeId,
            tasteIds: current.tastes.map((taste) => taste.id),
            ...patch,
          },
          current,
        )
        items = items.map((item) => (item.id === id ? updated : item))
        return jsonResponse(200, { data: { menuItem: updated } })
      }
      if (current && method === 'DELETE') {
        setDeleted([current.id], '2026-10-05T00:00:00.000Z')
        return new Response(null, { status: 204 })
      }
      if (current && method === 'POST' && path.endsWith('/restore')) {
        if (current.restaurant.deletedAt) {
          return errorResponse(409, 'RESTAURANT_DELETED', {
            restaurantId: 'Choose an active Restaurant.',
          })
        }
        setDeleted([current.id], null)
        return jsonResponse(200, {
          data: { menuItem: { ...current, deletedAt: null } },
        })
      }
      if (method === 'POST' && path === '/api/uploads/images') {
        const key = uploadKey((uploads += 1))
        return jsonResponse(201, {
          data: { image: { key, url: `/uploads/${key}` } },
        })
      }
      if (method === 'DELETE' && path.startsWith('/api/uploads/images/')) {
        return new Response(null, { status: 204 })
      }
      return undefined
    },
  })

  return {
    ...api,
    requestsFor: (method: string, prefix: string) =>
      api.requests.filter(
        (request) =>
          request.method === method && request.path.startsWith(prefix),
      ),
    deletedUploads: () =>
      api.requests
        .filter(
          (request) =>
            request.method === 'DELETE' &&
            request.path.startsWith('/api/uploads/images/'),
        )
        .map((request) => request.path.replace('/api/uploads/images/', '')),
  }
}

async function openMenuItemsPage(path = '/admin/menu-items') {
  const app = renderApp(path)
  await screen.findByRole('table', { name: 'รายการเมนูอาหาร' })
  return app
}

function rows() {
  return screen.getAllByRole('row').slice(1)
}

// Row headers hold the Thai name with the English name beneath it.
function menuName(th: string) {
  return new RegExp(`^${th}\\s*[A-Z]`)
}

function rowFor(th: string) {
  return screen.getByRole('rowheader', { name: menuName(th) }).closest('tr')!
}

function checkbox(name: string) {
  return screen.getByRole<HTMLInputElement>('checkbox', {
    name: `เลือกเมนู ${name}`,
  })
}

function selectedCount() {
  return screen.getByText(/^เลือกเมนูแล้ว \d+ รายการ$/).textContent
}

function imageFileInput() {
  return dialog().getByLabelText<HTMLInputElement>(
    'เลือกไฟล์รูป (JPEG, PNG หรือ WebP ไม่เกิน 2 MB)',
  )
}

function pngFile() {
  return new File([new Uint8Array(100)], 'dish.png', { type: 'image/png' })
}

async function fillNewMenuItem(user: ReturnType<typeof renderApp>['user']) {
  await waitFor(() =>
    expect(
      dialog().getAllByRole('option', { name: 'ก๋วยเตี๋ยวเรือ' }),
    ).toHaveLength(1),
  )
  await user.selectOptions(dialog().getByLabelText('ร้านอาหาร'), 'restaurant_2')
  await user.selectOptions(dialog().getByLabelText('ประเภทอาหาร'), 'food_2')
  await user.click(dialog().getByRole('checkbox', { name: 'หวาน' }))
  await user.type(dialog().getByLabelText('ชื่อเมนูภาษาไทย'), ' เมนูใหม่ ')
  await user.type(dialog().getByLabelText('ชื่อเมนูภาษาอังกฤษ'), 'New Dish')
  await user.type(dialog().getByLabelText('ราคา (บาท)'), '60')
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('MenuItemsPage list', () => {
  it('lists active menu items with Restaurant, FoodType, tastes, price, and status', async () => {
    const api = fakeMenuItemsApi()
    await openMenuItemsPage()

    expect(
      screen.getByRole('heading', { name: 'จัดการเมนูอาหาร' }),
    ).toBeTruthy()
    expect(rows().map((row) => row.textContent)).toEqual([
      'ผัดกะเพราBasil Stir-fryครัวไทยข้าวเผ็ด฿1,250ใช้งานแก้ไขลบ',
      'ก๋วยเตี๋ยวNoodle Bowlก๋วยเตี๋ยวเรือเส้นเผ็ดหวาน฿50ใช้งานแก้ไขลบ',
    ])
    expect(api.requestsFor('GET', '/api/menu-items')[0]?.path).toBe(
      '/api/menu-items?page=1&pageSize=20',
    )
    const images = screen.getAllByRole('presentation') as HTMLImageElement[]
    expect(images.map((image) => image.src)).toEqual([
      `http://localhost:3000/uploads/${oldKey}`,
      'https://images.example.com/noodles.jpg',
    ])
  })

  it('opens the full image in a lightbox and returns focus when it closes', async () => {
    fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    const thumbnail = screen.getByRole('button', {
      name: 'ดูรูปเต็ม ก๋วยเตี๋ยว',
    })
    await user.click(thumbnail)

    expect(dialog().getByRole('heading', { name: 'ก๋วยเตี๋ยว' })).toBeTruthy()
    expect(
      dialog().getByRole<HTMLImageElement>('img', { name: 'รูป ก๋วยเตี๋ยว' })
        .src,
    ).toBe('https://images.example.com/noodles.jpg')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(thumbnail)

    await user.click(thumbnail)
    await user.click(dialog().getByRole('button', { name: 'ปิด' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(thumbnail)
  })

  it('applies search, Restaurant, FoodType, Taste, and deleted filters and resets to page 1', async () => {
    const many = Array.from({ length: 25 }, (_, index) =>
      menuItem(`m_${index}`, `เมนู ${index}`, `Dish ${index}`),
    )
    const api = fakeMenuItemsApi({ items: [...many, boatNoodleBowl] })
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'ถัดไป' }))
    await screen.findByText('หน้า 2 จาก 2 · ทั้งหมด 26 รายการ')

    await user.selectOptions(
      screen.getByLabelText('ร้านอาหาร'),
      await screen.findByRole('option', { name: 'ก๋วยเตี๋ยวเรือ' }),
    )
    await user.selectOptions(screen.getByLabelText('ประเภทอาหาร'), 'food_2')
    await user.selectOptions(screen.getByLabelText('รสชาติ'), 'taste_2')
    await user.click(screen.getByLabelText('แสดงเมนูที่ลบแล้ว'))
    await user.type(screen.getByLabelText('ค้นหาชื่อเมนู'), 'Noodle')
    await user.click(screen.getByRole('button', { name: 'ค้นหา' }))

    await waitFor(() =>
      expect(api.requestsFor('GET', '/api/menu-items').at(-1)?.path).toBe(
        '/api/menu-items?page=1&pageSize=20&search=Noodle&restaurantId=restaurant_2&foodTypeId=food_2&tasteId=taste_2&includeDeleted=true',
      ),
    )
    expect(
      await screen.findByRole('rowheader', { name: menuName('ก๋วยเตี๋ยว') }),
    ).toBeTruthy()
    expect(rows()).toHaveLength(1)
  })

  it('lists every Restaurant in the filter, marking deleted ones', async () => {
    fakeMenuItemsApi()
    await openMenuItemsPage()

    const filter = screen.getByLabelText('ร้านอาหาร')
    await waitFor(() =>
      expect(within(filter).getAllByRole('option')).toHaveLength(4),
    )
    expect(
      within(filter)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['ทุกร้าน', 'ครัวไทย', 'ก๋วยเตี๋ยวเรือ', 'ร้านปิดแล้ว (ลบแล้ว)'])
  })

  it('shows deleted items and items under a deleted Restaurant with text status, offering restore instead of edit', async () => {
    fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByLabelText('แสดงเมนูที่ลบแล้ว'))
    await screen.findByRole('rowheader', { name: menuName('เมนูเลิกขาย') })

    const retired = rowFor('เมนูเลิกขาย')
    expect(within(retired).getByText('ลบแล้ว')).toBeTruthy()
    expect(within(retired).queryByRole('button', { name: /แก้ไข/ })).toBeNull()
    expect(
      within(retired).getByRole('button', { name: 'กู้คืนเมนู เมนูเลิกขาย' }),
    ).toBeTruthy()

    const orphaned = rowFor('เมนูร้านปิด')
    expect(within(orphaned).getByText('ลบแล้ว')).toBeTruthy()
    expect(within(orphaned).getByText('ร้านถูกลบ')).toBeTruthy()
  })

  it('blocks editing an active item whose Restaurant was deleted, explaining why', async () => {
    const stranded = menuItem('menu_5', 'เมนูค้าง', 'Stranded Dish', {
      restaurantId: closedShop.id,
      restaurant: { id: closedShop.id, name: closedShop.name, deletedAt },
    })
    fakeMenuItemsApi({ items: [stranded] })
    await openMenuItemsPage()

    const edit = screen.getByRole<HTMLButtonElement>('button', {
      name: 'แก้ไขเมนู เมนูค้าง',
    })
    expect(edit.disabled).toBe(true)
    expect(
      document.getElementById(edit.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toBe('ร้านถูกลบกรุณากู้คืนร้านก่อนแก้ไข')
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'ลบเมนู เมนูค้าง' })
        .disabled,
    ).toBe(false)
  })
})

describe('MenuItemsPage create and edit', () => {
  it('validates relations, tastes, price, and localized names, focusing the first invalid field', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))
    await user.click(dialog().getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))

    const restaurantSelect = dialog().getByLabelText('ร้านอาหาร')
    await waitFor(() => expect(document.activeElement).toBe(restaurantSelect))
    expect(errorFor(restaurantSelect)).toBe('กรุณาเลือกร้านอาหาร')
    expect(errorFor(dialog().getByLabelText('ประเภทอาหาร'))).toBe(
      'กรุณาเลือกประเภทอาหาร',
    )
    expect(errorFor(dialog().getByRole('checkbox', { name: 'เผ็ด' }))).toBe(
      'กรุณาเลือกรสชาติอย่างน้อย 1 รายการ',
    )
    expect(errorFor(dialog().getByLabelText('ชื่อเมนูภาษาไทย'))).toBe(
      'กรุณากรอกชื่อภาษาไทย',
    )
    expect(errorFor(dialog().getByLabelText('ชื่อเมนูภาษาอังกฤษ'))).toBe(
      'กรุณากรอกชื่อภาษาอังกฤษ',
    )
    expect(errorFor(dialog().getByLabelText('ราคา (บาท)'))).toBe(
      'กรุณากรอกราคา',
    )
    expect(api.requestsFor('POST', '/api/menu-items')).toEqual([])
  })

  it.each([
    ['0', 'ราคาต้องมากกว่า 0 บาท'],
    ['12.5', 'ราคาต้องเป็นจำนวนเต็มบาท'],
    ['-3', 'ราคาต้องเป็นจำนวนเต็มบาท'],
    ['2147483648', 'ราคาสูงเกินกว่าที่ระบบรองรับ'],
  ])('rejects the price %s', async (price, message) => {
    fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))
    await user.type(dialog().getByLabelText('ราคา (บาท)'), price)
    await user.click(dialog().getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))

    await waitFor(() =>
      expect(errorFor(dialog().getByLabelText('ราคา (บาท)'))).toBe(message),
    )
  })

  it('offers only active Restaurants and creates an item with an external image URL', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))
    await fillNewMenuItem(user)
    expect(
      within(dialog().getByLabelText('ร้านอาหาร'))
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['เลือกร้านอาหาร', 'ครัวไทย', 'ก๋วยเตี๋ยวเรือ'])
    await user.click(dialog().getByLabelText('ใช้ URL รูปภาพ'))
    await user.type(
      dialog().getByLabelText('URL รูปภาพ'),
      'https://images.example.com/new.jpg',
    )
    expect(dialog().getByAltText('ตัวอย่างรูปเมนูจาก URL')).toBeTruthy()
    await user.click(dialog().getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))

    await screen.findByText('เพิ่มเมนู เมนูใหม่ แล้ว')
    expect(api.requestsFor('POST', '/api/menu-items')[0]?.body).toEqual({
      restaurantId: 'restaurant_2',
      foodTypeId: 'food_2',
      tasteIds: ['taste_2'],
      name: { th: 'เมนูใหม่', en: 'New Dish' },
      description: null,
      price: 60,
      imageKey: null,
      imageUrl: 'https://images.example.com/new.jpg',
    })
    expect(
      await screen.findByRole('rowheader', { name: menuName('เมนูใหม่') }),
    ).toBeTruthy()
  })

  it('pre-fills an edit and sends only changed fields, comparing tastes as a set', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(
      screen.getByRole('button', { name: 'แก้ไขเมนู ก๋วยเตี๋ยว' }),
    )
    expect(
      (dialog().getByLabelText('ร้านอาหาร') as HTMLSelectElement).value,
    ).toBe('restaurant_2')
    expect(
      (dialog().getByLabelText('ราคา (บาท)') as HTMLInputElement).value,
    ).toBe('50')
    const spicy = dialog().getByRole<HTMLInputElement>('checkbox', {
      name: 'เผ็ด',
    })
    expect(spicy.checked).toBe(true)

    // Unticking and re-ticking a taste leaves the set unchanged.
    await user.click(spicy)
    await user.click(spicy)
    await user.clear(dialog().getByLabelText('ราคา (บาท)'))
    await user.type(dialog().getByLabelText('ราคา (บาท)'), '055')
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await screen.findByText('บันทึกการแก้ไขเมนู ก๋วยเตี๋ยว แล้ว')
    expect(
      api
        .requestsFor('PATCH', '/api/menu-items')
        .map((request) => request.body),
    ).toEqual([{ price: 55 }])
  })

  it('sends a changed taste selection and closes an unchanged form without a request', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(
      screen.getByRole('button', { name: 'แก้ไขเมนู ผัดกะเพรา' }),
    )
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))
    await screen.findByText('ไม่มีข้อมูลที่เปลี่ยนแปลง')
    expect(api.requestsFor('PATCH', '/api/menu-items')).toEqual([])

    await user.click(
      screen.getByRole('button', { name: 'แก้ไขเมนู ผัดกะเพรา' }),
    )
    await user.click(dialog().getByRole('checkbox', { name: 'หวาน' }))
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await screen.findByText('บันทึกการแก้ไขเมนู ผัดกะเพรา แล้ว')
    expect(api.requestsFor('PATCH', '/api/menu-items')[0]?.body).toEqual({
      tasteIds: ['taste_1', 'taste_2'],
    })
  })

  it('puts a deleted-Restaurant conflict on the Restaurant field', async () => {
    fakeMenuItemsApi({
      overrides: {
        'POST /api/menu-items': () =>
          errorResponse(409, 'RESTAURANT_DELETED', {
            restaurantId: 'Choose an active Restaurant.',
          }),
      },
    })
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))
    await fillNewMenuItem(user)
    await user.click(dialog().getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))

    const restaurantSelect = dialog().getByLabelText('ร้านอาหาร')
    await waitFor(() =>
      expect(errorFor(restaurantSelect)).toBe(
        'ร้านนี้ถูกลบแล้ว กรุณาเลือกร้านอื่นหรือกู้คืนร้านก่อน',
      ),
    )
    expect(document.activeElement).toBe(restaurantSelect)
  })

  it('explains an option load failure and blocks saving', async () => {
    fakeMenuItemsApi({
      overrides: {
        'GET /api/tastes': () => errorResponse(500, 'INTERNAL_SERVER_ERROR'),
      },
    })
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))

    expect(
      await dialog().findByText(
        'โหลดรายการร้าน ประเภทอาหาร หรือรสชาติไม่สำเร็จ กรุณาปิดแล้วลองใหม่อีกครั้ง',
      ),
    ).toBeTruthy()
    expect(
      dialog().getByRole<HTMLButtonElement>('button', {
        name: 'เพิ่มเมนูอาหาร',
      }).disabled,
    ).toBe(true)
  })
})

describe('MenuItemsPage images', () => {
  it('does not render the upload control in production builds', async () => {
    vi.stubEnv('DEV', false)
    fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))

    expect(dialog().queryByLabelText('อัปโหลดรูปจากเครื่อง')).toBeNull()
    expect(dialog().getByLabelText('ใช้ URL รูปภาพ')).toBeTruthy()
  })

  it('uploads a local image in development and saves its key and URL without base64 or blob data', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))
    await fillNewMenuItem(user)
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    expect(await dialog().findByText('อัปโหลดรูปแล้ว')).toBeTruthy()
    expect(
      dialog().getByAltText<HTMLImageElement>('ตัวอย่างรูปเมนูที่อัปโหลด').src,
    ).toBe(`http://localhost:3000/uploads/${uploadKey(1)}`)

    await user.click(dialog().getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))
    await screen.findByText('เพิ่มเมนู เมนูใหม่ แล้ว')

    expect(api.requestsFor('POST', '/api/menu-items')[0]?.body).toMatchObject({
      imageKey: uploadKey(1),
      imageUrl: `/uploads/${uploadKey(1)}`,
    })
    expect(api.deletedUploads()).toEqual([])
    expect(JSON.stringify(api.requests)).not.toMatch(/data:|blob:/)
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })

  it('cleans up the new upload when create fails', async () => {
    const api = fakeMenuItemsApi({
      overrides: {
        'POST /api/menu-items': () =>
          errorResponse(500, 'INTERNAL_SERVER_ERROR'),
      },
    })
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))
    await fillNewMenuItem(user)
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    await dialog().findByText('อัปโหลดรูปแล้ว')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))

    expect(
      await dialog().findByText('บันทึกเมนูไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'),
    ).toBeTruthy()
    expect(api.deletedUploads()).toEqual([uploadKey(1)])
  })

  it('keeps the old image and removes only the new upload when the update fails', async () => {
    const api = fakeMenuItemsApi({
      overrides: {
        'PATCH /api/menu-items/menu_1': () =>
          errorResponse(500, 'INTERNAL_SERVER_ERROR'),
      },
    })
    const { user } = await openMenuItemsPage()

    await user.click(
      screen.getByRole('button', { name: 'แก้ไขเมนู ผัดกะเพรา' }),
    )
    await user.upload(imageFileInput(), pngFile())
    await waitFor(() =>
      expect(
        dialog().getByAltText<HTMLImageElement>('ตัวอย่างรูปเมนูที่อัปโหลด')
          .src,
      ).toContain(uploadKey(1)),
    )
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await dialog().findByText('บันทึกเมนูไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    expect(api.deletedUploads()).toEqual([uploadKey(1)])
    expect(
      dialog().getByAltText<HTMLImageElement>('ตัวอย่างรูปเมนูที่อัปโหลด').src,
    ).toContain(oldKey)
  })

  it('deletes the old local image only after the replacement is saved', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(
      screen.getByRole('button', { name: 'แก้ไขเมนู ผัดกะเพรา' }),
    )
    await user.upload(imageFileInput(), pngFile())
    await waitFor(() =>
      expect(
        dialog().getByAltText<HTMLImageElement>('ตัวอย่างรูปเมนูที่อัปโหลด')
          .src,
      ).toContain(uploadKey(1)),
    )
    expect(api.deletedUploads()).toEqual([])
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))
    await screen.findByText('บันทึกการแก้ไขเมนู ผัดกะเพรา แล้ว')

    expect(
      api.requests
        .filter((request) => ['PATCH', 'DELETE'].includes(request.method))
        .map((request) => `${request.method} ${request.path}`),
    ).toEqual([
      'PATCH /api/menu-items/menu_1',
      `DELETE /api/uploads/images/${oldKey}`,
    ])
  })

  it('asks before leaving with an unsaved upload and cleans it up on leave', async () => {
    const api = fakeMenuItemsApi()
    const { user, router } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }))
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    await dialog().findByText('อัปโหลดรูปแล้ว')

    void router.navigate('/admin')
    const prompt = await screen.findByRole('dialog', { name: 'ออกจากหน้านี้?' })
    expect(
      within(prompt).getByText('ข้อมูลเมนูที่ยังไม่บันทึกจะหายไป'),
    ).toBeTruthy()
    await user.click(
      within(prompt).getByRole('button', { name: 'ออกจากหน้านี้' }),
    )

    await screen.findByRole('heading', { name: 'จัดการระบบ' })
    expect(api.deletedUploads()).toEqual([uploadKey(1)])
  })
})

describe('MenuItemsPage delete and restore', () => {
  it('confirms deletion with the recommendation warning and keeps the image', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByRole('button', { name: 'ลบเมนู ผัดกะเพรา' }))
    expect(dialog().getByRole('heading', { name: 'ลบเมนูนี้?' })).toBeTruthy()
    expect(dialog().getByText('เมนูนี้จะถูกซ่อนจากการสุ่มเมนู')).toBeTruthy()
    await user.click(dialog().getByRole('button', { name: 'ลบเมนู' }))

    await screen.findByText('ลบเมนู ผัดกะเพรา แล้ว')
    expect(
      api.requestsFor('DELETE', '/api/menu-items').map((r) => r.path),
    ).toEqual(['/api/menu-items/menu_1'])
    expect(api.deletedUploads()).toEqual([])
    expect(
      screen.queryByRole('rowheader', { name: menuName('ผัดกะเพรา') }),
    ).toBeNull()
  })

  it('restores a deleted item and returns focus to the page when its row changes', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByLabelText('แสดงเมนูที่ลบแล้ว'))
    await user.click(
      await screen.findByRole('button', { name: 'กู้คืนเมนู เมนูเลิกขาย' }),
    )
    expect(
      dialog().getByRole('heading', { name: 'กู้คืนเมนูนี้?' }),
    ).toBeTruthy()
    await user.click(dialog().getByRole('button', { name: 'กู้คืนเมนู' }))

    await screen.findByText('กู้คืนเมนู เมนูเลิกขาย แล้ว')
    expect(
      api.requestsFor('POST', '/api/menu-items/menu_3').map((r) => r.path),
    ).toEqual(['/api/menu-items/menu_3/restore'])
    expect(within(rowFor('เมนูเลิกขาย')).getByText('ใช้งาน')).toBeTruthy()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'เพิ่มเมนูอาหาร' }),
    )
  })

  it('blocks restoring an item while its Restaurant is deleted', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByLabelText('แสดงเมนูที่ลบแล้ว'))
    await user.click(
      await screen.findByRole('button', { name: 'กู้คืนเมนู เมนูร้านปิด' }),
    )

    expect(
      dialog().getByText(
        'ยังกู้คืนเมนูนี้ไม่ได้ เพราะร้านอาหารของเมนูถูกลบอยู่',
      ),
    ).toBeTruthy()
    expect(
      dialog().getByRole<HTMLButtonElement>('button', { name: 'กู้คืนเมนู' })
        .disabled,
    ).toBe(true)
    expect(api.requestsFor('POST', '/api/menu-items/menu_4')).toEqual([])
  })
})

describe('MenuItemsPage bulk actions', () => {
  it('selects rows and the whole page, announcing the count on each bulk button', async () => {
    fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    expect(selectedCount()).toBe('เลือกเมนูแล้ว 0 รายการ')
    expect(screen.getByText('เลือกได้สูงสุด 50 รายการต่อครั้ง')).toBeTruthy()
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'ลบเมนูที่เลือก 0 รายการ',
      }).disabled,
    ).toBe(true)

    await user.click(checkbox('ผัดกะเพรา'))
    expect(selectedCount()).toBe('เลือกเมนูแล้ว 1 รายการ')
    const selectAll = screen.getByRole<HTMLInputElement>('checkbox', {
      name: 'เลือกเมนูทั้งหมดในหน้านี้',
    })
    expect(selectAll.indeterminate).toBe(true)

    await user.click(selectAll)
    expect(selectedCount()).toBe('เลือกเมนูแล้ว 2 รายการ')
    expect(selectAll.checked).toBe(true)
    expect(
      screen.getByRole('button', { name: 'กู้คืนเมนูที่เลือก 2 รายการ' }),
    ).toBeTruthy()

    await user.click(selectAll)
    expect(selectedCount()).toBe('เลือกเมนูแล้ว 0 รายการ')
  })

  it('clears the selection when the filters or page change', async () => {
    const many = Array.from({ length: 25 }, (_, index) =>
      menuItem(`m_${index}`, `เมนู ${index}`, `Dish ${index}`),
    )
    const api = fakeMenuItemsApi({ items: many })
    const { user } = await openMenuItemsPage()
    // Waits for the list request, then lets its response render.
    async function settle(path: string) {
      await waitFor(() =>
        expect(api.requestsFor('GET', '/api/menu-items').at(-1)?.path).toBe(
          path,
        ),
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    // Leaving the page and coming back does not bring the selection back.
    await user.click(checkbox('เมนู 0'))
    await user.click(screen.getByRole('button', { name: 'ถัดไป' }))
    await settle('/api/menu-items?page=2&pageSize=20')
    await user.click(screen.getByRole('button', { name: 'ก่อนหน้า' }))
    await settle('/api/menu-items?page=1&pageSize=20')
    expect(checkbox('เมนู 0').checked).toBe(false)
    expect(selectedCount()).toBe('เลือกเมนูแล้ว 0 รายการ')

    // A filter that keeps the selected row visible still clears it.
    await user.click(checkbox('เมนู 0'))
    await user.selectOptions(screen.getByLabelText('ประเภทอาหาร'), 'food_1')
    await settle('/api/menu-items?page=1&pageSize=20&foodTypeId=food_1')
    expect(checkbox('เมนู 0').checked).toBe(false)
    expect(selectedCount()).toBe('เลือกเมนูแล้ว 0 รายการ')
  })

  it('bulk deletes the selected items with explicit IDs after confirmation', async () => {
    const api = fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(
      screen.getByRole('checkbox', { name: 'เลือกเมนูทั้งหมดในหน้านี้' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'ลบเมนูที่เลือก 2 รายการ' }),
    )
    expect(
      dialog().getByRole('heading', { name: 'ลบเมนูที่เลือก?' }),
    ).toBeTruthy()
    expect(api.requestsFor('POST', '/api/menu-items/bulk-delete')).toEqual([])
    await user.click(dialog().getByRole('button', { name: 'ลบเมนูที่เลือก' }))

    await screen.findByText('ลบเมนูแล้ว 2 รายการ')
    expect(
      api.requestsFor('POST', '/api/menu-items/bulk-delete')[0]?.body,
    ).toEqual({ ids: ['menu_1', 'menu_2'] })
    expect(await screen.findByText('ยังไม่มีเมนูอาหาร')).toBeTruthy()
    expect(selectedCount()).toBe('เลือกเมนูแล้ว 0 รายการ')
  })

  it('bulk restores deleted items with explicit IDs after confirmation', async () => {
    const api = fakeMenuItemsApi({ items: [padKrapao, retiredDish] })
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByLabelText('แสดงเมนูที่ลบแล้ว'))
    await screen.findByRole('rowheader', { name: menuName('เมนูเลิกขาย') })
    await user.click(checkbox('เมนูเลิกขาย'))
    await user.click(
      screen.getByRole('button', { name: 'กู้คืนเมนูที่เลือก 1 รายการ' }),
    )
    await user.click(
      dialog().getByRole('button', { name: 'กู้คืนเมนูที่เลือก' }),
    )

    await screen.findByText('กู้คืนเมนูแล้ว 1 รายการ')
    expect(
      api.requestsFor('POST', '/api/menu-items/bulk-restore')[0]?.body,
    ).toEqual({ ids: ['menu_3'] })
    expect(within(rowFor('เมนูเลิกขาย')).getByText('ใช้งาน')).toBeTruthy()
  })

  it('disables bulk restore while a selected item belongs to a deleted Restaurant', async () => {
    fakeMenuItemsApi()
    const { user } = await openMenuItemsPage()

    await user.click(screen.getByLabelText('แสดงเมนูที่ลบแล้ว'))
    await screen.findByRole('rowheader', { name: menuName('เมนูร้านปิด') })
    await user.click(checkbox('เมนูเลิกขาย'))
    await user.click(checkbox('เมนูร้านปิด'))

    const restore = screen.getByRole<HTMLButtonElement>('button', {
      name: 'กู้คืนเมนูที่เลือก 2 รายการ',
    })
    expect(restore.disabled).toBe(true)
    expect(
      document.getElementById(restore.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toBe('มีเมนูที่อยู่ใต้ร้านอาหารที่ถูกลบ กรุณากู้คืนร้านอาหารก่อน')

    await user.click(checkbox('เมนูร้านปิด'))
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'กู้คืนเมนูที่เลือก 1 รายการ',
      }).disabled,
    ).toBe(false)
  })
})
