import type { components } from '@/api/openapiTypes'
import type { RecommendationItem } from '@/schemas/meal/recommendationSchemas'

export type FavoriteItem =
  components['schemas']['FavoriteListEnvelope']['data']['items'][number]

export type FavoriteMenuItem = FavoriteItem['menuItem']

// The safe summary a favorite keeps, taken from a recommendation card's item.
export function toFavoriteMenuItem(item: RecommendationItem): FavoriteMenuItem {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl,
    restaurant: item.restaurant,
  }
}
