import type { AuditContext } from '@/shared/auditContext'
import { hasFieldChanges } from '@/shared/recordChanges'
import {
  toAdminRestaurant,
  toRestaurantCreateData,
  toRestaurantUpdateData,
  type CreateRestaurantInput,
  type RestaurantListQuery,
  type UpdateRestaurantInput,
} from './restaurants.dto'
import {
  restaurantNotFoundError,
  restaurantZoneNotFoundError,
  toRestaurantWriteError,
} from './restaurants.helpers'
import {
  restaurantsRepository,
  type RestaurantsRepository,
} from './restaurants.repository'

export function createRestaurantsService(
  repository: RestaurantsRepository = restaurantsRepository,
) {
  async function findOrThrow(id: string) {
    const restaurant = await repository.findById(id)
    if (!restaurant) throw restaurantNotFoundError()
    return restaurant
  }

  async function requireZone(zoneId: string) {
    if (!(await repository.zoneExists(zoneId))) {
      throw restaurantZoneNotFoundError()
    }
  }

  return {
    async list(query: RestaurantListQuery) {
      const { items, total } = await repository.list(query)
      return {
        items: items.map(toAdminRestaurant),
        meta: { page: query.page, pageSize: query.pageSize, total },
      }
    },

    async detail(id: string) {
      return toAdminRestaurant(await findOrThrow(id))
    },

    async create(input: CreateRestaurantInput, audit: AuditContext) {
      await requireZone(input.zoneId)
      try {
        return toAdminRestaurant(
          await repository.create(toRestaurantCreateData(input), audit),
        )
      } catch (error) {
        throw toRestaurantWriteError(error)
      }
    },

    async update(
      id: string,
      input: UpdateRestaurantInput,
      audit: AuditContext,
    ) {
      const restaurant = await findOrThrow(id)
      if (input.zoneId !== undefined && input.zoneId !== restaurant.zoneId) {
        await requireZone(input.zoneId)
      }
      const data = toRestaurantUpdateData(input)

      // Skip identical writes so they do not change timestamps or create audit noise.
      if (!hasFieldChanges(restaurant, data)) {
        return toAdminRestaurant(restaurant)
      }

      try {
        return toAdminRestaurant(await repository.update(id, data, audit))
      } catch (error) {
        throw toRestaurantWriteError(error)
      }
    },

    async delete(id: string, audit: AuditContext) {
      const restaurant = await findOrThrow(id)
      if (restaurant.deletedAt) return

      try {
        await repository.softDelete(id, audit)
      } catch (error) {
        throw toRestaurantWriteError(error)
      }
    },

    async restore(id: string, audit: AuditContext) {
      const restaurant = await findOrThrow(id)
      if (!restaurant.deletedAt) return toAdminRestaurant(restaurant)

      try {
        const result = await repository.restore(id, audit)
        return toAdminRestaurant(result.restaurant)
      } catch (error) {
        throw toRestaurantWriteError(error)
      }
    },
  }
}

export const restaurantsService = createRestaurantsService()
export type RestaurantsService = ReturnType<typeof createRestaurantsService>
