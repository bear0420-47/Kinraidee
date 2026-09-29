import type { RequestHandler } from 'express'

import { getAuditContext } from '@/shared/auditContext'
import { created, noContent, ok } from '@/shared/httpResponse'
import { parseCreateZone, parseUpdateZone, parseZoneId } from './zones.dto'
import { zonesService, type ZonesService } from './zones.service'

export type ZonesController = {
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler
  remove: RequestHandler
}

export function createZonesController(
  service: ZonesService = zonesService,
): ZonesController {
  const list: RequestHandler = async (_request, response) =>
    ok(response, { items: await service.list() })

  const create: RequestHandler = async (request, response) => {
    const zone = await service.create(
      parseCreateZone(request.body),
      getAuditContext(request),
    )
    return created(response, { zone })
  }

  const update: RequestHandler = async (request, response) => {
    const zone = await service.update(
      parseZoneId(request.params),
      parseUpdateZone(request.body),
      getAuditContext(request),
    )
    return ok(response, { zone })
  }

  const remove: RequestHandler = async (request, response) => {
    await service.delete(parseZoneId(request.params), getAuditContext(request))
    return noContent(response)
  }

  return { list, create, update, remove }
}

export const zonesController: ZonesController = createZonesController()
