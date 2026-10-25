import type { RequestHandler } from 'express'

import { ok } from '@/shared/httpResponse'
import { parsePlaceDetailsRestaurantId } from './place-details.dto'
import {
  placeDetailsService,
  type PlaceDetailsService,
} from './place-details.service'

export type PlaceDetailsController = { detail: RequestHandler }

export function createPlaceDetailsController(
  service: PlaceDetailsService = placeDetailsService,
): PlaceDetailsController {
  const detail: RequestHandler = async (request, response) =>
    ok(response, {
      details: await service.get(parsePlaceDetailsRestaurantId(request.params)),
    })
  return { detail }
}

export const placeDetailsController = createPlaceDetailsController()
