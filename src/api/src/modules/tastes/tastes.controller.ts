import type { RequestHandler } from 'express'

import { getAuditContext } from '@/shared/auditContext'
import { created, noContent, ok } from '@/shared/httpResponse'
import { parseCreateTaste, parseTasteId, parseUpdateTaste } from './tastes.dto'
import { tastesService, type TastesService } from './tastes.service'

export type TastesController = {
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler
  remove: RequestHandler
}

export function createTastesController(
  service: TastesService = tastesService,
): TastesController {
  const list: RequestHandler = async (_request, response) =>
    ok(response, { items: await service.list() })

  const create: RequestHandler = async (request, response) => {
    const taste = await service.create(
      parseCreateTaste(request.body),
      getAuditContext(request),
    )
    return created(response, { taste })
  }

  const update: RequestHandler = async (request, response) => {
    const taste = await service.update(
      parseTasteId(request.params),
      parseUpdateTaste(request.body),
      getAuditContext(request),
    )
    return ok(response, { taste })
  }

  const remove: RequestHandler = async (request, response) => {
    await service.delete(parseTasteId(request.params), getAuditContext(request))
    return noContent(response)
  }

  return { list, create, update, remove }
}

export const tastesController: TastesController = createTastesController()
