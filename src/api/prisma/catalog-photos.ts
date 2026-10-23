import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { z } from 'zod'

import {
  catalogSourceDirectory,
  photoPoolsSchema,
  type PhotoPools,
} from './catalog-build'

// Finds stock photos for catalog dishes and records the approved ones in photos.json.
//
//   pnpm --filter api catalog:photos search   query Pexels for every key without a pool
//                                             and write .local/photo-review.html
//   pnpm --filter api catalog:photos apply <selection.json>
//                                             write the picks from the review page
//
// Search terms come from .local/photo-search/queries.json ({ "<key>": "<query>" }). The
// API key is PEXELS_API_KEY in src/api/.env; the running app never uses it.

const apiDirectory = fileURLToPath(new URL('../', import.meta.url))
export const photoSearchDirectory = path.join(
  apiDirectory,
  '.local',
  'photo-search',
)
export const photoReviewPath = path.join(
  apiDirectory,
  '.local',
  'photo-review.html',
)
export const photoPoolsPath = path.join(catalogSourceDirectory, 'photos.json')

const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search'
const RESULTS_PER_QUERY = 12
// The free Pexels API allows 200 requests per hour.
const HOURLY_REQUEST_LIMIT = 190

const pexelsSearchSchema = z.object({
  photos: z.array(
    z.object({
      id: z.number(),
      url: z.url(),
      photographer: z.string(),
      photographer_url: z.url(),
      alt: z.string().nullable().optional(),
      src: z.object({ large: z.url(), medium: z.url() }),
    }),
  ),
})

export type Candidate = {
  pexelsId: number
  url: string
  thumbnail: string
  photographer: string
  photographerUrl: string
  pageUrl: string
  alt: string
}

const selectionSchema = z.record(
  z.string(),
  z.object({
    query: z.string().trim().min(1),
    ids: z.array(z.number()).max(5),
  }),
)

// A landscape CDN rendition small enough for a card, as Pexels recommends linking to.
export function cardImageUrl(large: string) {
  const url = new URL(large)
  url.search = ''
  url.searchParams.set('auto', 'compress')
  url.searchParams.set('cs', 'tinysrgb')
  url.searchParams.set('w', '800')
  return url.toString()
}

export function toCandidates(response: unknown): Candidate[] {
  return pexelsSearchSchema.parse(response).photos.map((photo) => ({
    pexelsId: photo.id,
    url: cardImageUrl(photo.src.large),
    thumbnail: photo.src.medium,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    pageUrl: photo.url,
    alt: photo.alt ?? '',
  }))
}

const cachePath = (key: string, directory: string) =>
  path.join(directory, `${key}.json`)

async function readCached(
  key: string,
  query: string,
  directory = photoSearchDirectory,
) {
  try {
    const cached = JSON.parse(
      await readFile(cachePath(key, directory), 'utf8'),
    ) as {
      query: string
      candidates: Candidate[]
    }
    return cached.query === query ? cached.candidates : null
  } catch {
    return null
  }
}

export async function searchPhotos({
  queries,
  pools,
  apiKey,
  fetchImpl = fetch,
  cacheDirectory = photoSearchDirectory,
  log = (text: string) => process.stdout.write(`${text}\n`),
}: {
  queries: Record<string, string>
  pools: PhotoPools
  apiKey: string
  fetchImpl?: typeof fetch
  log?: (text: string) => void
  cacheDirectory?: string
}) {
  await mkdir(cacheDirectory, { recursive: true })
  const results: Record<string, { query: string; candidates: Candidate[] }> = {}
  let requests = 0
  for (const [key, query] of Object.entries(queries)) {
    if (pools[key]) continue
    const cached = await readCached(key, query, cacheDirectory)
    if (cached) {
      results[key] = { query, candidates: cached }
      continue
    }
    if (requests >= HOURLY_REQUEST_LIMIT) {
      log(
        `Stopped after ${requests} requests to stay under the hourly limit; run search again later.`,
      )
      break
    }
    const url = new URL(PEXELS_SEARCH_URL)
    url.searchParams.set('query', query)
    url.searchParams.set('per_page', String(RESULTS_PER_QUERY))
    url.searchParams.set('orientation', 'landscape')
    const response = await fetchImpl(url, {
      headers: { Authorization: apiKey },
    })
    requests += 1
    if (!response.ok) {
      throw new Error(
        `Pexels search for "${query}" failed with HTTP ${response.status}.`,
      )
    }
    const candidates = toCandidates(await response.json())
    await writeFile(
      cachePath(key, cacheDirectory),
      JSON.stringify({ query, candidates }, null, 2),
    )
    results[key] = { query, candidates }
  }
  log(
    `Searched ${requests} new queries; ${Object.keys(results).length} keys have candidates.`,
  )
  return results
}

export function applySelection(
  pools: PhotoPools,
  selection: unknown,
  candidatesByKey: Record<string, Candidate[]>,
): PhotoPools {
  const picks = selectionSchema.parse(selection)
  const next: PhotoPools = { ...pools }
  for (const [key, { query, ids }] of Object.entries(picks)) {
    const candidates = candidatesByKey[key] ?? []
    next[key] = {
      query,
      photos: ids.map((id) => {
        const photo = candidates.find(({ pexelsId }) => pexelsId === id)
        if (!photo)
          throw new Error(
            `${key}: photo ${id} is not among its search results.`,
          )
        return {
          url: photo.url,
          pexelsId: photo.pexelsId,
          photographer: photo.photographer,
          photographerUrl: photo.photographerUrl,
          pageUrl: photo.pageUrl,
        }
      }),
    }
  }
  return photoPoolsSchema.parse(
    Object.fromEntries(
      Object.entries(next).sort(([a], [b]) => a.localeCompare(b)),
    ),
  )
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

// A self-contained page: click 1–5 photos per dish (or none), then save the selection.
export function reviewPage(
  results: Record<string, { query: string; candidates: Candidate[] }>,
  dishes: Record<string, string[]>,
  preselected: Record<string, number[]> = {},
) {
  const sections = Object.entries(results)
    .map(([key, { query, candidates }]) => {
      const tiles = candidates
        .map(
          (photo) =>
            `<label class="tile"><input type="checkbox" value="${photo.pexelsId}"${
              preselected[key]?.includes(photo.pexelsId) ? ' checked' : ''
            }><img loading="lazy" src="${escapeHtml(photo.thumbnail)}" alt="${escapeHtml(photo.alt)}"></label>`,
        )
        .join('')
      return `<section data-key="${escapeHtml(key)}" data-query="${escapeHtml(query)}"><h2>${escapeHtml(key)}</h2><p>${(dishes[key] ?? []).map(escapeHtml).join(' · ')}</p><p class="query">Search: ${escapeHtml(query)}</p><div class="grid">${tiles}</div></section>`
    })
    .join('\n')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dish photo review</title>
<style>body{font-family:system-ui,sans-serif;margin:16px;background:#faf7f0}section{border-bottom:1px solid #ccc;padding:12px 0}h2{margin:0;font-size:16px}p{margin:4px 0;color:#444}.query{font-size:12px;color:#777}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.tile{position:relative}.tile img{width:100%;aspect-ratio:4/3;object-fit:cover;border:4px solid transparent;border-radius:6px}.tile input{position:absolute;top:8px;left:8px;transform:scale(1.4)}.tile input:checked+img{border-color:#1f7a4d}button{position:sticky;top:8px;padding:12px 18px;font-size:16px;background:#1f7a4d;color:#fff;border:0;border-radius:8px;z-index:1}</style></head>
<body><h1>Dish photo review</h1><p>Tick 1–5 photos that look like each dish. Leave a dish empty if none fit. Then save the selection.</p><button id="save">Save photo-selection.json</button>
${sections}
<script>document.getElementById('save').onclick=()=>{const out={};document.querySelectorAll('section').forEach(s=>{const ids=[...s.querySelectorAll('input:checked')].map(i=>Number(i.value));if(ids.length>5){alert(s.dataset.key+': pick at most 5');throw new Error('too many')}out[s.dataset.key]={query:s.dataset.query,ids}});const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:'application/json'}));a.download='photo-selection.json';a.click()}</script></body></html>
`
}

async function readPools() {
  try {
    return photoPoolsSchema.parse(
      JSON.parse(await readFile(photoPoolsPath, 'utf8')),
    )
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw error
  }
}

async function dishNamesByKey() {
  const directory = path.join(catalogSourceDirectory, 'restaurants')
  const { readdir } = await import('node:fs/promises')
  const names: Record<string, string[]> = {}
  for (const file of (await readdir(directory)).filter((name) =>
    name.endsWith('.json'),
  )) {
    const restaurant = JSON.parse(
      await readFile(path.join(directory, file), 'utf8'),
    ) as {
      slug: string
      menuItems: { photo?: string; name: { th: string; en: string } }[]
    }
    for (const { photo, name } of restaurant.menuItems) {
      if (!photo) continue
      ;(names[photo] ??= []).push(
        `${name.th} / ${name.en} (${restaurant.slug})`,
      )
    }
  }
  return names
}

async function main(argv: string[]) {
  const [command, file] = argv
  const pools = await readPools()
  if (command === 'search') {
    const apiKey = process.env.PEXELS_API_KEY
    if (!apiKey) throw new Error('Set PEXELS_API_KEY in src/api/.env first.')
    const queries = JSON.parse(
      await readFile(path.join(photoSearchDirectory, 'queries.json'), 'utf8'),
    ) as Record<string, string>
    const results = await searchPhotos({ queries, pools, apiKey })
    await writeFile(
      photoReviewPath,
      reviewPage(results, await dishNamesByKey()),
    )
    process.stdout.write(`Review page: ${photoReviewPath}\n`)
    return
  }
  if (command === 'apply' && file) {
    const selection = JSON.parse(await readFile(file, 'utf8')) as Record<
      string,
      { query: string }
    >
    const candidates: Record<string, Candidate[]> = {}
    for (const key of Object.keys(selection)) {
      candidates[key] = (await readCached(key, selection[key]!.query)) ?? []
    }
    const next = applySelection(pools, selection, candidates)
    await writeFile(photoPoolsPath, `${JSON.stringify(next, null, 2)}\n`)
    process.stdout.write(
      `Wrote ${Object.keys(next).length} photo pools to photos.json. Run catalog:build next.\n`,
    )
    return
  }
  throw new Error(
    'Usage: catalog:photos search | catalog:photos apply <selection.json>',
  )
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    )
    process.exitCode = 1
  })
}
