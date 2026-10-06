import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import request from 'supertest'

import { createApp } from '@/app'
import { prisma } from '@/lib/prisma'

const activeRestaurantCount = 500
const sampleCount = 30
const prefix = `issue44_${Date.now()}`
const id = (name: string) => `${prefix}_${name}`

const zoneId = id('zone')
const emptyZoneId = id('zone_empty')
const baseFoodTypeId = id('food_base')
const filterFoodTypeId = id('food_filter')
const underFoodTypeId = id('food_under')
const middleFoodTypeId = id('food_middle')
const upperFoodTypeId = id('food_upper')
const overFoodTypeId = id('food_over')
const primaryTasteId = id('taste_primary')
const extraTasteId = id('taste_extra')
const deletedRestaurantId = id('restaurant_deleted')

const app = createApp()

function recommendationBody(overrides: Record<string, unknown> = {}) {
  return {
    conditions: {
      budget: 'BETWEEN_50_100',
      tasteId: primaryTasteId,
      foodTypeId: baseFoodTypeId,
      zoneId,
    },
    rejectedMenuItemIds: [],
    displayedMenuItemIds: [],
    count: 3,
    ...overrides,
  }
}

async function seedFixture() {
  await prisma.zone.createMany({
    data: [
      {
        id: zoneId,
        nameTh: `โซนทดสอบ ${prefix}`,
        nameEn: `Test Zone ${prefix}`,
      },
      {
        id: emptyZoneId,
        nameTh: `โซนว่าง ${prefix}`,
        nameEn: `Empty Zone ${prefix}`,
      },
    ],
  })
  await prisma.foodType.createMany({
    data: [
      {
        id: baseFoodTypeId,
        nameTh: `อาหารทดสอบ ${prefix}`,
        nameEn: `Test Food ${prefix}`,
      },
      {
        id: filterFoodTypeId,
        nameTh: `ตัวกรองทดสอบ ${prefix}`,
        nameEn: `Filter Test ${prefix}`,
      },
      {
        id: underFoodTypeId,
        nameTh: `งบต่ำกว่า 50 ${prefix}`,
        nameEn: `Under 50 ${prefix}`,
      },
      {
        id: middleFoodTypeId,
        nameTh: `งบ 50 ถึง 100 ${prefix}`,
        nameEn: `50 to 100 ${prefix}`,
      },
      {
        id: upperFoodTypeId,
        nameTh: `งบ 101 ถึง 200 ${prefix}`,
        nameEn: `101 to 200 ${prefix}`,
      },
      {
        id: overFoodTypeId,
        nameTh: `งบมากกว่า 200 ${prefix}`,
        nameEn: `Over 200 ${prefix}`,
      },
    ],
  })
  await prisma.taste.createMany({
    data: [
      {
        id: primaryTasteId,
        nameTh: `รสหลัก ${prefix}`,
        nameEn: `Primary Taste ${prefix}`,
      },
      {
        id: extraTasteId,
        nameTh: `รสเสริม ${prefix}`,
        nameEn: `Extra Taste ${prefix}`,
      },
    ],
  })
  await prisma.restaurant.createMany({
    data: [
      ...Array.from({ length: activeRestaurantCount }, (_, index) => ({
        id: id(`restaurant_${index}`),
        zoneId,
        nameTh: `ร้านทดสอบ ${prefix} ${index}`,
        nameEn: `Test Restaurant ${prefix} ${index}`,
      })),
      {
        id: deletedRestaurantId,
        zoneId,
        nameTh: `ร้านที่ลบ ${prefix}`,
        nameEn: `Deleted Restaurant ${prefix}`,
        deletedAt: new Date(),
      },
    ],
  })

  const baseMenus = Array.from(
    { length: activeRestaurantCount },
    (_, index) => ({
      id: id(`menu_${index}`),
      restaurantId: id(`restaurant_${index}`),
      foodTypeId: baseFoodTypeId,
      nameTh: `เมนูทดสอบ ${prefix} ${index}`,
      nameEn: `Test Menu ${prefix} ${index}`,
      price: 65,
    }),
  )
  const boundaryMenus = [
    [id('under_49'), underFoodTypeId, 49],
    [id('under_50'), underFoodTypeId, 50],
    [id('middle_49'), middleFoodTypeId, 49],
    [id('middle_50'), middleFoodTypeId, 50],
    [id('middle_100'), middleFoodTypeId, 100],
    [id('middle_101'), middleFoodTypeId, 101],
    [id('upper_100'), upperFoodTypeId, 100],
    [id('upper_101'), upperFoodTypeId, 101],
    [id('upper_200'), upperFoodTypeId, 200],
    [id('upper_201'), upperFoodTypeId, 201],
    [id('over_200'), overFoodTypeId, 200],
    [id('over_201'), overFoodTypeId, 201],
  ].map(([menuId, foodTypeId, price], index) => ({
    id: String(menuId),
    restaurantId: id(`restaurant_${index}`),
    foodTypeId: String(foodTypeId),
    nameTh: `เมนูขอบเขต ${prefix} ${index}`,
    nameEn: `Boundary Menu ${prefix} ${index}`,
    price: Number(price),
  }))
  await prisma.menuItem.createMany({
    data: [
      ...baseMenus,
      ...boundaryMenus,
      {
        id: id('filter_active'),
        restaurantId: id('restaurant_20'),
        foodTypeId: filterFoodTypeId,
        nameTh: `เมนูหลายรส ${prefix}`,
        nameEn: `Multi Taste Menu ${prefix}`,
        price: 65,
      },
      {
        id: id('filter_deleted_menu'),
        restaurantId: id('restaurant_21'),
        foodTypeId: filterFoodTypeId,
        nameTh: `เมนูที่ลบ ${prefix}`,
        nameEn: `Deleted Menu ${prefix}`,
        price: 65,
        deletedAt: new Date(),
      },
      {
        id: id('filter_deleted_restaurant'),
        restaurantId: deletedRestaurantId,
        foodTypeId: filterFoodTypeId,
        nameTh: `เมนูร้านที่ลบ ${prefix}`,
        nameEn: `Deleted Restaurant Menu ${prefix}`,
        price: 65,
      },
    ],
  })
  await prisma.menuItemTaste.createMany({
    data: [
      ...baseMenus.map(({ id: menuItemId }) => ({
        menuItemId,
        tasteId: primaryTasteId,
      })),
      {
        menuItemId: id('filter_active'),
        tasteId: primaryTasteId,
      },
      { menuItemId: id('filter_active'), tasteId: extraTasteId },
      {
        menuItemId: id('filter_deleted_menu'),
        tasteId: primaryTasteId,
      },
      {
        menuItemId: id('filter_deleted_restaurant'),
        tasteId: primaryTasteId,
      },
    ],
  })
}

async function expectBoundary(
  budget: string,
  foodTypeId: string,
  expectedIds: string[],
) {
  const response = await request(app)
    .post('/api/recommendations')
    .send(
      recommendationBody({
        conditions: { budget, tasteId: null, foodTypeId, zoneId },
      }),
    )
    .expect(200)
  assert.deepEqual(
    response.body.data.items.map((item: { id: string }) => item.id).sort(),
    [...expectedIds].sort(),
  )
}

async function verifyBehavior() {
  const body = recommendationBody()
  const coldStartedAt = performance.now()
  const initial = await request(app)
    .post('/api/recommendations')
    .send(body)
    .expect(200)
  const firstRequestMs = performance.now() - coldStartedAt

  assert.equal(initial.body.data.items.length, 3)
  assert.equal(
    new Set(
      initial.body.data.items.map(
        (item: { restaurant: { id: string } }) => item.restaurant.id,
      ),
    ).size,
    3,
  )
  for (const item of initial.body.data.items) {
    assert.equal(item.price, 65)
    assert.equal(item.zone.id, zoneId)
    assert.equal(item.foodType.id, baseFoodTypeId)
    assert.equal('imageKey' in item, false)
    assert.equal('deletedAt' in item, false)
    assert.equal('phone' in item.restaurant, false)
  }

  const firstIds = initial.body.data.items.map(
    (item: { id: string }) => item.id,
  )
  const replacement = await request(app)
    .post('/api/recommendations')
    .send({
      ...body,
      rejectedMenuItemIds: [firstIds[0]],
      displayedMenuItemIds: firstIds.slice(1),
      count: 1,
    })
    .expect(200)
  assert.equal(replacement.body.data.items.length, 1)
  assert.equal(firstIds.includes(replacement.body.data.items[0].id), false)

  const unknownMaster = await request(app)
    .post('/api/recommendations')
    .send({
      ...body,
      conditions: { ...body.conditions, tasteId: id('missing_taste') },
    })
    .expect(400)
  assert.equal(unknownMaster.body.error.code, 'VALIDATION_ERROR')

  const allBaseIds = Array.from({ length: activeRestaurantCount }, (_, index) =>
    id(`menu_${index}`),
  )
  const exhausted = await request(app)
    .post('/api/recommendations')
    .send({ ...body, rejectedMenuItemIds: allBaseIds, count: 1 })
    .expect(200)
  assert.deepEqual(exhausted.body.data, { items: [], suggestion: null })

  const noMatch = await request(app)
    .post('/api/recommendations')
    .send({
      ...body,
      conditions: { ...body.conditions, zoneId: emptyZoneId },
    })
    .expect(200)
  // The suggestion moves to the specific zone that has every active item, and its
  // conditions return items when sent back unchanged.
  const suggestion = noMatch.body.data.suggestion
  assert.equal(suggestion.changes.length, 1)
  assert.equal(suggestion.changes[0].field, 'zone')
  assert.equal(suggestion.changes[0].to.type, 'ZONE')
  assert.equal(suggestion.changes[0].to.id, zoneId)
  assert.equal(suggestion.conditions.zoneId, zoneId)
  assert.equal(suggestion.resultCount, activeRestaurantCount)
  const applied = await request(app)
    .post('/api/recommendations')
    .send({ ...body, conditions: suggestion.conditions })
    .expect(200)
  assert.ok(applied.body.data.items.length > 0)

  const filtered = await request(app)
    .post('/api/recommendations')
    .send(
      recommendationBody({
        conditions: {
          budget: 'BETWEEN_50_100',
          tasteId: primaryTasteId,
          foodTypeId: filterFoodTypeId,
          zoneId,
        },
      }),
    )
    .expect(200)
  assert.deepEqual(
    filtered.body.data.items.map((item: { id: string }) => item.id),
    [id('filter_active')],
  )
  assert.deepEqual(
    filtered.body.data.items[0].tastes
      .map((taste: { id: string }) => taste.id)
      .sort(),
    [extraTasteId, primaryTasteId].sort(),
  )

  await expectBoundary('UNDER_50', underFoodTypeId, [id('under_49')])
  await expectBoundary('BETWEEN_50_100', middleFoodTypeId, [
    id('middle_50'),
    id('middle_100'),
  ])
  await expectBoundary('BETWEEN_101_200', upperFoodTypeId, [
    id('upper_101'),
    id('upper_200'),
  ])
  await expectBoundary('OVER_200', overFoodTypeId, [id('over_201')])

  const samples: number[] = []
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const startedAt = performance.now()
    await request(app).post('/api/recommendations').send(body).expect(200)
    samples.push(performance.now() - startedAt)
  }
  samples.sort((left, right) => left - right)
  const warmP95Ms = samples[Math.ceil(samples.length * 0.95) - 1]
  assert.ok(warmP95Ms !== undefined && warmP95Ms <= 2_000)

  console.info(
    JSON.stringify({
      activeRestaurantCount,
      sampleCount,
      firstRequestMs: Number(firstRequestMs.toFixed(2)),
      warmP95Ms: Number(warmP95Ms.toFixed(2)),
      coldStartNote:
        'Local first request only; hosting cold-start measurement requires a deployed test environment.',
    }),
  )
}

async function cleanupFixture() {
  await prisma.menuItemTaste.deleteMany({
    where: { menuItemId: { startsWith: prefix } },
  })
  await prisma.menuItem.deleteMany({ where: { id: { startsWith: prefix } } })
  await prisma.restaurant.deleteMany({
    where: { id: { startsWith: prefix } },
  })
  await prisma.foodType.deleteMany({
    where: { id: { startsWith: prefix } },
  })
  await prisma.taste.deleteMany({ where: { id: { startsWith: prefix } } })
  await prisma.zone.deleteMany({ where: { id: { startsWith: prefix } } })
}

try {
  await seedFixture()
  await verifyBehavior()
} finally {
  await cleanupFixture()
  await prisma.$disconnect()
}
