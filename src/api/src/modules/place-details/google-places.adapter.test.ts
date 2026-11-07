import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { stubTestEnv } from '@/test/routeTestApp'

let googlePlacesAdapter: typeof import('./google-places.adapter').googlePlacesAdapter
let toSafeLinkUrl: typeof import('./google-places.adapter').toSafeLinkUrl

beforeAll(async () => {
  stubTestEnv()
  vi.stubEnv('GOOGLE_PLACES_API_KEY', 'test-places-key')
  ;({ googlePlacesAdapter, toSafeLinkUrl } =
    await import('./google-places.adapter'))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('toSafeLinkUrl', () => {
  it.each([
    ['https://maps.google.com/?cid=1', 'https://maps.google.com/?cid=1'],
    ['http://example.com/', 'http://example.com/'],
  ])('keeps %s', (input, expected) => {
    expect(toSafeLinkUrl(input)).toBe(expected)
  })

  it.each([
    'javascript:alert(document.cookie)',
    'JAVASCRIPT:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'not a url',
    '',
    undefined,
  ])('drops %s', (input) => {
    expect(toSafeLinkUrl(input)).toBeNull()
  })
})

describe('googlePlacesAdapter', () => {
  it('never passes script URLs from the provider through to the web app', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            googleMapsUri: 'javascript:alert(1)',
            reviews: [
              {
                authorAttribution: {
                  displayName: 'Reviewer',
                  uri: 'javascript:alert(2)',
                },
              },
              {
                authorAttribution: {
                  displayName: 'Safe reviewer',
                  uri: 'https://www.google.com/maps/contrib/1',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    )

    const details = await googlePlacesAdapter.get('place/../../secret')

    expect(details?.googleMapsUri).toBeNull()
    expect(details?.reviews.map((review) => review.authorUri)).toEqual([
      null,
      'https://www.google.com/maps/contrib/1',
    ])
    // The place ID is encoded, so it cannot change the request path.
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe(
      'https://places.googleapis.com/v1/places/place%2F..%2F..%2Fsecret',
    )
  })
})
