import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { z } from 'zod'

import { env } from '../src/config/env'
import { catalogSourceDirectory, restaurantSourceSchema } from './catalog-build'

const responseSchema = z.object({
  places: z
    .array(
      z.object({
        id: z.string(),
        displayName: z.object({ text: z.string() }).optional(),
        formattedAddress: z.string().optional(),
        googleMapsUri: z.string().optional(),
      }),
    )
    .optional(),
})

if (!env.GOOGLE_PLACES_API_KEY) {
  throw new Error('GOOGLE_PLACES_API_KEY is required.')
}

const restaurantDirectory = path.join(catalogSourceDirectory, 'restaurants')
const files = (await readdir(restaurantDirectory))
  .filter((file) => file.endsWith('.json'))
  .sort()

for (const file of files) {
  const source = restaurantSourceSchema.parse(
    JSON.parse(await readFile(path.join(restaurantDirectory, file), 'utf8')),
  )
  const response = await fetch(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': env.GOOGLE_PLACES_API_KEY,
        'x-goog-fieldmask':
          'places.id,places.displayName,places.formattedAddress,places.googleMapsUri',
      },
      signal: AbortSignal.timeout(env.EXTERNAL_PROVIDER_TIMEOUT_MS),
      body: JSON.stringify({
        textQuery: `${source.name.th} มหาวิทยาลัยแม่ฟ้าหลวง เชียงราย`,
        languageCode: 'th',
        regionCode: 'TH',
        maxResultCount: 3,
      }),
    },
  )
  if (!response.ok) {
    process.stdout.write(`${source.slug}: provider error ${response.status}\n`)
    continue
  }
  const parsed = responseSchema.parse(await response.json())
  process.stdout.write(
    `${JSON.stringify({
      slug: source.slug,
      query: source.name.th,
      currentGooglePlaceId: source.googlePlaceId,
      candidates: parsed.places ?? [],
    })}\n`,
  )
}
