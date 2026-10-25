import { Router, type Router as ExpressRouter } from 'express'

import {
  placeDetailsController,
  type PlaceDetailsController,
} from './place-details.controller'

export function createPlaceDetailsRoutes(
  controller: PlaceDetailsController = placeDetailsController,
): ExpressRouter {
  const router = Router()
  router.get('/:restaurantId/place-details', controller.detail)
  return router
}

export const placeDetailsRoutes = createPlaceDetailsRoutes()
