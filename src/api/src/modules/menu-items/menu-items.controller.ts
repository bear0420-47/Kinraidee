import type { RequestHandler } from 'express'

import { getAuditContext } from '@/shared/auditContext'
import { created, noContent, ok } from '@/shared/httpResponse'
import {
  parseBulkMenuItems,
  parseCreateMenuItem,
  parseMenuItemId,
  parseMenuItemListQuery,
  parseUpdateMenuItem,
} from './menu-items.dto'
import { menuItemsService, type MenuItemsService } from './menu-items.service'

export type MenuItemsController = {
  list: RequestHandler
  detail: RequestHandler
  create: RequestHandler
  update: RequestHandler
  remove: RequestHandler
  restore: RequestHandler
  bulkDelete: RequestHandler
  bulkRestore: RequestHandler
}

export function createMenuItemsController(
  service: MenuItemsService = menuItemsService,
): MenuItemsController {
  const list: RequestHandler = async (request, response) => {
    const result = await service.list(parseMenuItemListQuery(request.query))
    return ok(response, { items: result.items }, result.meta)
  }

  const detail: RequestHandler = async (request, response) =>
    ok(response, {
      menuItem: await service.detail(parseMenuItemId(request.params)),
    })

  const create: RequestHandler = async (request, response) =>
    created(response, {
      menuItem: await service.create(
        parseCreateMenuItem(request.body),
        getAuditContext(request),
      ),
    })

  const update: RequestHandler = async (request, response) =>
    ok(response, {
      menuItem: await service.update(
        parseMenuItemId(request.params),
        parseUpdateMenuItem(request.body),
        getAuditContext(request),
      ),
    })

  const remove: RequestHandler = async (request, response) => {
    await service.delete(
      parseMenuItemId(request.params),
      getAuditContext(request),
    )
    return noContent(response)
  }

  const restore: RequestHandler = async (request, response) =>
    ok(response, {
      menuItem: await service.restore(
        parseMenuItemId(request.params),
        getAuditContext(request),
      ),
    })

  const bulkDelete: RequestHandler = async (request, response) =>
    ok(
      response,
      await service.bulkDelete(
        parseBulkMenuItems(request.body),
        getAuditContext(request),
      ),
    )

  const bulkRestore: RequestHandler = async (request, response) =>
    ok(
      response,
      await service.bulkRestore(
        parseBulkMenuItems(request.body),
        getAuditContext(request),
      ),
    )

  return {
    list,
    detail,
    create,
    update,
    remove,
    restore,
    bulkDelete,
    bulkRestore,
  }
}

export const menuItemsController = createMenuItemsController()
