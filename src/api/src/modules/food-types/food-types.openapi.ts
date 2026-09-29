import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import { localizationSchema } from '@/shared/localization'
import {
  createFoodTypeSchema,
  foodTypeEnvelopeSchema,
  foodTypeIdParamsSchema,
  foodTypeListEnvelopeSchema,
  updateFoodTypeSchema,
} from './food-types.dto'

export function registerFoodTypesOpenApi(registry: OpenAPIRegistry) {
  registry.register('Localization', localizationSchema)
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  const createFoodType = registry.register(
    'CreateFoodTypeRequest',
    createFoodTypeSchema,
  )
  const updateFoodType = registry.register(
    'UpdateFoodTypeRequest',
    updateFoodTypeSchema,
  )
  const foodTypeList = registry.register(
    'FoodTypeListEnvelope',
    foodTypeListEnvelopeSchema,
  )
  const foodTypeEnvelope = registry.register(
    'FoodTypeEnvelope',
    foodTypeEnvelopeSchema,
  )

  const error = (description: string) => ({
    description,
    content: { 'application/json': { schema: errorEnvelope } },
  })
  const adminErrors = {
    401: error('Missing, invalid, or expired token'),
    403: error('Authenticated user is not an administrator'),
  }

  registry.registerPath({
    method: 'get',
    path: '/api/food-types',
    responses: {
      200: {
        description: 'All food types ordered by sortOrder, then Thai name',
        content: { 'application/json': { schema: foodTypeList } },
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/food-types',
    security: [{ cookieAuth: [] }],
    request: {
      body: { content: { 'application/json': { schema: createFoodType } } },
    },
    responses: {
      201: {
        description: 'Created food type',
        content: { 'application/json': { schema: foodTypeEnvelope } },
      },
      400: error('Invalid request'),
      ...adminErrors,
      409: error('Thai or English name already exists'),
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/food-types/{id}',
    security: [{ cookieAuth: [] }],
    request: {
      params: foodTypeIdParamsSchema,
      body: { content: { 'application/json': { schema: updateFoodType } } },
    },
    responses: {
      200: {
        description: 'Updated food type',
        content: { 'application/json': { schema: foodTypeEnvelope } },
      },
      400: error('Invalid request'),
      ...adminErrors,
      404: error('Food type not found'),
      409: error('Thai or English name already exists'),
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/food-types/{id}',
    security: [{ cookieAuth: [] }],
    request: { params: foodTypeIdParamsSchema },
    responses: {
      204: { description: 'Food type deleted' },
      ...adminErrors,
      404: error('Food type not found'),
      409: error('Menu items still reference this food type'),
    },
  })
}
