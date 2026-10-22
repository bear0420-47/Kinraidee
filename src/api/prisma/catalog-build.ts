import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
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
    ownerConsent: z.strictObject({
      given: z.boolean(),
      by: textSchema.nullable(),
      on: z.iso.date().nullable(),
    }),
  }),
  menuItems: z.array(menuItemSourceSchema).min(1),
})

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
  }
}

// `photos` holds every file under assets/catalog as a forward-slash relative path.
export function buildCatalog({
  taxonomy: rawTaxonomy,
  restaurants: restaurantFiles,
  photos,
  draft = false,
}: {
  taxonomy: unknown
  restaurants: RestaurantFile[]
  photos: Set<string>
  draft?: boolean
}): CatalogBuildResult {
  const problems: string[] = []

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
      checklist.push({
        restaurant: restaurant.slug,
        menuItem: menuItem.slug,
        nameTh: menuItem.name.th,
        nameEn: menuItem.name.en,
        foodType: menuItem.foodType,
        expectedPath: `assets/catalog/${photo ?? `${base}.png`}`,
        status: hidden ? 'hidden' : photo ? 'found' : 'missing',
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
        imageUrl: null,
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
    'restaurant,menuItem,nameTh,nameEn,foodType,expectedPath,status'
  const lines = rows.map((row) =>
    [
      row.restaurant,
      row.menuItem,
      row.nameTh,
      row.nameEn,
      row.foodType,
      row.expectedPath,
      row.status,
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
  return { taxonomy, restaurants }
}

export async function runCatalogBuild({
  check = false,
  draft = false,
  write = (text: string) => process.stdout.write(text),
  seedPath = generatedSeedPath,
  checklistPath = photoChecklistPath,
}: {
  check?: boolean
  draft?: boolean
  write?: (text: string) => void
  seedPath?: string
  checklistPath?: string
} = {}) {
  const source = await readCatalogSource()
  const result = buildCatalog({
    ...source,
    photos: await listPhotos(catalogAssetsDirectory),
    draft,
  })
  const seedText = serializeSeed(result.seed)
  const checklistText = serializeChecklist(result.checklist)

  if (check) {
    const current = await readFile(seedPath, 'utf8').catch(() => '')
    if (current.replace(/\r\n/g, '\n') !== seedText) {
      throw new CatalogBuildError([
        'catalog.seed.json is out of date. Run `pnpm --filter api catalog:build`.',
      ])
    }
    write('catalog.seed.json is up to date.\n')
    return result
  }

  await writeFile(seedPath, seedText)
  await writeFile(checklistPath, checklistText)

  const { report } = result
  write(
    [
      `Built catalog.seed.json: ${report.restaurants} restaurants, ${report.menuItems} menu items (${report.hiddenMenuItems} hidden).`,
      `Photos: ${report.photosFound} found, ${report.photosMissing} missing (see assets/catalog/photo-checklist.csv).`,
      ...report.unmatchedPhotos.map(
        (photo) =>
          `Photo matches no dish or restaurant: assets/catalog/${photo}`,
      ),
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
