import { Router, type Router as ExpressRouter } from 'express'

import { requireAuth } from '@/middleware/requireAuth'
import {
  preferencesController,
  type PreferencesController,
} from './preferences.controller'

// The signed-in user's saved defaults, for any role; there is no public preference API.
export function createPreferencesRoutes(
  controller: PreferencesController = preferencesController,
): ExpressRouter {
  const router = Router()

  router.get('/', requireAuth, controller.get)
  router.put('/', requireAuth, controller.replace)
  router.delete('/', requireAuth, controller.clear)

  return router
}

export const preferencesRoutes = createPreferencesRoutes()
