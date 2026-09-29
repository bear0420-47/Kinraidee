import type { RequestHandler } from 'express'

import { getAuditContext } from '@/shared/auditContext'
import { created, noContent, ok } from '@/shared/httpResponse'
import {
  parseCreateFoodType,
  parseFoodTypeId,
  parseUpdateFoodType,
} from './food-types.dto'
import { foodTypesService, type FoodTypesService } from './food-types.service'

export type FoodTypesController = {
  list: RequestHandler
  create: RequestHandler
  update: RequestHandler
  remove: RequestHandler
}

export function createFoodTypesController(
  service: FoodTypesService = foodTypesService,
): FoodTypesController {
  const list: RequestHandler = async (_request, response) =>
    ok(response, { items: await service.list() })

  const create: RequestHandler = async (request, response) => {
    const foodType = await service.create(
      parseCreateFoodType(request.body),
      getAuditContext(request),
    )
    return created(response, { foodType })
  }

  const update: RequestHandler = async (request, response) => {
    const foodType = await service.update(
      parseFoodTypeId(request.params),
      parseUpdateFoodType(request.body),
      getAuditContext(request),
    )
    return ok(response, { foodType })
  }

  const remove: RequestHandler = async (request, response) => {
    await service.delete(
      parseFoodTypeId(request.params),
      getAuditContext(request),
    )
    return noContent(response)
  }

  return { list, create, update, remove }
}

export const foodTypesController: FoodTypesController =
  createFoodTypesController()
