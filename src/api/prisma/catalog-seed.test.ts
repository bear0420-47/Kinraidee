import type { Prisma } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import {
  formatCatalogSeedSummary,
  loadCatalogSeed,
  seedCatalog,
} from './catalog-seed'
import { catalogSeedSchema, type CatalogSeed } from './seedSchemas'

type StoredRecord = Record<string, unknown> & { id: string }

function createRecordDelegate() {
  const records = new Map<string, StoredRecord>()
  return {
    records,
    findMany: vi.fn(async ({ where }: { where: { id: { in: string[] } } }) =>
      where.id.in.flatMap((id) => {
        const record = records.get(id)
        return record ? [record] : []
      }),
    ),
    upsert: vi.fn(
      async ({
        where,
        create,
        update,
      }: {
        where: { id: string }
        create: StoredRecord
        update: Record<string, unknown>
      }) => {
        const existing = records.get(where.id)
        const next = existing ? { ...existing, ...update } : { ...create }
        records.set(where.id, next)
        return next
      },
    ),
  }
}

function createTasteLinkDelegate() {
  const records = new Map<string, { menuItemId: string; tasteId: string }>()
  const keyFor = (menuItemId: string, tasteId: string) =>
    JSON.stringify([menuItemId, tasteId])

  return {
    records,
    findMany: vi.fn(
      async ({ where }: { where: { menuItemId: { in: string[] } } }) =>
        [...records.values()].filter(({ menuItemId }) =>
          where.menuItemId.in.includes(menuItemId),
        ),
    ),
    upsert: vi.fn(
      async ({
        create,
      }: {
        create: { menuItemId: string; tasteId: string }
      }) => {
        records.set(keyFor(create.menuItemId, create.tasteId), create)
        return create
      },
    ),
    deleteMany: vi.fn(
      async ({
        where,
      }: {
        where: { OR: { menuItemId: string; tasteId: string }[] }
      }) => {
        let count = 0
        for (const { menuItemId, tasteId } of where.OR) {
          if (records.delete(keyFor(menuItemId, tasteId))) count += 1
        }
        return { count }
      },
    ),
  }
}

function createCatalogTransaction() {
  const zone = createRecordDelegate()
  const foodType = createRecordDelegate()
  const taste = createRecordDelegate()
  const restaurant = createRecordDelegate()
  const menuItem = createRecordDelegate()
  const menuItemTaste = createTasteLinkDelegate()

  return {
    transaction: {
      zone,
      foodType,
      taste,
      restaurant,
      menuItem,
      menuItemTaste,
    } as unknown as Prisma.TransactionClient,
    delegates: {
      zone,
      foodType,
      taste,
      restaurant,
      menuItem,
      menuItemTaste,
    },
  }
}

describe('approved catalog seed', () => {
  it('loads the complete approved fixture with valid references', async () => {
    const catalog = await loadCatalogSeed()

    expect(catalog.zones).toHaveLength(3)
    expect(catalog.foodTypes).toHaveLength(4)
    expect(catalog.tastes).toHaveLength(6)
    expect(catalog.restaurants).toHaveLength(3)
    expect(catalog.menuItems).toHaveLength(9)
    expect(new Set(catalog.restaurants.map(({ id }) => id)).size).toBe(3)
    expect(
      catalog.menuItems.reduce(
        (total, menuItem) => total + menuItem.tasteIds.length,
        0,
      ),
    ).toBe(22)
  })

  it('rejects the complete fixture before any database read or write', async () => {
    const catalog = structuredClone(await loadCatalogSeed())
    const { transaction, delegates } = createCatalogTransaction()
    catalog.menuItems[0]!.tasteIds[0] = 'c000000000000000000000000'

    await expect(seedCatalog(transaction, catalog)).rejects.toThrow(
      'Menu item references an unknown taste.',
    )
    expect(delegates.zone.findMany).not.toHaveBeenCalled()
    expect(delegates.zone.upsert).not.toHaveBeenCalled()
  })

  it('creates the dataset once and leaves an identical second run unchanged', async () => {
    const catalog = await loadCatalogSeed()
    const { transaction, delegates } = createCatalogTransaction()

    await expect(seedCatalog(transaction, catalog)).resolves.toEqual({
      created: 47,
      updated: 0,
      unchanged: 0,
      removedTasteLinks: 0,
    })
    await expect(seedCatalog(transaction, catalog)).resolves.toEqual({
      created: 0,
      updated: 0,
      unchanged: 47,
      removedTasteLinks: 0,
    })

    expect(delegates.zone.records).toHaveLength(3)
    expect(delegates.restaurant.records).toHaveLength(3)
    expect(delegates.menuItem.records).toHaveLength(9)
    expect(delegates.menuItemTaste.records).toHaveLength(22)
  })

  it('updates managed fields without restoring soft deletes', async () => {
    const catalog = await loadCatalogSeed()
    const { transaction, delegates } = createCatalogTransaction()
    await seedCatalog(transaction, catalog)

    const restaurantId = catalog.restaurants[0]!.id
    const menuItemId = catalog.menuItems[0]!.id
    delegates.restaurant.records.set(restaurantId, {
      ...delegates.restaurant.records.get(restaurantId)!,
      deletedAt: new Date('2026-10-01T00:00:00.000Z'),
      imageKey: 'admin-owned-key',
      imageUrl: '/uploads/admin-owned-image.webp',
    })
    delegates.menuItem.records.set(menuItemId, {
      ...delegates.menuItem.records.get(menuItemId)!,
      deletedAt: new Date('2026-10-01T00:00:00.000Z'),
      imageKey: 'admin-owned-menu-key',
      imageUrl: '/uploads/admin-owned-menu.webp',
    })

    const changedCatalog: CatalogSeed = structuredClone(catalog)
    changedCatalog.restaurants[0]!.description!.en = 'Updated seed description.'
    changedCatalog.restaurants[0]!.imageUrl =
      'https://images.example.test/restaurant.webp'
    changedCatalog.menuItems[0]!.price = 100
    changedCatalog.menuItems[0]!.imageUrl =
      'https://images.example.test/menu.webp'
    await seedCatalog(transaction, changedCatalog)

    expect(delegates.restaurant.records.get(restaurantId)).toMatchObject({
      descriptionEn: 'Updated seed description.',
      deletedAt: new Date('2026-10-01T00:00:00.000Z'),
      imageKey: null,
      imageUrl: 'https://images.example.test/restaurant.webp',
    })
    expect(delegates.menuItem.records.get(menuItemId)).toMatchObject({
      price: 100,
      deletedAt: new Date('2026-10-01T00:00:00.000Z'),
      imageKey: null,
      imageUrl: 'https://images.example.test/menu.webp',
    })

    const restaurantUpdate =
      delegates.restaurant.upsert.mock.calls.at(-1)?.[0].update
    const menuItemUpdate =
      delegates.menuItem.upsert.mock.calls.at(-1)?.[0].update
    expect(restaurantUpdate).not.toHaveProperty('deletedAt')
    expect(restaurantUpdate).toMatchObject({ imageKey: null })
    expect(menuItemUpdate).not.toHaveProperty('deletedAt')
    expect(menuItemUpdate).toMatchObject({ imageKey: null })
  })

  it('removes stale taste links only for menu items managed by the fixture', async () => {
    const catalog = await loadCatalogSeed()
    const { transaction, delegates } = createCatalogTransaction()
    await seedCatalog(transaction, catalog)

    const managedMenuItemId = catalog.menuItems[0]!.id
    const staleTasteId = catalog.tastes.at(-1)!.id
    const unrelatedLink = {
      menuItemId: 'c000000000000000000000001',
      tasteId: staleTasteId,
    }
    delegates.menuItemTaste.records.set(
      JSON.stringify([managedMenuItemId, staleTasteId]),
      { menuItemId: managedMenuItemId, tasteId: staleTasteId },
    )
    delegates.menuItemTaste.records.set(
      JSON.stringify([unrelatedLink.menuItemId, unrelatedLink.tasteId]),
      unrelatedLink,
    )

    await expect(seedCatalog(transaction, catalog)).resolves.toEqual({
      created: 0,
      updated: 0,
      unchanged: 47,
      removedTasteLinks: 1,
    })
    expect(delegates.menuItemTaste.records).toHaveLength(23)
    expect(
      delegates.menuItemTaste.records.get(
        JSON.stringify([unrelatedLink.menuItemId, unrelatedLink.tasteId]),
      ),
    ).toEqual(unrelatedLink)
  })

  it('reports safe aggregate counts only', () => {
    const summary = formatCatalogSeedSummary({
      created: 47,
      updated: 0,
      unchanged: 0,
      removedTasteLinks: 0,
    })

    expect(summary).toBe(
      'Seeded 47 catalog records and links (47 created, 0 updated, 0 unchanged, 0 stale taste links removed).',
    )
    expect(summary).not.toMatch(/Family|YanYan|0633249622/)
  })

  it('rejects duplicate stable IDs', async () => {
    const catalog = structuredClone(await loadCatalogSeed())
    catalog.foodTypes[0]!.id = catalog.zones[0]!.id

    expect(() => catalogSeedSchema.parse(catalog)).toThrow('Duplicate value')
  })

  it.each([
    [
      'missing localized name',
      (catalog: CatalogSeed) => (catalog.zones[0]!.name.th = ''),
    ],
    [
      'invalid price',
      (catalog: CatalogSeed) => (catalog.menuItems[0]!.price = 0),
    ],
    [
      'invalid sort order',
      (catalog: CatalogSeed) => (catalog.foodTypes[0]!.sortOrder = 1.5),
    ],
    [
      'invalid image URL',
      (catalog: CatalogSeed) =>
        (catalog.restaurants[0]!.imageUrl = 'not-a-url'),
    ],
    [
      'non-HTTP image URL',
      (catalog: CatalogSeed) =>
        (catalog.menuItems[0]!.imageUrl = 'javascript:alert(1)'),
    ],
  ])('rejects %s', async (_case, mutate) => {
    const catalog = structuredClone(await loadCatalogSeed())
    mutate(catalog)

    expect(catalogSeedSchema.safeParse(catalog).success).toBe(false)
  })

  it('contains no credential fields or email addresses', async () => {
    const serializedCatalog = JSON.stringify(await loadCatalogSeed())

    expect(serializedCatalog).not.toMatch(
      /password|jwt|cookie|secret|authorization/i,
    )
    expect(serializedCatalog).not.toMatch(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    )
  })
})
