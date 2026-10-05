import { readFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'

import type { Prisma } from '@prisma/client'

import { catalogSeedSchema } from './seedSchemas'

export type CatalogSeedCounts = {
  created: number
  updated: number
  unchanged: number
  removedTasteLinks: number
}

type SeedState = 'created' | 'updated' | 'unchanged'

function getSeedState(
  existing: Record<string, unknown> | undefined,
  desired: Record<string, unknown>,
): SeedState {
  if (!existing) return 'created'

  const comparableExisting = Object.fromEntries(
    Object.keys(desired).map((key) => [key, existing[key]]),
  )
  return isDeepStrictEqual(comparableExisting, desired)
    ? 'unchanged'
    : 'updated'
}

function increment(counts: CatalogSeedCounts, state: SeedState) {
  counts[state] += 1
}

export async function loadCatalogSeed(
  fixtureUrl = new URL('./data/catalog.seed.json', import.meta.url),
) {
  const rawFixture = await readFile(fixtureUrl, 'utf8')
  return catalogSeedSchema.parse(JSON.parse(rawFixture) as unknown)
}

export async function seedCatalog(
  transaction: Prisma.TransactionClient,
  input: unknown,
): Promise<CatalogSeedCounts> {
  const catalog = catalogSeedSchema.parse(input)
  const counts: CatalogSeedCounts = {
    created: 0,
    updated: 0,
    unchanged: 0,
    removedTasteLinks: 0,
  }

  const [existingZones, existingFoodTypes, existingTastes] = await Promise.all([
    transaction.zone.findMany({
      where: { id: { in: catalog.zones.map(({ id }) => id) } },
    }),
    transaction.foodType.findMany({
      where: { id: { in: catalog.foodTypes.map(({ id }) => id) } },
    }),
    transaction.taste.findMany({
      where: { id: { in: catalog.tastes.map(({ id }) => id) } },
    }),
  ])

  const zoneById = new Map(existingZones.map((record) => [record.id, record]))
  for (const zone of catalog.zones) {
    const record = {
      id: zone.id,
      nameTh: zone.name.th,
      nameEn: zone.name.en,
      descriptionTh: zone.description?.th ?? null,
      descriptionEn: zone.description?.en ?? null,
      sortOrder: zone.sortOrder,
    }
    const state = getSeedState(zoneById.get(zone.id), record)
    increment(counts, state)
    if (state !== 'unchanged') {
      await transaction.zone.upsert({
        where: { id: zone.id },
        create: record,
        update: record,
      })
    }
  }

  const foodTypeById = new Map(
    existingFoodTypes.map((record) => [record.id, record]),
  )
  for (const foodType of catalog.foodTypes) {
    const record = {
      id: foodType.id,
      nameTh: foodType.name.th,
      nameEn: foodType.name.en,
      icon: foodType.icon,
      sortOrder: foodType.sortOrder,
    }
    const state = getSeedState(foodTypeById.get(foodType.id), record)
    increment(counts, state)
    if (state !== 'unchanged') {
      await transaction.foodType.upsert({
        where: { id: foodType.id },
        create: record,
        update: record,
      })
    }
  }

  const tasteById = new Map(existingTastes.map((record) => [record.id, record]))
  for (const taste of catalog.tastes) {
    const record = {
      id: taste.id,
      nameTh: taste.name.th,
      nameEn: taste.name.en,
      icon: taste.icon,
      sortOrder: taste.sortOrder,
    }
    const state = getSeedState(tasteById.get(taste.id), record)
    increment(counts, state)
    if (state !== 'unchanged') {
      await transaction.taste.upsert({
        where: { id: taste.id },
        create: record,
        update: record,
      })
    }
  }

  const existingRestaurants = await transaction.restaurant.findMany({
    where: { id: { in: catalog.restaurants.map(({ id }) => id) } },
  })
  const restaurantById = new Map(
    existingRestaurants.map((record) => [record.id, record]),
  )
  for (const restaurant of catalog.restaurants) {
    const record = {
      id: restaurant.id,
      zoneId: restaurant.zoneId,
      nameTh: restaurant.name.th,
      nameEn: restaurant.name.en,
      descriptionTh: restaurant.description?.th ?? null,
      descriptionEn: restaurant.description?.en ?? null,
      phone: restaurant.phone,
      imageKey: null,
      imageUrl: restaurant.imageUrl,
    }
    const state = getSeedState(restaurantById.get(restaurant.id), record)
    increment(counts, state)
    if (state !== 'unchanged') {
      await transaction.restaurant.upsert({
        where: { id: restaurant.id },
        create: record,
        update: record,
      })
    }
  }

  const existingMenuItems = await transaction.menuItem.findMany({
    where: { id: { in: catalog.menuItems.map(({ id }) => id) } },
  })
  const menuItemById = new Map(
    existingMenuItems.map((record) => [record.id, record]),
  )
  for (const menuItem of catalog.menuItems) {
    const record = {
      id: menuItem.id,
      restaurantId: menuItem.restaurantId,
      foodTypeId: menuItem.foodTypeId,
      nameTh: menuItem.name.th,
      nameEn: menuItem.name.en,
      descriptionTh: menuItem.description?.th ?? null,
      descriptionEn: menuItem.description?.en ?? null,
      price: menuItem.price,
      imageKey: null,
      imageUrl: menuItem.imageUrl,
    }
    const state = getSeedState(menuItemById.get(menuItem.id), record)
    increment(counts, state)
    if (state !== 'unchanged') {
      await transaction.menuItem.upsert({
        where: { id: menuItem.id },
        create: record,
        update: record,
      })
    }
  }

  const seededMenuItemIds = catalog.menuItems.map(({ id }) => id)
  const existingTasteLinks = await transaction.menuItemTaste.findMany({
    where: { menuItemId: { in: seededMenuItemIds } },
  })
  const approvedTasteLinkKeys = new Set(
    catalog.menuItems.flatMap((menuItem) =>
      menuItem.tasteIds.map((tasteId) =>
        JSON.stringify([menuItem.id, tasteId]),
      ),
    ),
  )
  const extraTasteLinks = existingTasteLinks.filter(
    ({ menuItemId, tasteId }) =>
      !approvedTasteLinkKeys.has(JSON.stringify([menuItemId, tasteId])),
  )

  if (extraTasteLinks.length > 0) {
    await transaction.menuItemTaste.deleteMany({
      where: {
        OR: extraTasteLinks.map(({ menuItemId, tasteId }) => ({
          menuItemId,
          tasteId,
        })),
      },
    })
    counts.removedTasteLinks = extraTasteLinks.length
  }

  const existingTasteLinkKeys = new Set(
    existingTasteLinks.map(({ menuItemId, tasteId }) =>
      JSON.stringify([menuItemId, tasteId]),
    ),
  )

  for (const menuItem of catalog.menuItems) {
    for (const tasteId of menuItem.tasteIds) {
      const link = { menuItemId: menuItem.id, tasteId }
      const key = JSON.stringify([link.menuItemId, link.tasteId])
      if (existingTasteLinkKeys.has(key)) {
        increment(counts, 'unchanged')
        continue
      }

      increment(counts, 'created')
      await transaction.menuItemTaste.upsert({
        where: { menuItemId_tasteId: link },
        create: link,
        update: {},
      })
    }
  }

  return counts
}

export function formatCatalogSeedSummary(counts: CatalogSeedCounts) {
  const total = counts.created + counts.updated + counts.unchanged
  return `Seeded ${total} catalog records and links (${counts.created} created, ${counts.updated} updated, ${counts.unchanged} unchanged, ${counts.removedTasteLinks} stale taste links removed).`
}
