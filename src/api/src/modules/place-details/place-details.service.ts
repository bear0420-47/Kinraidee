import { HttpError } from '@/shared/httpError'
import { googlePlacesAdapter } from './google-places.adapter'
import type { PlaceDetailsProvider } from './place-details.provider'
import {
  placeDetailsRepository,
  type PlaceDetailsRepository,
} from './place-details.repository'

export function createPlaceDetailsService(
  repository: PlaceDetailsRepository = placeDetailsRepository,
  provider: PlaceDetailsProvider = googlePlacesAdapter,
) {
  return {
    async get(restaurantId: string) {
      const restaurant = await repository.findRestaurant(restaurantId)
      if (!restaurant) {
        throw new HttpError({
          status: 404,
          code: 'RESTAURANT_NOT_FOUND',
          message: 'Restaurant not found.',
        })
      }
      if (!restaurant.googlePlaceId) return null
      return provider.get(restaurant.googlePlaceId).catch(() => null)
    },
  }
}

export const placeDetailsService = createPlaceDetailsService()
export type PlaceDetailsService = ReturnType<typeof createPlaceDetailsService>
