import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { z } from 'zod'

import { catalogAssetsDirectory } from './catalog-seed'
import { catalogSeedSchema, type CatalogSeed } from './seedSchemas'

// Builds `data/catalog.seed.json` from the readable per-restaurant source in `data/catalog/`.
// The generated file keeps the flat shape `catalog-seed.ts` already seeds, so the seed,
// database, and API stay unchanged.

const dataDirectory = fileURLToPath(new URL('./data/', import.meta.url))
export const catalogSourceDirectory = path.join(dataDirectory, 'catalog')
export const generatedSeedPath = path.join(dataDirectory, 'catalog.seed.json')
export const photoChecklistPath = path.join(
  catalogAssetsDirectory,
  'photo-checklist.csv',
)
// Per-photo credits the web app shows under Creative Commons photos.
export const webPhotoCreditsPath = fileURLToPath(
  new URL('../../web/src/generated/photoCredits.json', import.meta.url),
)
export const photoCreditsPath = path.join(
  catalogAssetsDirectory,
  'PHOTO-CREDITS.md',
)

const PHOTO_EXTENSIONS = ['png', 'jpg', 'webp'] as const
// `_archive/` holds the retired starter catalog; the build never reads it.
const IGNORED_ASSET_DIRECTORIES = new Set(['_archive'])

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase-kebab slug.')
const cuidSchema = z.string().regex(/^c[a-z0-9]{24}$/, 'Expected a CUID.')
const textSchema = z.string().trim().min(1)
const localizedSchema = z.strictObject({ th: textSchema, en: textSchema })
const optionalLocalizedSchema = z
  .strictObject({ th: textSchema.optional(), en: textSchema.optional() })
  .nullable()
  .default(null)

const taxonomyRecordSchema = z.strictObject({
  slug: slugSchema,
  id: cuidSchema,
  name: localizedSchema,
  sortOrder: z.number().int().nonnegative(),
})

export const taxonomySourceSchema = z.strictObject({
  zones: z.array(
    taxonomyRecordSchema.extend({ description: optionalLocalizedSchema }),
  ),
  foodTypes: z.array(
    taxonomyRecordSchema.extend({
      icon: textSchema.nullable(),
      // Stored in the source but left out of the generated seed and the app.
      hidden: z.boolean().optional(),
    }),
  ),
  tastes: z.array(taxonomyRecordSchema.extend({ icon: textSchema.nullable() })),
})

const menuItemSourceSchema = z.strictObject({
  slug: slugSchema,
  name: localizedSchema,
  description: optionalLocalizedSchema,
  price: z.number().int().positive(),
  foodType: slugSchema,
  tastes: z.array(slugSchema).min(1),
  // Something unclear in the source, such as an unreadable price. Blocks the build.
  review: z.string().trim().min(1).nullable().default(null),
  // The dish-name key of its photo pool in photos.json. Dishes with the same name at
  // different restaurants share a key; carbonara and bolognese do not.
  photo: slugSchema.optional(),
})

export const restaurantSourceSchema = z.strictObject({
  slug: slugSchema,
  zone: slugSchema,
  name: localizedSchema,
  description: optionalLocalizedSchema,
  phone: z
    .string()
    .regex(/^\d{9,10}$/)
    .nullable()
    .default(null),
  source: z.strictObject({
    type: z.enum(['grab-screenshot', 'lineman-screenshot', 'owner', 'admin']),
    capturedOn: z.iso.date(),
    pricesInclude: z
      .enum(['in-store', 'grab-delivery-markup', 'lineman-delivery-markup'])
      .optional(),
  }),
  menuItems: z.array(menuItemSourceSchema).min(1),
})

// Approved stock photos per dish-name key, with provider metadata and attribution.
// An empty pool records that stock photos have no good match.
// Unsplash asks that links to photographers and to Unsplash carry referral parameters.
export function unsplashCreditUrl(link: string) {
  const url = new URL(link)
  url.searchParams.set('utm_source', 'kinraidee')
  url.searchParams.set('utm_medium', 'referral')
  return url.toString()
}

const unsplashPhotoSchema = z.strictObject({
  url: z
    .url()
    .refine(
      (value) => value.startsWith('https://images.unsplash.com/'),
      'Expected an https://images.unsplash.com/ photo link.',
    ),
  unsplashId: textSchema,
  photographer: textSchema,
  photographerUrl: z.url(),
  pageUrl: z.url(),
})

// A Creative Commons photo found through Openverse, hotlinked from Wikimedia Commons or
// Flickr. Only licences allowing commercial use and changes (cropping) are searched, and
// each photo is credited with its creator and licence.
const OPENVERSE_IMAGE_HOSTS = [
  'https://upload.wikimedia.org/',
  'https://live.staticflickr.com/',
]

const openversePhotoSchema = z.strictObject({
  url: z
    .url()
    .refine(
      (value) => OPENVERSE_IMAGE_HOSTS.some((host) => value.startsWith(host)),
      'Expected an https://upload.wikimedia.org/ or https://live.staticflickr.com/ photo link.',
    ),
  openverseId: z.uuid(),
  source: z.enum(['wikimedia', 'flickr']),
  title: textSchema,
  creator: textSchema,
  creatorUrl: z.url().nullable(),
  license: z.enum(['cc0', 'pdm', 'by', 'by-sa']),
  licenseVersion: z.string().nullable(),
  licenseUrl: z.url(),
  pageUrl: z.url(),
})

// Manually reviewed free Pexels photos retain their native IDs and source credit.
const pexelsPhotoSchema = z
  .strictObject({
    url: z.url().startsWith('https://images.pexels.com/'),
    pexelsId: z.string().regex(/^\d+$/),
    title: textSchema,
    photographer: textSchema,
    photographerUrl: z.url().startsWith('https://www.pexels.com/'),
    pageUrl: z.url().startsWith('https://www.pexels.com/photo/'),
  })
  .refine(
    (photo) =>
      photo.url.startsWith(
        `https://images.pexels.com/photos/${photo.pexelsId}/`,
      ) && photo.pageUrl.split(/[?#]/)[0]!.endsWith(`-${photo.pexelsId}/`),
    'Pexels image and source URLs must match the photo ID.',
  )

const stockPhotoSchema = z.union([
  unsplashPhotoSchema,
  openversePhotoSchema,
  pexelsPhotoSchema,
])
export type StockPhoto = z.infer<typeof stockPhotoSchema>

export const photoPoolsSchema = z.record(
  slugSchema,
  z.strictObject({
    query: textSchema,
    photos: z.array(stockPhotoSchema).max(5),
  }),
)

// One credit shape for all providers: creator, licence, and original source.
export function photoCredit(photo: StockPhoto) {
  if ('pexelsId' in photo) {
    return {
      creator: photo.photographer,
      creatorUrl: photo.photographerUrl,
      license: 'Pexels License',
      licenseUrl: 'https://www.pexels.com/license/',
      pageUrl: photo.pageUrl,
      source: 'Pexels',
    }
  }
  if ('unsplashId' in photo) {
    return {
      creator: photo.photographer,
      creatorUrl: photo.photographerUrl,
      license: 'Unsplash License',
      licenseUrl: 'https://unsplash.com/license',
      pageUrl: photo.pageUrl,
      source: 'Unsplash',
    }
  }
  const license =
    photo.license === 'cc0'
      ? 'CC0'
      : photo.license === 'pdm'
        ? 'Public Domain'
        : `CC ${photo.license.toUpperCase()}${photo.licenseVersion ? ` ${photo.licenseVersion}` : ''}`
  return {
    creator: photo.creator,
    creatorUrl: photo.creatorUrl,
    license,
    licenseUrl: photo.licenseUrl,
    pageUrl: photo.pageUrl,
    source: photo.source === 'wikimedia' ? 'Wikimedia Commons' : 'Flickr',
  }
}

export type PhotoPools = z.infer<typeof photoPoolsSchema>
export type TaxonomySource = z.infer<typeof taxonomySourceSchema>
export type RestaurantSource = z.infer<typeof restaurantSourceSchema>
export type RestaurantFile = { file: string; data: unknown }

export class CatalogBuildError extends Error {
  constructor(readonly problems: string[]) {
    super(
      `Catalog build failed:\n${problems.map((p) => `  - ${p}`).join('\n')}`,
    )
  }
}

function hashDigits(seed: string) {
  return BigInt(`0x${createHash('sha256').update(seed).digest('hex')}`)
}

// A CUID-shaped ID derived from a slug, so the same slug always gives the same ID.
export function stableId(seed: string) {
  let value = hashDigits(seed)
  let id = ''
  for (let index = 0; index < 24; index += 1) {
    id += (value % 36n).toString(36)
    value /= 36n
  }
  return `c${id}`
}

// A UUID-v4-shaped upload key derived from the photo path, keeping its file type.
export function stableImageKey(asset: string) {
  const hex = createHash('sha256').update(`image:${asset}`).digest('hex')
  const variant = '89ab'[Number.parseInt(hex[16]!, 16) % 4]
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`
  return `${uuid}${asset.slice(asset.lastIndexOf('.'))}`
}

function zodProblems(file: string, error: z.ZodError) {
  return error.issues.map(
    (issue) => `${file}: ${issue.path.join('.') || '(root)'}: ${issue.message}`,
  )
}

export type PhotoChecklistRow = {
  restaurant: string
  menuItem: string
  nameTh: string
  nameEn: string
  foodType: string
  expectedPath: string
  status: 'found' | 'missing' | 'hidden'
  photoKey: string
  // Where the dish's photo comes from: its own file, its stock pool, or nowhere yet.
  photoSource: 'local' | 'stock' | 'none'
}

export type CatalogBuildResult = {
  seed: CatalogSeed
  checklist: PhotoChecklistRow[]
  report: {
    restaurants: number
    menuItems: number
    hiddenMenuItems: number
    photosFound: number
    photosMissing: number
    unmatchedPhotos: string[]
    reviewNotes: string[]
    stockPhotos: number
    // Keys no pool has yet, keys whose pool is empty (no stock match), and pools no dish uses.
    keysWithoutPool: string[]
    keysWithoutStockMatch: string[]
    unusedPools: string[]
  }
}

// `photos` holds every file under assets/catalog as a forward-slash relative path.
export function buildCatalog({
  taxonomy: rawTaxonomy,
  restaurants: restaurantFiles,
  photos,
  photoPools: rawPhotoPools = {},
  draft = false,
}: {
  taxonomy: unknown
  restaurants: RestaurantFile[]
  photos: Set<string>
  photoPools?: unknown
  draft?: boolean
}): CatalogBuildResult {
  const problems: string[] = []

  const poolResult = photoPoolsSchema.safeParse(rawPhotoPools)
  if (!poolResult.success) {
    throw new CatalogBuildError(zodProblems('photos.json', poolResult.error))
  }
  const photoPools = poolResult.data

  const taxonomyResult = taxonomySourceSchema.safeParse(rawTaxonomy)
  if (!taxonomyResult.success) {
    throw new CatalogBuildError(
      zodProblems('taxonomy.json', taxonomyResult.error),
    )
  }
  const taxonomy = taxonomyResult.data

  for (const key of ['zones', 'foodTypes', 'tastes'] as const) {
    const seen = new Set<string>()
    for (const { slug } of taxonomy[key]) {
      if (seen.has(slug))
        problems.push(`taxonomy.json: ${key}: duplicate slug "${slug}"`)
      seen.add(slug)
    }
  }

  const zoneBySlug = new Map(taxonomy.zones.map((zone) => [zone.slug, zone]))
  const foodTypeBySlug = new Map(
    taxonomy.foodTypes.map((foodType) => [foodType.slug, foodType]),
  )
  const tasteBySlug = new Map(
    taxonomy.tastes.map((taste) => [taste.slug, taste]),
  )

  const restaurants: RestaurantSource[] = []
  const restaurantSlugs = new Set<string>()
  for (const { file, data } of restaurantFiles) {
    const result = restaurantSourceSchema.safeParse(data)
    if (!result.success) {
      problems.push(...zodProblems(file, result.error))
      continue
    }
    const restaurant = result.data
    if (`${restaurant.slug}.json` !== path.basename(file)) {
      problems.push(
        `${file}: slug: must match the file name ("${restaurant.slug}.json")`,
      )
    }
    if (restaurantSlugs.has(restaurant.slug)) {
      problems.push(
        `${file}: slug: duplicate restaurant slug "${restaurant.slug}"`,
      )
    }
    restaurantSlugs.add(restaurant.slug)
    if (!zoneBySlug.has(restaurant.zone)) {
      problems.push(`${file}: zone: unknown zone "${restaurant.zone}"`)
    }

    const menuSlugs = new Set<string>()
    restaurant.menuItems.forEach((menuItem, index) => {
      const at = `${file}: menuItems.${index} (${menuItem.slug})`
      if (menuSlugs.has(menuItem.slug))
        problems.push(`${at}: duplicate menu slug`)
      menuSlugs.add(menuItem.slug)
      if (!foodTypeBySlug.has(menuItem.foodType)) {
        problems.push(
          `${at}: foodType: unknown food type "${menuItem.foodType}"`,
        )
      }
      const tastes = new Set<string>()
      for (const taste of menuItem.tastes) {
        if (!tasteBySlug.has(taste))
          problems.push(`${at}: tastes: unknown taste "${taste}"`)
        if (tastes.has(taste))
          problems.push(`${at}: tastes: duplicate taste "${taste}"`)
        tastes.add(taste)
      }
    })
    restaurants.push(restaurant)
  }

  if (problems.length > 0) throw new CatalogBuildError(problems)

  const reviewNotes = restaurants.flatMap((restaurant) =>
    restaurant.menuItems.flatMap((menuItem) =>
      menuItem.review
        ? [`${restaurant.slug}/${menuItem.slug}: ${menuItem.review}`]
        : [],
    ),
  )
  if (reviewNotes.length > 0 && !draft) {
    throw new CatalogBuildError(
      reviewNotes.map((note) => `review note still open: ${note}`),
    )
  }

  const findPhoto = (base: string) => {
    for (const extension of PHOTO_EXTENSIONS) {
      if (photos.has(`${base}.${extension}`)) return `${base}.${extension}`
    }
    return null
  }
  const imageFor = (asset: string | null) =>
    asset ? { image: { asset, key: stableImageKey(asset) } } : {}

  // Each restaurant using a key gets its own fixed photo from the pool, in restaurant-slug
  // order, so the same dish at two shops looks different and never changes on a rebuild.
  const restaurantsByKey = new Map<string, string[]>()
  for (const restaurant of [...restaurants].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  )) {
    for (const { photo } of restaurant.menuItems) {
      if (!photo) continue
      const users = restaurantsByKey.get(photo) ?? []
      if (!users.includes(restaurant.slug)) users.push(restaurant.slug)
      restaurantsByKey.set(photo, users)
    }
  }
  const stockPhotoFor = (restaurantSlug: string, key: string | undefined) => {
    const pool = key ? photoPools[key]?.photos : undefined
    if (!key || !pool || pool.length === 0) return null
    const index = restaurantsByKey.get(key)!.indexOf(restaurantSlug)
    return pool[index % pool.length]!
  }

  const usedPhotos = new Set<string>()
  const checklist: PhotoChecklistRow[] = []
  const seedRestaurants: CatalogSeed['restaurants'] = []
  const seedMenuItems: CatalogSeed['menuItems'] = []
  let hiddenMenuItems = 0

  for (const restaurant of [...restaurants].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  )) {
    const restaurantId = stableId(`restaurant:${restaurant.slug}`)
    const logo = findPhoto(`${restaurant.slug}/logo`)
    if (logo) usedPhotos.add(logo)
    const visibleItems = restaurant.menuItems.filter(
      (menuItem) => !foodTypeBySlug.get(menuItem.foodType)!.hidden,
    )

    for (const menuItem of restaurant.menuItems) {
      const base = `${restaurant.slug}/menus/${menuItem.slug}`
      const photo = findPhoto(base)
      if (photo) usedPhotos.add(photo)
      const hidden = foodTypeBySlug.get(menuItem.foodType)!.hidden === true
      // A dish's own file, such as an owner's real photo, wins over the stock pool.
      const stock = photo
        ? null
        : stockPhotoFor(restaurant.slug, menuItem.photo)
      checklist.push({
        restaurant: restaurant.slug,
        menuItem: menuItem.slug,
        nameTh: menuItem.name.th,
        nameEn: menuItem.name.en,
        foodType: menuItem.foodType,
        expectedPath: `assets/catalog/${photo ?? `${base}.png`}`,
        status: hidden ? 'hidden' : photo ? 'found' : 'missing',
        photoKey: menuItem.photo ?? '',
        photoSource: photo ? 'local' : stock ? 'stock' : 'none',
      })
      if (hidden) {
        hiddenMenuItems += 1
        continue
      }
      seedMenuItems.push({
        id: stableId(`menu:${restaurant.slug}/${menuItem.slug}`),
        restaurantId,
        foodTypeId: foodTypeBySlug.get(menuItem.foodType)!.id,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        imageUrl: stock?.url ?? null,
        ...imageFor(photo),
        tasteIds: menuItem.tastes.map((taste) => tasteBySlug.get(taste)!.id),
      })
    }

    // A restaurant whose menu is entirely hidden would offer nothing, so it waits too.
    if (visibleItems.length === 0) continue
    seedRestaurants.push({
      id: restaurantId,
      zoneId: zoneBySlug.get(restaurant.zone)!.id,
      name: restaurant.name,
      description: restaurant.description,
      phone: restaurant.phone,
      imageUrl: null,
      ...imageFor(logo),
    })
  }

  const seed = catalogSeedSchema.parse({
    zones: taxonomy.zones.map(({ id, name, description, sortOrder }) => ({
      id,
      name,
      description,
      sortOrder,
    })),
    foodTypes: taxonomy.foodTypes
      .filter(({ hidden }) => !hidden)
      .map(({ id, name, icon, sortOrder }) => ({ id, name, icon, sortOrder })),
    tastes: taxonomy.tastes.map(({ id, name, icon, sortOrder }) => ({
      id,
      name,
      icon,
      sortOrder,
    })),
    restaurants: seedRestaurants,
    menuItems: seedMenuItems,
  })

  const visibleRows = checklist.filter(({ status }) => status !== 'hidden')
  const usedKeys = [...restaurantsByKey.keys()].sort()
  return {
    seed,
    checklist,
    report: {
      restaurants: seedRestaurants.length,
      menuItems: seedMenuItems.length,
      hiddenMenuItems,
      photosFound: visibleRows.filter(({ status }) => status === 'found')
        .length,
      photosMissing: visibleRows.filter(({ status }) => status === 'missing')
        .length,
      unmatchedPhotos: [...photos]
        .filter(
          (photo) =>
            !usedPhotos.has(photo) &&
            PHOTO_EXTENSIONS.some((extension) =>
              photo.endsWith(`.${extension}`),
            ),
        )
        .sort(),
      reviewNotes,
      stockPhotos: visibleRows.filter(
        ({ photoSource }) => photoSource === 'stock',
      ).length,
      keysWithoutPool: usedKeys.filter((key) => !photoPools[key]),
      keysWithoutStockMatch: usedKeys.filter(
        (key) => photoPools[key]?.photos.length === 0,
      ),
      unusedPools: Object.keys(photoPools)
        .filter((key) => !restaurantsByKey.has(key))
        .sort(),
    },
  }
}

export function serializeSeed(seed: CatalogSeed) {
  return `${JSON.stringify(seed, null, 2)}\n`
}

const BYTE_ORDER_MARK = '\uFEFF'

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

export function serializeChecklist(rows: PhotoChecklistRow[]) {
  const header =
    'restaurant,menuItem,nameTh,nameEn,foodType,expectedPath,status,photoKey,photoSource'
  const lines = rows.map((row) =>
    [
      row.restaurant,
      row.menuItem,
      row.nameTh,
      row.nameEn,
      row.foodType,
      row.expectedPath,
      row.status,
      row.photoKey,
      row.photoSource,
    ]
      .map(csvCell)
      .join(','),
  )
  // A byte-order mark lets spreadsheet apps read the Thai names as UTF-8.
  return `${BYTE_ORDER_MARK}${[header, ...lines].join('\n')}\n`
}

async function listPhotos(directory: string) {
  const photos = new Set<string>()
  const walk = async (relative: string) => {
    const entries = await readdir(path.join(directory, relative), {
      withFileTypes: true,
    })
    for (const entry of entries) {
      const child = relative ? `${relative}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (!relative && IGNORED_ASSET_DIRECTORIES.has(entry.name)) continue
        await walk(child)
      } else {
        photos.add(child)
      }
    }
  }
  await walk('')
  return photos
}

export async function readCatalogSource(
  sourceDirectory = catalogSourceDirectory,
) {
  const taxonomy = JSON.parse(
    await readFile(path.join(sourceDirectory, 'taxonomy.json'), 'utf8'),
  ) as unknown
  const restaurantDirectory = path.join(sourceDirectory, 'restaurants')
  const names = (await readdir(restaurantDirectory))
    .filter((name) => name.endsWith('.json'))
    .sort()
  const restaurants: RestaurantFile[] = []
  for (const name of names) {
    const file = `restaurants/${name}`
    const text = await readFile(path.join(restaurantDirectory, name), 'utf8')
    try {
      restaurants.push({ file, data: JSON.parse(text) as unknown })
    } catch (error) {
      throw new CatalogBuildError([
        `${file}: not valid JSON (${(error as Error).message})`,
      ])
    }
  }
  // Photo pools are optional, so a catalog can be built before any photo is chosen.
  const photoPools = JSON.parse(
    await readFile(path.join(sourceDirectory, 'photos.json'), 'utf8').catch(
      () => '{}',
    ),
  ) as unknown
  return { taxonomy, restaurants, photoPools }
}

// Credits every stock photo a visible dish uses, as the Unsplash guidelines ask.
function creditedPhotos(
  photoPools: PhotoPools,
  checklist: PhotoChecklistRow[],
) {
  const usedKeys = new Set(
    checklist
      .filter(({ photoSource }) => photoSource === 'stock')
      .map(({ photoKey }) => photoKey),
  )
  return [...usedKeys]
    .sort()
    .flatMap((key) => photoPools[key]!.photos.map((photo) => ({ key, photo })))
}

// Credits every stock photo a visible dish uses, as Unsplash and the CC licences ask.
export function serializeCredits(
  photoPools: PhotoPools,
  checklist: PhotoChecklistRow[],
) {
  const cell = (value: string) => value.replaceAll('|', '\\|')
  const lines = creditedPhotos(photoPools, checklist).map(({ key, photo }) => {
    const credit = photoCredit(photo)
    const creator = credit.creatorUrl
      ? `[${cell(credit.creator)}](${credit.creatorUrl})`
      : cell(credit.creator)
    return `| ${key} | ${creator} | [${credit.license}](${credit.licenseUrl}) | [${credit.source}](${credit.pageUrl}) |`
  })
  return [
    '# Catalog photo credits',
    '',
    'Generated by `pnpm --filter api catalog:build` from `src/api/prisma/data/catalog/photos.json`. Dish photos are illustrative stock photos from [Unsplash](https://unsplash.com/?utm_source=kinraidee&utm_medium=referral) (Unsplash License), [Pexels](https://www.pexels.com/license/) (Pexels License), and Wikimedia Commons and Flickr through [Openverse](https://openverse.org) (Creative Commons licences that allow commercial use and changes). They are not photos of each restaurant’s own dish.',
    '',
    '| Dish key | Creator | Licence | Source |',
    '|---|---|---|---|',
    ...lines,
    '',
  ].join('\n')
}

// Per-image credit the web app shows under a photo, keyed by its URL.
export function serializeWebCredits(
  photoPools: PhotoPools,
  checklist: PhotoChecklistRow[],
) {
  const credits = Object.fromEntries(
    creditedPhotos(photoPools, checklist).map(({ photo }) => {
      const { creator, license, pageUrl, source } = photoCredit(photo)
      return [photo.url, { creator, license, pageUrl, source }]
    }),
  )
  return `${JSON.stringify(credits, null, 2)}\n`
}

export async function runCatalogBuild({
  check = false,
  draft = false,
  write = (text: string) => process.stdout.write(text),
  seedPath = generatedSeedPath,
  checklistPath = photoChecklistPath,
  creditsPath = photoCreditsPath,
  webCreditsPath = webPhotoCreditsPath,
}: {
  check?: boolean
  draft?: boolean
  write?: (text: string) => void
  seedPath?: string
  checklistPath?: string
  creditsPath?: string
  webCreditsPath?: string
} = {}) {
  const source = await readCatalogSource()
  const result = buildCatalog({
    ...source,
    photos: await listPhotos(catalogAssetsDirectory),
    draft,
  })
  const seedText = serializeSeed(result.seed)
  const checklistText = serializeChecklist(result.checklist)
  const pools = photoPoolsSchema.parse(source.photoPools)
  const webCreditsText = serializeWebCredits(pools, result.checklist)

  if (check) {
    const stale: string[] = []
    for (const [file, expected, name] of [
      [seedPath, seedText, 'catalog.seed.json'],
      [webCreditsPath, webCreditsText, 'photoCredits.json'],
    ] as const) {
      const current = await readFile(file, 'utf8').catch(() => '')
      if (current.replace(/\r\n/g, '\n') !== expected) stale.push(name)
    }
    if (stale.length > 0) {
      throw new CatalogBuildError(
        stale.map(
          (name) =>
            `${name} is out of date. Run \`pnpm --filter api catalog:build\`.`,
        ),
      )
    }
    write('catalog.seed.json is up to date.\n')
    return result
  }

  await writeFile(seedPath, seedText)
  await writeFile(checklistPath, checklistText)
  await writeFile(creditsPath, serializeCredits(pools, result.checklist))
  await mkdir(path.dirname(webCreditsPath), { recursive: true })
  await writeFile(webCreditsPath, webCreditsText)

  const { report } = result
  write(
    [
      `Built catalog.seed.json: ${report.restaurants} restaurants, ${report.menuItems} menu items (${report.hiddenMenuItems} hidden).`,
      `Photos: ${report.photosFound} found, ${report.photosMissing} missing (see assets/catalog/photo-checklist.csv).`,
      ...report.unmatchedPhotos.map(
        (photo) =>
          `Photo matches no dish or restaurant: assets/catalog/${photo}`,
      ),
      `Stock photos: ${report.stockPhotos} dishes use a reviewed stock photo.`,
      ...report.keysWithoutPool.map(
        (key) => `Photo key has no pool yet: ${key}`,
      ),
      ...report.keysWithoutStockMatch.map(
        (key) => `No stock photo matches this dish: ${key}`,
      ),
      ...report.unusedPools.map((key) => `Photo pool no dish uses: ${key}`),
      ...report.reviewNotes.map((note) => `Review note (draft build): ${note}`),
      '',
    ].join('\n'),
  )
  return result
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const args = new Set(process.argv.slice(2))
  runCatalogBuild({
    check: args.has('--check'),
    draft: args.has('--draft'),
  }).catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    )
    process.exitCode = 1
  })
}
