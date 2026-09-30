import { Router, type Router as ExpressRouter } from 'express'

import { requireAdmin } from '@/middleware/requireAdmin'
import { requireAuth } from '@/middleware/requireAuth'
import {
  menuItemsController,
  type MenuItemsController,
} from './menu-items.controller'

export function createMenuItemsRoutes(
  controller: MenuItemsController = menuItemsController,
): ExpressRouter {
  const router = Router()
  const adminOnly = [requireAuth, requireAdmin]

  router.get('/', adminOnly, controller.list)
  router.post('/bulk-delete', adminOnly, controller.bulkDelete)
  router.post('/bulk-restore', adminOnly, controller.bulkRestore)
  router.get('/:id', adminOnly, controller.detail)
  router.post('/', adminOnly, controller.create)
  router.patch('/:id', adminOnly, controller.update)
  router.delete('/:id', adminOnly, controller.remove)
  router.post('/:id/restore', adminOnly, controller.restore)

  return router
}

export const menuItemsRoutes = createMenuItemsRoutes()
