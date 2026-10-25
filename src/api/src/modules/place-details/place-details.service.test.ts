import { beforeAll, describe, expect, it, vi } from 'vitest'

import { stubTestEnv } from '@/test/routeTestApp'

let createPlaceDetailsService: typeof import('./place-details.service').createPlaceDetailsService

beforeAll(async () => {
  stubTestEnv()
  ;({ createPlaceDetailsService } = await import('./place-details.service'))
})

describe('place details service', () => {
  it('returns null without calling the provider when a restaurant is not mapped', async () => {
    const repository = {
      findRestaurant: vi.fn().mockResolvedValue({
        id: 'restaurant_1',
        googlePlaceId: null,
      }),
    }
    const provider = { get: vi.fn() }
    const service = createPlaceDetailsService(repository, provider)

    await expect(service.get('restaurant_1')).resolves.toBeNull()
    expect(provider.get).not.toHaveBeenCalled()
  })

  it('returns transient provider details for a mapped restaurant', async () => {
    const details = {
      rating: 4.5,
      userRatingCount: 25,
      openNow: true,
      weekdayDescriptions: ['Monday: 9:00 AM – 8:00 PM'],
      googleMapsUri: 'https://maps.google.com/example',
      reviews: [],
    }
    const repository = {
      findRestaurant: vi.fn().mockResolvedValue({
        id: 'restaurant_1',
        googlePlaceId: 'place_1',
      }),
    }
    const provider = { get: vi.fn().mockResolvedValue(details) }
    const service = createPlaceDetailsService(repository, provider)

    await expect(service.get('restaurant_1')).resolves.toEqual(details)
    expect(provider.get).toHaveBeenCalledWith('place_1')
  })

  it('returns null when the provider is unavailable', async () => {
    const repository = {
      findRestaurant: vi.fn().mockResolvedValue({
        id: 'restaurant_1',
        googlePlaceId: 'place_1',
      }),
    }
    const provider = { get: vi.fn().mockResolvedValue(null) }

    await expect(
      createPlaceDetailsService(repository, provider).get('restaurant_1'),
    ).resolves.toBeNull()
  })

  it('returns null when the provider rejects', async () => {
    const repository = {
      findRestaurant: vi.fn().mockResolvedValue({
        id: 'restaurant_1',
        googlePlaceId: 'place_1',
      }),
    }
    const provider = { get: vi.fn().mockRejectedValue(new Error('timeout')) }

    await expect(
      createPlaceDetailsService(repository, provider).get('restaurant_1'),
    ).resolves.toBeNull()
  })

  it('rejects unknown or deleted restaurants', async () => {
    const repository = { findRestaurant: vi.fn().mockResolvedValue(null) }
    const provider = { get: vi.fn() }

    await expect(
      createPlaceDetailsService(repository, provider).get('missing'),
    ).rejects.toMatchObject({ status: 404, code: 'RESTAURANT_NOT_FOUND' })
  })
})
