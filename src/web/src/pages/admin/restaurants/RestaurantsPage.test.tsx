import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Restaurant } from '@/schemas/admin/restaurants/restaurantSchemas'
import type { Zone } from '@/schemas/admin/zones/zoneSchemas'
import { dialog, errorFor } from '@/test/formQueries'
import {
  errorResponse,
  fakeAuthApi,
  jsonResponse,
  renderApp,
  testAdmin,
} from '@/test/renderApp'

const oldKey = '11111111-1111-4111-8111-111111111111.webp'

const zones: Zone[] = [
  {
    id: 'zone_1',
    name: { th: 'หน้ามอ', en: 'Front Gate' },
    description: null,
    sortOrder: 1,
  },
  {
    id: 'zone_2',
    name: { th: 'หลังมอ', en: 'Back Gate' },
    description: null,
    sortOrder: 2,
  },
]

function restaurant(
  fields: Partial<Restaurant> & Pick<Restaurant, 'id' | 'name'>,
): Restaurant {
  return {
    zoneId: 'zone_1',
    zone: { id: 'zone_1', name: zones[0]!.name },
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

const thaiKitchen = restaurant({
  id: 'restaurant_1',
  name: { th: 'ครัวไทย', en: 'Thai Kitchen' },
  phone: '053-123-456',
  imageKey: oldKey,
  imageUrl: `/uploads/${oldKey}`,
})
const boatNoodles = restaurant({
  id: 'restaurant_2',
  zoneId: 'zone_2',
  zone: { id: 'zone_2', name: zones[1]!.name },
  name: { th: 'ก๋วยเตี๋ยวเรือ', en: 'Boat Noodles' },
  imageUrl: 'https://images.example.com/boat.jpg',
})
const closedShop = restaurant({
  id: 'restaurant_3',
  name: { th: 'ร้านปิดแล้ว', en: 'Closed Shop' },
  deletedAt: '2026-10-02T00:00:00.000Z',
})

function uploadKey(n: number) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}.webp`
}

// Stateful Restaurant, Zone, and upload API for an ADMIN session.
function fakeRestaurantsApi({
  items: initialItems = [thaiKitchen, boatNoodles, closedShop],
  overrides = {},
}: {
  items?: Restaurant[]
  overrides?: Record<string, (body: unknown) => Response | Promise<Response>>
} = {}) {
  let items = [...initialItems]
  let uploads = 0

  const api = fakeAuthApi({
    currentUser: testAdmin,
    responses: {
      'GET /api/zones': () => jsonResponse(200, { data: { items: zones } }),
      ...overrides,
    },
    handle: (method, url, body) => {
      const path = url.pathname
      const params = url.searchParams
      const id = path.match(/^\/api\/restaurants\/([^/]+)/)?.[1]
      const current = items.find((item) => item.id === id)

      if (method === 'GET' && path === '/api/restaurants') {
        const search = params.get('search') ?? ''
        const zoneId = params.get('zoneId')
        const page = Number(params.get('page') ?? 1)
        const pageSize = Number(params.get('pageSize') ?? 20)
        const matches = items.filter(
          (item) =>
            (params.get('includeDeleted') === 'true' || !item.deletedAt) &&
            (!zoneId || item.zoneId === zoneId) &&
            (item.name.th.includes(search) || item.name.en.includes(search)),
        )
        return jsonResponse(200, {
          data: {
            items: matches.slice((page - 1) * pageSize, page * pageSize),
          },
          meta: { page, pageSize, total: matches.length },
        })
      }
      if (method === 'POST' && path === '/api/restaurants') {
        const fields = body as Partial<Restaurant> &
          Pick<Restaurant, 'name' | 'zoneId'>
        const created = restaurant({
          id: 'restaurant_new',
          ...fields,
          zone: {
            id: fields.zoneId,
            name: zones.find((zone) => zone.id === fields.zoneId)!.name,
          },
        })
        items = [...items, created]
        return jsonResponse(201, { data: { restaurant: created } })
      }
      if (current && method === 'PATCH') {
        const updated = { ...current, ...(body as Partial<Restaurant>) }
        items = items.map((item) => (item.id === id ? updated : item))
        return jsonResponse(200, { data: { restaurant: updated } })
      }
      if (current && method === 'DELETE') {
        items = items.map((item) =>
          item.id === id
            ? { ...item, deletedAt: '2026-10-05T00:00:00.000Z' }
            : item,
        )
        return new Response(null, { status: 204 })
      }
      if (current && method === 'POST' && path.endsWith('/restore')) {
        const restored = { ...current, deletedAt: null }
        items = items.map((item) => (item.id === id ? restored : item))
        return jsonResponse(200, { data: { restaurant: restored } })
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

async function openRestaurantsPage(path = '/admin/restaurants') {
  const app = renderApp(path)
  await screen.findByRole('table', { name: 'รายการร้านอาหาร' })
  return app
}

function rows() {
  return screen.getAllByRole('row').slice(1)
}

function imageFileInput() {
  return dialog().getByLabelText<HTMLInputElement>(
    'เลือกไฟล์รูป (JPEG, PNG หรือ WebP ไม่เกิน 2 MB)',
  )
}

function pngFile(size = 100) {
  return new File([new Uint8Array(size)], 'shop.png', { type: 'image/png' })
}

async function fillNewRestaurant(user: ReturnType<typeof renderApp>['user']) {
  await user.selectOptions(dialog().getByLabelText('โซน'), 'zone_2')
  await user.type(dialog().getByLabelText('ชื่อร้านภาษาไทย'), ' ร้านใหม่ ')
  await user.type(dialog().getByLabelText('ชื่อร้านภาษาอังกฤษ'), 'New Shop')
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('RestaurantsPage list', () => {
  it('lists active restaurants with zone, phone, image, and status', async () => {
    const api = fakeRestaurantsApi()
    await openRestaurantsPage()

    expect(
      screen.getByRole('heading', { name: 'จัดการร้านอาหาร' }),
    ).toBeTruthy()
    expect(rows().map((row) => row.textContent)).toEqual([
      'ครัวไทยThai Kitchenหน้ามอ053-123-456ใช้งานแก้ไขลบ',
      'ก๋วยเตี๋ยวเรือBoat Noodlesหลังมอไม่มีใช้งานแก้ไขลบ',
    ])
    expect(screen.getByText('หน้า 1 จาก 1 · ทั้งหมด 2 รายการ')).toBeTruthy()
    expect(api.requestsFor('GET', '/api/restaurants')[0]?.path).toBe(
      '/api/restaurants?page=1&pageSize=20',
    )
    // Uploaded images resolve against the API origin; external URLs are used as-is.
    const images = screen.getAllByRole('presentation') as HTMLImageElement[]
    expect(images.map((image) => image.src)).toEqual([
      `http://localhost:3000/uploads/${oldKey}`,
      'https://images.example.com/boat.jpg',
    ])
  })

  it('pages through results using the API metadata', async () => {
    const many = Array.from({ length: 25 }, (_, index) =>
      restaurant({
        id: `r_${index}`,
        name: { th: `ร้าน ${index}`, en: `Shop ${index}` },
      }),
    )
    const api = fakeRestaurantsApi({ items: many })
    const { user } = await openRestaurantsPage()

    expect(screen.getByText('หน้า 1 จาก 2 · ทั้งหมด 25 รายการ')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'ถัดไป' }))

    expect(
      await screen.findByText('หน้า 2 จาก 2 · ทั้งหมด 25 รายการ'),
    ).toBeTruthy()
    expect(rows()).toHaveLength(5)
    expect(api.requestsFor('GET', '/api/restaurants').at(-1)?.path).toBe(
      '/api/restaurants?page=2&pageSize=20',
    )
    expect(
      (screen.getByRole('button', { name: 'ถัดไป' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })

  it('applies search, Zone, and deleted filters to the query and resets to page 1', async () => {
    const many = Array.from({ length: 25 }, (_, index) =>
      restaurant({
        id: `r_${index}`,
        name: { th: `ร้าน ${index}`, en: `Shop ${index}` },
      }),
    )
    const api = fakeRestaurantsApi({ items: [...many, closedShop] })
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'ถัดไป' }))
    await screen.findByText(/หน้า 2 จาก 2/)

    await user.type(screen.getByLabelText('ค้นหาชื่อร้าน'), 'ร้าน 1')
    await user.click(screen.getByRole('button', { name: 'ค้นหา' }))
    await waitFor(() =>
      expect(api.requestsFor('GET', '/api/restaurants').at(-1)?.path).toBe(
        `/api/restaurants?page=1&pageSize=20&search=${encodeURIComponent('ร้าน 1')}`,
      ),
    )

    await user.selectOptions(screen.getByLabelText('โซน'), 'zone_2')
    await waitFor(() =>
      expect(api.requestsFor('GET', '/api/restaurants').at(-1)?.path).toContain(
        'zoneId=zone_2',
      ),
    )
    expect(
      await screen.findByText('ไม่พบร้านอาหารที่ตรงกับตัวกรอง'),
    ).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('โซน'), '')
    await user.clear(screen.getByLabelText('ค้นหาชื่อร้าน'))
    await user.click(screen.getByRole('button', { name: 'ค้นหา' }))
    await user.click(screen.getByLabelText('แสดงร้านที่ลบแล้ว'))

    await waitFor(() =>
      expect(api.requestsFor('GET', '/api/restaurants').at(-1)?.path).toBe(
        '/api/restaurants?page=1&pageSize=20&includeDeleted=true',
      ),
    )
  })

  it('shows deleted restaurants with a text status and restore instead of edit', async () => {
    fakeRestaurantsApi({ items: [closedShop] })
    const { user } = renderApp('/admin/restaurants')

    expect(await screen.findByText('ยังไม่มีร้านอาหาร')).toBeTruthy()
    await user.click(screen.getByLabelText('แสดงร้านที่ลบแล้ว'))

    const row = (
      await screen.findByRole('rowheader', { name: 'ร้านปิดแล้ว' })
    ).closest('tr')!
    expect(within(row).getByText('ลบแล้ว')).toBeTruthy()
    expect(
      within(row).getByRole('button', { name: 'กู้คืนร้าน ร้านปิดแล้ว' }),
    ).toBeTruthy()
    expect(within(row).queryByRole('button', { name: /แก้ไข/ })).toBeNull()
    expect(within(row).queryByRole('button', { name: /^ลบ/ })).toBeNull()
  })
})

describe('RestaurantsPage create and edit', () => {
  it('validates Zone and localized names, focusing the first invalid field', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await user.click(dialog().getByRole('button', { name: 'เพิ่มร้านอาหาร' }))

    const zone = dialog().getByLabelText('โซน')
    await waitFor(() => expect(document.activeElement).toBe(zone))
    expect(errorFor(zone)).toBe('กรุณาเลือกโซน')
    expect(errorFor(dialog().getByLabelText('ชื่อร้านภาษาไทย'))).toBe(
      'กรุณากรอกชื่อภาษาไทย',
    )
    expect(errorFor(dialog().getByLabelText('ชื่อร้านภาษาอังกฤษ'))).toBe(
      'กรุณากรอกชื่อภาษาอังกฤษ',
    )
    expect(api.requestsFor('POST', '/api/restaurants')).toEqual([])
  })

  it('submits an external image URL with imageKey null, previewing it only once valid', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await fillNewRestaurant(user)
    await user.click(dialog().getByLabelText('ใช้ URL รูปภาพ'))
    await user.type(
      dialog().getByLabelText('URL รูปภาพ'),
      'images.example.com/new.jpg',
    )
    expect(dialog().queryByAltText('ตัวอย่างรูปร้านจาก URL')).toBeNull()
    await user.clear(dialog().getByLabelText('URL รูปภาพ'))
    await user.type(
      dialog().getByLabelText('URL รูปภาพ'),
      'https://images.example.com/new.jpg',
    )
    expect(dialog().getByAltText('ตัวอย่างรูปร้านจาก URL')).toBeTruthy()
    await user.click(dialog().getByRole('button', { name: 'เพิ่มร้านอาหาร' }))

    await screen.findByText('เพิ่มร้าน ร้านใหม่ แล้ว')
    expect(api.requestsFor('POST', '/api/restaurants')[0]?.body).toEqual({
      zoneId: 'zone_2',
      name: { th: 'ร้านใหม่', en: 'New Shop' },
      description: null,
      phone: null,
      imageKey: null,
      imageUrl: 'https://images.example.com/new.jpg',
    })
    expect(
      await screen.findByRole('rowheader', { name: 'ร้านใหม่' }),
    ).toBeTruthy()
  })

  it('shows a fallback when an external image cannot load', async () => {
    fakeRestaurantsApi({ items: [boatNoodles] })
    await openRestaurantsPage()

    fireEvent.error(screen.getByRole('presentation'))

    expect(await screen.findByText('โหลดรูปไม่ได้')).toBeTruthy()
  })

  it('pre-fills an edit and blocks editing a deleted restaurant until restored', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(
      screen.getByRole('button', { name: 'แก้ไขร้าน ก๋วยเตี๋ยวเรือ' }),
    )
    expect((dialog().getByLabelText('โซน') as HTMLSelectElement).value).toBe(
      'zone_2',
    )
    expect(
      (dialog().getByLabelText('ใช้ URL รูปภาพ') as HTMLInputElement).checked,
    ).toBe(true)
    expect(
      (dialog().getByLabelText('URL รูปภาพ') as HTMLInputElement).value,
    ).toBe('https://images.example.com/boat.jpg')
    await user.type(
      dialog().getByLabelText('เบอร์โทรร้าน (ไม่บังคับ)'),
      ' 02-111-2222 ',
    )
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await screen.findByText('บันทึกการแก้ไขร้าน ก๋วยเตี๋ยวเรือ แล้ว')
    expect(
      api
        .requestsFor('PATCH', '/api/restaurants')
        .map((request) => request.body),
    ).toEqual([{ phone: '02-111-2222' }])
  })
})

describe('RestaurantsPage local uploads', () => {
  it('does not render the upload control in production builds', async () => {
    vi.stubEnv('DEV', false)
    fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))

    expect(dialog().queryByLabelText('อัปโหลดรูปจากเครื่อง')).toBeNull()
    expect(dialog().getByLabelText('ใช้ URL รูปภาพ')).toBeTruthy()
  })

  it('offers JPEG, PNG, and WebP in development and rejects other types and large files before uploading', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    expect(imageFileInput().accept).toBe('image/jpeg,image/png,image/webp')

    fireEvent.change(imageFileInput(), {
      target: { files: [new File(['gif'], 'a.gif', { type: 'image/gif' })] },
    })
    expect((await dialog().findByRole('alert')).textContent).toBe(
      'รองรับเฉพาะไฟล์ JPEG, PNG หรือ WebP',
    )

    fireEvent.change(imageFileInput(), {
      target: { files: [pngFile(2 * 1024 * 1024 + 1)] },
    })
    await waitFor(() =>
      expect(dialog().getByRole('alert').textContent).toBe(
        'ไฟล์รูปต้องมีขนาดไม่เกิน 2 MB',
      ),
    )
    expect(api.requestsFor('POST', '/api/uploads/images')).toEqual([])
  })

  it('uploads the file, previews it, and saves its key and URL without touching browser storage', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await fillNewRestaurant(user)
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())

    expect(await dialog().findByText('อัปโหลดรูปแล้ว')).toBeTruthy()
    const preview = dialog().getByAltText<HTMLImageElement>(
      'ตัวอย่างรูปร้านที่อัปโหลด',
    )
    expect(preview.src).toBe(`http://localhost:3000/uploads/${uploadKey(1)}`)

    await user.click(dialog().getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await screen.findByText('เพิ่มร้าน ร้านใหม่ แล้ว')

    expect(api.requestsFor('POST', '/api/restaurants')[0]?.body).toMatchObject({
      imageKey: uploadKey(1),
      imageUrl: `/uploads/${uploadKey(1)}`,
    })
    expect(api.deletedUploads()).toEqual([])
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
    expect(JSON.stringify(api.requests)).not.toMatch(/data:|blob:/)
  })

  it('requires a file in upload mode and focuses the file input', async () => {
    fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await fillNewRestaurant(user)
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.click(dialog().getByRole('button', { name: 'เพิ่มร้านอาหาร' }))

    await waitFor(() => expect(document.activeElement).toBe(imageFileInput()))
    expect(dialog().getByRole('alert').textContent).toBe(
      'กรุณาเลือกรูปเพื่ออัปโหลด',
    )
  })

  it('cleans up the new upload when create fails', async () => {
    const api = fakeRestaurantsApi({
      overrides: {
        'POST /api/restaurants': () =>
          errorResponse(500, 'INTERNAL_SERVER_ERROR'),
      },
    })
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await fillNewRestaurant(user)
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    await dialog().findByText('อัปโหลดรูปแล้ว')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มร้านอาหาร' }))

    expect(
      await dialog().findByText(
        'บันทึกร้านอาหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      ),
    ).toBeTruthy()
    expect(api.deletedUploads()).toEqual([uploadKey(1)])
    expect(
      dialog().getByText(
        'รูปที่อัปโหลดถูกยกเลิกเพราะบันทึกไม่สำเร็จ กรุณาเลือกรูปอีกครั้ง',
      ),
    ).toBeTruthy()
  })

  it('deletes the old local image only after the replacement is saved', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'แก้ไขร้าน ครัวไทย' }))
    expect(dialog().getByAltText('ตัวอย่างรูปร้านที่อัปโหลด')).toBeTruthy()
    await user.upload(imageFileInput(), pngFile())
    await waitFor(() =>
      expect(
        dialog().getByAltText<HTMLImageElement>('ตัวอย่างรูปร้านที่อัปโหลด')
          .src,
      ).toContain(uploadKey(1)),
    )
    expect(api.deletedUploads()).toEqual([])

    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))
    await screen.findByText('บันทึกการแก้ไขร้าน ครัวไทย แล้ว')

    const order = api.requests
      .filter((request) => ['PATCH', 'DELETE'].includes(request.method))
      .map((request) => `${request.method} ${request.path}`)
    expect(order).toEqual([
      'PATCH /api/restaurants/restaurant_1',
      `DELETE /api/uploads/images/${oldKey}`,
    ])
  })

  it('keeps the old image and removes only the new upload when the update fails', async () => {
    const api = fakeRestaurantsApi({
      overrides: {
        'PATCH /api/restaurants/restaurant_1': () =>
          errorResponse(500, 'INTERNAL_SERVER_ERROR'),
      },
    })
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'แก้ไขร้าน ครัวไทย' }))
    await user.upload(imageFileInput(), pngFile())
    await waitFor(() =>
      expect(
        dialog().getByAltText<HTMLImageElement>('ตัวอย่างรูปร้านที่อัปโหลด')
          .src,
      ).toContain(uploadKey(1)),
    )
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await dialog().findByText('บันทึกร้านอาหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    expect(api.deletedUploads()).toEqual([uploadKey(1)])
    // The form falls back to the image the restaurant still points at.
    expect(
      dialog().getByAltText<HTMLImageElement>('ตัวอย่างรูปร้านที่อัปโหลด').src,
    ).toContain(oldKey)
  })

  it('never sends an external image to upload deletion', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(
      screen.getByRole('button', { name: 'แก้ไขร้าน ก๋วยเตี๋ยวเรือ' }),
    )
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    await dialog().findByText('อัปโหลดรูปแล้ว')
    await user.click(dialog().getByRole('button', { name: 'บันทึกการแก้ไข' }))

    await screen.findByText('บันทึกการแก้ไขร้าน ก๋วยเตี๋ยวเรือ แล้ว')
    expect(api.requestsFor('PATCH', '/api/restaurants')[0]?.body).toEqual({
      imageKey: uploadKey(1),
      imageUrl: `/uploads/${uploadKey(1)}`,
    })
    expect(api.deletedUploads()).toEqual([])
  })

  it('cleans up an unsaved upload when the form is cancelled or replaced', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    await dialog().findByText('อัปโหลดรูปแล้ว')
    await user.upload(imageFileInput(), pngFile())
    await waitFor(() => expect(api.deletedUploads()).toEqual([uploadKey(1)]))

    await user.click(dialog().getByRole('button', { name: 'ยกเลิก' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() =>
      expect(api.deletedUploads()).toEqual([uploadKey(1), uploadKey(2)]),
    )
  })

  it('asks before navigating away from an unsaved upload and cleans it up on leave', async () => {
    const api = fakeRestaurantsApi()
    const { user, router } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    await dialog().findByText('อัปโหลดรูปแล้ว')

    void router.navigate('/admin')
    const prompt = await screen.findByRole('dialog', { name: 'ออกจากหน้านี้?' })
    await user.click(
      within(prompt).getByRole('button', { name: 'ออกจากหน้านี้' }),
    )

    await screen.findByRole('heading', { name: 'จัดการระบบ' })
    expect(api.deletedUploads()).toEqual([uploadKey(1)])
  })

  it('navigates without asking when nothing is unsaved', async () => {
    fakeRestaurantsApi()
    const { router } = await openRestaurantsPage()

    void router.navigate('/admin')

    await screen.findByRole('heading', { name: 'จัดการระบบ' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('RestaurantsPage delete and restore', () => {
  it('confirms deletion with the menu warning and keeps the image reference', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'ลบร้าน ครัวไทย' }))
    expect(dialog().getByRole('heading', { name: 'ลบร้านนี้?' })).toBeTruthy()
    expect(
      dialog().getByText('เมนูทั้งหมดของร้านนี้จะถูกซ่อนจากการสุ่มเมนูด้วย'),
    ).toBeTruthy()
    expect(api.requestsFor('DELETE', '/api/restaurants')).toEqual([])

    await user.click(dialog().getByRole('button', { name: 'ลบร้าน' }))

    await screen.findByText('ลบร้าน ครัวไทย แล้ว')
    expect(
      api
        .requestsFor('DELETE', '/api/restaurants')
        .map((request) => request.path),
    ).toEqual(['/api/restaurants/restaurant_1'])
    expect(api.deletedUploads()).toEqual([])
    expect(screen.queryByRole('rowheader', { name: 'ครัวไทย' })).toBeNull()
  })

  it('confirms restore with the warning that menu items are not restored', async () => {
    const api = fakeRestaurantsApi()
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByLabelText('แสดงร้านที่ลบแล้ว'))
    await user.click(
      await screen.findByRole('button', { name: 'กู้คืนร้าน ร้านปิดแล้ว' }),
    )
    expect(
      dialog().getByRole('heading', { name: 'กู้คืนร้านนี้?' }),
    ).toBeTruthy()
    expect(
      dialog().getByText(
        'การกู้คืนร้านจะไม่กู้คืนเมนูที่ถูกลบไว้ ต้องกู้คืนเมนูแยกต่างหาก',
      ),
    ).toBeTruthy()

    await user.click(dialog().getByRole('button', { name: 'กู้คืนร้าน' }))

    await screen.findByText('กู้คืนร้าน ร้านปิดแล้ว แล้ว')
    expect(
      api
        .requestsFor('POST', '/api/restaurants/')
        .map((request) => request.path),
    ).toEqual(['/api/restaurants/restaurant_3/restore'])
    const row = screen
      .getByRole('rowheader', { name: 'ร้านปิดแล้ว' })
      .closest('tr')!
    expect(within(row).getByText('ใช้งาน')).toBeTruthy()
  })
})

// A response the test releases later, to observe the page while a request is in flight.
function deferredResponse() {
  let release: (response: Response) => void = () => undefined
  const promise = new Promise<Response>((resolve) => {
    release = resolve
  })
  return { promise, release }
}

describe('RestaurantsPage in-flight requests', () => {
  it('keeps the form open and the upload intact while a save is in flight', async () => {
    const pendingCreate = deferredResponse()
    const api = fakeRestaurantsApi({
      overrides: { 'POST /api/restaurants': () => pendingCreate.promise },
    })
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await fillNewRestaurant(user)
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    await dialog().findByText('อัปโหลดรูปแล้ว')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มร้านอาหาร' }))

    await dialog().findByRole('button', { name: 'กำลังบันทึก…' })
    expect(
      (dialog().getByRole('button', { name: 'ยกเลิก' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeTruthy()

    pendingCreate.release(
      jsonResponse(201, {
        data: {
          restaurant: restaurant({
            id: 'restaurant_new',
            name: { th: 'ร้านใหม่', en: 'New Shop' },
            imageKey: uploadKey(1),
            imageUrl: `/uploads/${uploadKey(1)}`,
          }),
        },
      }),
    )

    expect(await screen.findByText('เพิ่มร้าน ร้านใหม่ แล้ว')).toBeTruthy()
    expect(api.deletedUploads()).toEqual([])
  })

  it('does not delete the upload when leaving during a save that then succeeds', async () => {
    const pendingCreate = deferredResponse()
    const api = fakeRestaurantsApi({
      overrides: { 'POST /api/restaurants': () => pendingCreate.promise },
    })
    const { user, router } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await fillNewRestaurant(user)
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    await dialog().findByText('อัปโหลดรูปแล้ว')
    await user.click(dialog().getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await dialog().findByRole('button', { name: 'กำลังบันทึก…' })

    void router.navigate('/admin')
    const prompt = await screen.findByRole('dialog', { name: 'ออกจากหน้านี้?' })
    await user.click(
      within(prompt).getByRole('button', { name: 'ออกจากหน้านี้' }),
    )
    await screen.findByRole('heading', { name: 'จัดการระบบ' })
    pendingCreate.release(
      jsonResponse(201, {
        data: {
          restaurant: restaurant({
            id: 'restaurant_new',
            name: { th: 'ร้านใหม่', en: 'New Shop' },
            imageKey: uploadKey(1),
            imageUrl: `/uploads/${uploadKey(1)}`,
          }),
        },
      }),
    )

    await waitFor(() =>
      expect(api.requestsFor('POST', '/api/restaurants')).toHaveLength(1),
    )
    expect(api.deletedUploads()).toEqual([])
  })

  it('discards an upload that finishes after the user left the page', async () => {
    const pendingUpload = deferredResponse()
    const lateKey = uploadKey(9)
    const api = fakeRestaurantsApi({
      overrides: { 'POST /api/uploads/images': () => pendingUpload.promise },
    })
    const { user, router } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))
    await user.click(dialog().getByLabelText('อัปโหลดรูปจากเครื่อง'))
    await user.upload(imageFileInput(), pngFile())
    await dialog().findByText('กำลังอัปโหลดรูป…')

    void router.navigate('/admin')
    const prompt = await screen.findByRole('dialog', { name: 'ออกจากหน้านี้?' })
    await user.click(
      within(prompt).getByRole('button', { name: 'ออกจากหน้านี้' }),
    )
    await screen.findByRole('heading', { name: 'จัดการระบบ' })

    pendingUpload.release(
      jsonResponse(201, {
        data: { image: { key: lateKey, url: `/uploads/${lateKey}` } },
      }),
    )

    await waitFor(() => expect(api.deletedUploads()).toEqual([lateKey]))
  })
})

describe('RestaurantsPage edge cases', () => {
  it('moves back to the last page when the only row on a later page is deleted', async () => {
    const many = Array.from({ length: 21 }, (_, index) =>
      restaurant({
        id: `r_${index}`,
        name: { th: `ร้าน ${index}`, en: `Shop ${index}` },
      }),
    )
    fakeRestaurantsApi({ items: many })
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'ถัดไป' }))
    await screen.findByText('หน้า 2 จาก 2 · ทั้งหมด 21 รายการ')
    await user.click(screen.getByRole('button', { name: 'ลบร้าน ร้าน 20' }))
    await user.click(dialog().getByRole('button', { name: 'ลบร้าน' }))

    expect(
      await screen.findByText('หน้า 1 จาก 1 · ทั้งหมด 20 รายการ'),
    ).toBeTruthy()
    expect(rows()).toHaveLength(20)
    expect(screen.queryByText('ยังไม่มีร้านอาหาร')).toBeNull()
  })

  it('explains a Zone load failure and blocks saving', async () => {
    fakeRestaurantsApi({
      overrides: {
        'GET /api/zones': () => errorResponse(500, 'INTERNAL_SERVER_ERROR'),
      },
    })
    const { user } = await openRestaurantsPage()

    await user.click(screen.getByRole('button', { name: 'เพิ่มร้านอาหาร' }))

    expect(
      dialog().getByText('โหลดรายการโซนไม่สำเร็จ กรุณาปิดแล้วลองใหม่อีกครั้ง'),
    ).toBeTruthy()
    expect(
      (
        dialog().getByRole('button', {
          name: 'เพิ่มร้านอาหาร',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
  })

  it('shows the image fallback for a malformed image URL instead of crashing', async () => {
    fakeRestaurantsApi({
      items: [{ ...boatNoodles, imageUrl: 'http://' }],
    })
    await openRestaurantsPage()

    expect(screen.getByText('โหลดรูปไม่ได้')).toBeTruthy()
  })
})
