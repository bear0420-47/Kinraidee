import type { RequestHandler } from 'express'

import { getAuditContext } from '@/shared/auditContext'
import { created, noContent, ok } from '@/shared/httpResponse'
import {
  parseCreateRestaurant,
  parseRestaurantId,
  parseRestaurantListQuery,
  parseUpdateRestaurant,
} from './restaurants.dto'
import {
  restaurantsService,
  type RestaurantsService,
} from './restaurants.service'

export type RestaurantsController = {
  list: RequestHandler
  detail: RequestHandler
  create: RequestHandler
  update: RequestHandler
  remove: RequestHandler
  restore: RequestHandler
}

export function createRestaurantsController(
  service: RestaurantsService = restaurantsService,
): RestaurantsController {
  const list: RequestHandler = async (request, response) => {
    const result = await service.list(parseRestaurantListQuery(request.query))
    return ok(response, { items: result.items }, result.meta)
  }

  const detail: RequestHandler = async (request, response) =>
    ok(response, {
      restaurant: await service.detail(parseRestaurantId(request.params)),
    })

  const create: RequestHandler = async (request, response) =>
    created(response, {
      restaurant: await service.create(
        parseCreateRestaurant(request.body),
        getAuditContext(request),
      ),
    })

  const update: RequestHandler = async (request, response) =>
    ok(response, {
      restaurant: await service.update(
        parseRestaurantId(request.params),
        parseUpdateRestaurant(request.body),
        getAuditContext(request),
      ),
    })

  const remove: RequestHandler = async (request, response) => {
    await service.delete(
      parseRestaurantId(request.params),
      getAuditContext(request),
    )
    return noContent(response)
  }

  const restore: RequestHandler = async (request, response) =>
    ok(response, {
      restaurant: await service.restore(
        parseRestaurantId(request.params),
        getAuditContext(request),
      ),
    })

  return { list, detail, create, update, remove, restore }
}

export const restaurantsController = createRestaurantsController()
