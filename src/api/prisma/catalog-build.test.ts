import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { uploadFileNameSchema } from '../src/modules/uploads/uploads.dto'
import {
  buildCatalog,
  CatalogBuildError,
  readCatalogSource,
  runCatalogBuild,
  serializeChecklist,
  serializeCredits,
  serializeWebCredits,
  stableId,
  stableImageKey,
  type RestaurantFile,
} from './catalog-build'

const taxonomy = {
  zones: [
    {
      slug: 'opposite-mfu',
      id: 'c8gds70havtzwmks5lhd2caul',
      name: { th: 'ตรงข้ามมหาวิทยาลัย', en: 'Opposite MFU' },
      description: null,
      sortOrder: 1,
    },
  ],
  foodTypes: [
    {
      slug: 'rice-dishes',
      id: 'cbdllxmb0sv247maiq26k5r9k',
      name: { th: 'เมนูข้าว', en: 'Rice Dishes' },
      icon: 'rice',
      sortOrder: 1,
    },
    {
      slug: 'drinks',
      id: 'cadltxfkvjsge344dwv8j1aph',
      name: { th: 'เครื่องดื่ม', en: 'Drinks' },
      icon: 'coffee',
      sortOrder: 2,
      hidden: true,
    },
  ],
  tastes: [
    {
      slug: 'spicy',
      id: 'c12yme2yu2wne82ugvfce7wfw',
      name: { th: 'เผ็ด', en: 'Spicy' },
      icon: 'flame',
      sortOrder: 1,
    },
    {
      slug: 'sweet',
      id: 'c1ivcbf1u7lzz9hc5hyikrebb',
      name: { th: 'หวาน', en: 'Sweet' },
      icon: 'cake',
      sortOrder: 2,
    },
  ],
}

function restaurant(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'krua-pa-noi',
    zone: 'opposite-mfu',
    name: { th: 'ครัวป้าน้อย', en: 'Krua Pa Noi' },
    description: null,
    source: {
      type: 'grab-screenshot',
      capturedOn: '2026-10-22',
      pricesInclude: 'grab-delivery-markup',
    },
    menuItems: [
      {
        slug: 'pad-kra-pao-moo',
        name: { th: 'ผัดกะเพราหมู', en: 'Stir-fried Pork with Holy Basil' },
        description: { th: 'กะเพราหมูสับรสจัด', en: 'Spicy basil pork.' },
        price: 60,
        foodType: 'rice-dishes',
        tastes: ['spicy'],
        review: null as string | null,
      },
      {
        slug: 'thai-milk-tea',
        name: { th: 'ชาไทย', en: 'Thai Milk Tea' },
        description: null,
        price: 35,
        foodType: 'drinks',
        tastes: ['sweet'],
        review: null as string | null,
      },
    ],
    ...overrides,
  }
}

const file = (data: unknown, name = 'krua-pa-noi'): RestaurantFile => ({
  file: `restaurants/${name}.json`,
  data,
})

function problemsOf(run: () => unknown) {
  try {
    run()
  } catch (error) {
    if (error instanceof CatalogBuildError) return error.problems
    throw error
  }
  throw new Error('Expected the build to fail.')
}

describe('stable IDs and image keys', () => {
  it('derives the same CUID-shaped ID from the same slug every time', () => {
    const id = stableId('menu:krua-pa-noi/pad-kra-pao-moo')

    expect(id).toMatch(/^c[a-z0-9]{24}$/)
    expect(stableId('menu:krua-pa-noi/pad-kra-pao-moo')).toBe(id)
    expect(stableId('menu:krua-pa-noi/pad-see-ew')).not.toBe(id)
  })

  it('derives a valid upload key that keeps the photo file type', () => {
    for (const asset of ['a/menus/b.png', 'a/menus/b.jpg', 'a/logo.webp']) {
      const key = stableImageKey(asset)
      expect(uploadFileNameSchema.safeParse(key).success, key).toBe(true)
      expect(key.endsWith(asset.slice(asset.lastIndexOf('.')))).toBe(true)
      expect(stableImageKey(asset)).toBe(key)
    }
  })
})

describe('buildCatalog', () => {
  it('flattens a nested restaurant into seed records with slug-derived IDs', () => {
    const { seed, report } = buildCatalog({
      taxonomy,
      restaurants: [file(restaurant())],
      photos: new Set(),
    })

    const restaurantId = stableId('restaurant:krua-pa-noi')
    expect(seed.restaurants).toEqual([
      {
        id: restaurantId,
        zoneId: 'c8gds70havtzwmks5lhd2caul',
        googlePlaceId: null,
        name: { th: 'ครัวป้าน้อย', en: 'Krua Pa Noi' },
        description: null,
        phone: null,
        imageUrl: null,
      },
    ])
    expect(seed.menuItems).toEqual([
      {
        id: stableId('menu:krua-pa-noi/pad-kra-pao-moo'),
        restaurantId,
        foodTypeId: 'cbdllxmb0sv247maiq26k5r9k',
        name: { th: 'ผัดกะเพราหมู', en: 'Stir-fried Pork with Holy Basil' },
        description: { th: 'กะเพราหมูสับรสจัด', en: 'Spicy basil pork.' },
        price: 60,
        imageUrl: null,
        tasteIds: ['c12yme2yu2wne82ugvfce7wfw'],
      },
    ])
    expect(report).toMatchObject({
      restaurants: 1,
      menuItems: 1,
      hiddenMenuItems: 1,
    })
  })

  it('keeps hidden food types and their dishes out of the seed', () => {
    const { seed, checklist } = buildCatalog({
      taxonomy,
      restaurants: [
        file(restaurant()),
        file(
          restaurant({
            slug: 'cha-yen-corner',
            menuItems: [restaurant().menuItems[1]],
          }),
          'cha-yen-corner',
        ),
      ],
      photos: new Set(),
    })

    expect(seed.foodTypes.map(({ id }) => id)).toEqual([
      'cbdllxmb0sv247maiq26k5r9k',
    ])
    expect(seed.menuItems.map(({ name }) => name.en)).toEqual([
      'Stir-fried Pork with Holy Basil',
    ])
    // A restaurant with only hidden dishes would offer nothing, so it waits too.
    expect(seed.restaurants.map(({ name }) => name.en)).toEqual(['Krua Pa Noi'])
    expect(
      checklist
        .filter(({ status }) => status === 'hidden')
        .map((row) => row.menuItem),
    ).toEqual(['thai-milk-tea', 'thai-milk-tea'])
  })

  it('attaches photos found by file name and reports the rest', () => {
    const { seed, checklist, report } = buildCatalog({
      taxonomy,
      restaurants: [file(restaurant())],
      photos: new Set([
        'krua-pa-noi/logo.jpg',
        'krua-pa-noi/menus/pad-kra-pao-moo.webp',
        'krua-pa-noi/menus/pad-kra-pao-mu.png',
        'README.md',
      ]),
    })

    expect(seed.restaurants[0]!.image).toEqual({
      asset: 'krua-pa-noi/logo.jpg',
      key: stableImageKey('krua-pa-noi/logo.jpg'),
    })
    expect(seed.menuItems[0]!.image).toEqual({
      asset: 'krua-pa-noi/menus/pad-kra-pao-moo.webp',
      key: stableImageKey('krua-pa-noi/menus/pad-kra-pao-moo.webp'),
    })
    expect(checklist[0]).toMatchObject({
      expectedPath: 'assets/catalog/krua-pa-noi/menus/pad-kra-pao-moo.webp',
      status: 'found',
    })
    expect(report.photosFound).toBe(1)
    // A misspelled file name is reported instead of silently ignored.
    expect(report.unmatchedPhotos).toEqual([
      'krua-pa-noi/menus/pad-kra-pao-mu.png',
    ])
  })

  it('lists the expected photo path for a dish without one', () => {
    const { seed, checklist, report } = buildCatalog({
      taxonomy,
      restaurants: [file(restaurant())],
      photos: new Set(),
    })

    expect(seed.menuItems[0]).not.toHaveProperty('image')
    expect(checklist[0]).toMatchObject({
      expectedPath: 'assets/catalog/krua-pa-noi/menus/pad-kra-pao-moo.png',
      status: 'missing',
    })
    expect(report.photosMissing).toBe(1)
  })

  it('names the file and field of every problem', () => {
    const broken = restaurant({ zone: 'moon' })
    broken.menuItems[0] = {
      ...broken.menuItems[0]!,
      foodType: 'soups',
      tastes: ['spicy', 'umami', 'spicy'],
    }
    broken.menuItems[1] = { ...broken.menuItems[0], tastes: ['spicy'] }

    expect(
      problemsOf(() =>
        buildCatalog({
          taxonomy,
          restaurants: [file(broken, 'wrong-name')],
          photos: new Set(),
        }),
      ),
    ).toEqual([
      'restaurants/wrong-name.json: slug: must match the file name ("krua-pa-noi.json")',
      'restaurants/wrong-name.json: zone: unknown zone "moon"',
      'restaurants/wrong-name.json: menuItems.0 (pad-kra-pao-moo): foodType: unknown food type "soups"',
      'restaurants/wrong-name.json: menuItems.0 (pad-kra-pao-moo): tastes: unknown taste "umami"',
      'restaurants/wrong-name.json: menuItems.0 (pad-kra-pao-moo): tastes: duplicate taste "spicy"',
      'restaurants/wrong-name.json: menuItems.1 (pad-kra-pao-moo): duplicate menu slug',
      'restaurants/wrong-name.json: menuItems.1 (pad-kra-pao-moo): foodType: unknown food type "soups"',
    ])
  })

  it.each([
    ['a zero price', { price: 0 }, 'menuItems.0.price'],
    [
      'a missing English name',
      { name: { th: 'ข้าว', en: '' } },
      'menuItems.0.name.en',
    ],
    ['a non-kebab slug', { slug: 'Pad Kra Pao' }, 'menuItems.0.slug'],
    [
      'an unknown field',
      { imageUrl: 'https://grab.example/a.jpg' },
      'menuItems.0: Unrecognized key: "imageUrl"',
    ],
  ])('rejects %s with its path', (_case, change, field) => {
    const data = restaurant()
    data.menuItems[0] = { ...data.menuItems[0]!, ...change }

    const problems = problemsOf(() =>
      buildCatalog({ taxonomy, restaurants: [file(data)], photos: new Set() }),
    )
    expect(
      problems.some((problem) => problem.includes(field)),
      problems.join('\n'),
    ).toBe(true)
    expect(
      problems.every((problem) =>
        problem.startsWith('restaurants/krua-pa-noi.json'),
      ),
    ).toBe(true)
  })

  it('rejects the retired ownerConsent source field', () => {
    const data = restaurant()
    ;(data.source as unknown as Record<string, unknown>).ownerConsent = {
      given: false,
      by: null,
      on: null,
    }

    expect(
      problemsOf(() =>
        buildCatalog({
          taxonomy,
          restaurants: [file(data)],
          photos: new Set(),
        }),
      ),
    ).toEqual([
      'restaurants/krua-pa-noi.json: source: Unrecognized key: "ownerConsent"',
    ])
  })

  it('refuses to build while a review note is open, unless it is a draft', () => {
    const data = restaurant()
    data.menuItems[0] = { ...data.menuItems[0]!, review: 'price unreadable' }
    const input = {
      taxonomy,
      restaurants: [file(data)],
      photos: new Set<string>(),
    }

    expect(problemsOf(() => buildCatalog(input))).toEqual([
      'review note still open: krua-pa-noi/pad-kra-pao-moo: price unreadable',
    ])
    expect(buildCatalog({ ...input, draft: true }).report.reviewNotes).toEqual([
      'krua-pa-noi/pad-kra-pao-moo: price unreadable',
    ])
  })

  it('rejects duplicate restaurant slugs across files', () => {
    expect(
      problemsOf(() =>
        buildCatalog({
          taxonomy,
          restaurants: [file(restaurant()), file(restaurant())],
          photos: new Set(),
        }),
      ),
    ).toEqual([
      'restaurants/krua-pa-noi.json: slug: duplicate restaurant slug "krua-pa-noi"',
    ])
  })
})

const stock = (id: number) => ({
  url: `https://images.unsplash.com/photo-${id}?w=800&q=75&fit=crop&auto=format`,
  unsplashId: `id${id}`,
  photographer: `Photographer ${id}`,
  photographerUrl: `https://unsplash.com/@p${id}?utm_source=kinraidee&utm_medium=referral`,
  pageUrl: `https://unsplash.com/photos/id${id}?utm_source=kinraidee&utm_medium=referral`,
})

function withPhoto(
  slug: string,
  photo: string,
  extra: Record<string, unknown> = {},
) {
  const data = restaurant({ slug, ...extra })
  data.menuItems = data.menuItems.map((item) => ({ ...item, photo }))
  return file(data, slug)
}

describe('stock photo pools', () => {
  const pools = {
    'pad-kra-pao': { query: 'pad kra pao', photos: [stock(1), stock(2)] },
  }

  it('gives each restaurant its own fixed photo from the pool and wraps after it', () => {
    const run = () =>
      buildCatalog({
        taxonomy,
        restaurants: [
          withPhoto('c-shop', 'pad-kra-pao'),
          withPhoto('a-shop', 'pad-kra-pao'),
          withPhoto('b-shop', 'pad-kra-pao'),
        ],
        photos: new Set(),
        photoPools: pools,
      })
    const urlOf = (seed: ReturnType<typeof run>['seed'], shop: string) =>
      seed.menuItems.find(
        ({ restaurantId }) => restaurantId === stableId(`restaurant:${shop}`),
      )!.imageUrl

    const { seed } = run()
    expect(urlOf(seed, 'a-shop')).toBe(stock(1).url)
    expect(urlOf(seed, 'b-shop')).toBe(stock(2).url)
    expect(urlOf(seed, 'c-shop')).toBe(stock(1).url)
    // The same input always gives the same photos.
    expect(run().seed).toEqual(seed)
  })

  it('gives one restaurant’s dishes with the same key (size variants) one photo', () => {
    const base = restaurant()
    const data = {
      ...base,
      menuItems: ['kra-pao-m', 'kra-pao-l'].map((slug) => ({
        ...base.menuItems[0]!,
        slug,
        photo: 'pad-kra-pao',
      })),
    }
    const { seed } = buildCatalog({
      taxonomy,
      restaurants: [file(data)],
      photos: new Set(),
      photoPools: pools,
    })
    expect(seed.menuItems.map(({ imageUrl }) => imageUrl)).toEqual([
      stock(1).url,
      stock(1).url,
    ])
  })

  it('lets a dish’s own photo file win over the pool', () => {
    const { seed, checklist } = buildCatalog({
      taxonomy,
      restaurants: [withPhoto('krua-pa-noi', 'pad-kra-pao')],
      photos: new Set(['krua-pa-noi/menus/pad-kra-pao-moo.jpg']),
      photoPools: pools,
    })
    expect(seed.menuItems[0]).toMatchObject({
      imageUrl: null,
      image: { asset: 'krua-pa-noi/menus/pad-kra-pao-moo.jpg' },
    })
    expect(checklist[0]).toMatchObject({
      photoKey: 'pad-kra-pao',
      photoSource: 'local',
    })
  })

  it('reports keys without a pool, empty pools, and unused pools', () => {
    const { seed, report, checklist } = buildCatalog({
      taxonomy,
      restaurants: [
        withPhoto('a-shop', 'no-pool-yet'),
        withPhoto('b-shop', 'no-match'),
      ],
      photos: new Set(),
      photoPools: { ...pools, 'no-match': { query: 'x', photos: [] } },
    })
    expect(seed.menuItems.every(({ imageUrl }) => imageUrl === null)).toBe(true)
    expect(report).toMatchObject({
      stockPhotos: 0,
      keysWithoutPool: ['no-pool-yet'],
      keysWithoutStockMatch: ['no-match'],
      unusedPools: ['pad-kra-pao'],
    })
    expect(checklist[0]!.photoSource).toBe('none')
  })

  it.each([
    [
      'a non-Unsplash link',
      { ...stock(1), url: 'https://example.com/a.jpg' },
      'url',
    ],
    [
      'a missing photographer',
      { ...stock(1), photographer: '' },
      'photographer',
    ],
  ])('rejects %s in photos.json', (_case, photo, field) => {
    const problems = problemsOf(() =>
      buildCatalog({
        taxonomy,
        restaurants: [file(restaurant())],
        photos: new Set(),
        photoPools: { 'pad-kra-pao': { query: 'q', photos: [photo] } },
      }),
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toMatch(
      new RegExp(`^photos.json: pad-kra-pao.photos.0.${field}:`),
    )
  })

  it('rejects a pool of more than five photos', () => {
    const problems = problemsOf(() =>
      buildCatalog({
        taxonomy,
        restaurants: [file(restaurant())],
        photos: new Set(),
        photoPools: {
          'pad-kra-pao': { query: 'q', photos: [1, 2, 3, 4, 5, 6].map(stock) },
        },
      }),
    )
    expect(problems[0]).toMatch(/^photos.json: pad-kra-pao.photos:/)
  })

  it('credits every stock photo a visible dish uses', () => {
    const result = buildCatalog({
      taxonomy,
      restaurants: [withPhoto('a-shop', 'pad-kra-pao')],
      photos: new Set(),
      photoPools: pools,
    })
    const credits = serializeCredits(pools, result.checklist)
    expect(credits).toContain(
      '| pad-kra-pao | [Photographer 1](https://unsplash.com/@p1?utm_source=kinraidee&utm_medium=referral) |',
    )
    expect(credits).toContain(
      '[Unsplash](https://unsplash.com/?utm_source=kinraidee&utm_medium=referral)',
    )
  })
})

describe('Creative Commons photos', () => {
  const commons = {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/P.jpg/800px-P.jpg',
    openverseId: 'f808ad9e-4b19-4f06-b26a-98edc5551243',
    source: 'wikimedia' as const,
    title: 'Pad see ew',
    creator: 'stu|spivack',
    creatorUrl: null,
    license: 'by-sa' as const,
    licenseVersion: '2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    pageUrl: 'https://commons.wikimedia.org/w/index.php?curid=2923094',
  }
  const pools = {
    'pad-kra-pao': { query: 'pad see ew', photos: [commons, stock(1)] },
  }

  it('accepts a pool mixing Unsplash and Creative Commons photos and credits both', () => {
    const result = buildCatalog({
      taxonomy,
      restaurants: [withPhoto('a-shop', 'pad-kra-pao')],
      photos: new Set(),
      photoPools: pools,
    })
    expect(result.seed.menuItems[0]!.imageUrl).toBe(commons.url)
    const credits = serializeCredits(pools, result.checklist)
    expect(credits).toContain(
      '| pad-kra-pao | stu\\|spivack | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=2923094) |',
    )
    expect(JSON.parse(serializeWebCredits(pools, result.checklist))).toEqual({
      [commons.url]: {
        creator: 'stu|spivack',
        license: 'CC BY-SA 2.0',
        pageUrl: commons.pageUrl,
        source: 'Wikimedia Commons',
      },
      [stock(1).url]: {
        creator: 'Photographer 1',
        license: 'Unsplash License',
        pageUrl: stock(1).pageUrl,
        source: 'Unsplash',
      },
    })
  })

  it.each([
    ['another host', { url: 'https://example.com/p.jpg' }],
    ['a licence that forbids changes', { license: 'by-nd' }],
  ])('rejects %s', (_case, change) => {
    const problems = problemsOf(() =>
      buildCatalog({
        taxonomy,
        restaurants: [file(restaurant())],
        photos: new Set(),
        photoPools: {
          'pad-kra-pao': { query: 'q', photos: [{ ...commons, ...change }] },
        },
      }),
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toMatch(/^photos\.json: pad-kra-pao\.photos\.0/)
  })
})

describe('photo checklist', () => {
  it('quotes cells with commas or quotes and starts with a UTF-8 byte-order mark', () => {
    const text = serializeChecklist([
      {
        restaurant: 'a',
        menuItem: 'b',
        nameTh: 'ข้าว, ไข่',
        nameEn: 'Rice "special"',
        foodType: 'rice-dishes',
        expectedPath: 'assets/catalog/a/menus/b.png',
        status: 'missing',
        photoKey: 'b',
        photoSource: 'none',
      },
    ])

    expect(text.startsWith('\uFEFFrestaurant,menuItem,')).toBe(true)
    expect(text).toContain('"ข้าว, ไข่","Rice ""special"""')
  })
})

describe('committed catalog source', () => {
  it('keeps the existing taxonomy IDs so saved preferences keep working', async () => {
    const { taxonomy: source } = await readCatalogSource()
    const archived = JSON.parse(
      await readFile(
        new URL('./data/archive/catalog.seed.2026-10-06.json', import.meta.url),
        'utf8',
      ),
    ) as Record<'zones' | 'foodTypes' | 'tastes', { id: string }[]>
    const current = source as typeof archived

    for (const key of ['zones', 'foodTypes', 'tastes'] as const) {
      const ids = new Set(current[key].map(({ id }) => id))
      for (const { id } of archived[key])
        expect(ids.has(id), `${key} ${id}`).toBe(true)
    }
  })

  it('writes the seed and checklist, and --check notices a stale seed', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'kinraidee-catalog-'))
    const seedPath = path.join(directory, 'catalog.seed.json')
    const checklistPath = path.join(directory, 'photo-checklist.csv')
    const creditsPath = path.join(directory, 'PHOTO-CREDITS.md')
    const webCreditsPath = path.join(directory, 'photoCredits.json')
    const options = {
      seedPath,
      checklistPath,
      creditsPath,
      webCreditsPath,
      write: () => {},
    }
    try {
      await runCatalogBuild(options)
      expect(await readFile(checklistPath, 'utf8')).toMatch(
        /^\uFEFFrestaurant,/,
      )
      await expect(
        runCatalogBuild({ ...options, check: true }),
      ).resolves.toBeDefined()

      await writeFile(webCreditsPath, '{"stale": true}')
      await expect(
        runCatalogBuild({ ...options, check: true }),
      ).rejects.toThrow('photoCredits.json is out of date')
      await runCatalogBuild(options)

      await writeFile(seedPath, '{}')
      await expect(
        runCatalogBuild({ ...options, check: true }),
      ).rejects.toThrow('catalog.seed.json is out of date')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('builds cleanly and matches the generated catalog.seed.json', async () => {
    await expect(
      runCatalogBuild({ check: true, write: () => {} }),
    ).resolves.toBeDefined()
  })
})
