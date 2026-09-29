import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import { localizationSchema } from '@/shared/localization'
import {
  createTasteSchema,
  tasteEnvelopeSchema,
  tasteIdParamsSchema,
  tasteListEnvelopeSchema,
  updateTasteSchema,
} from './tastes.dto'

export function registerTastesOpenApi(registry: OpenAPIRegistry) {
  registry.register('Localization', localizationSchema)
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  const createTaste = registry.register('CreateTasteRequest', createTasteSchema)
  const updateTaste = registry.register('UpdateTasteRequest', updateTasteSchema)
  const tasteList = registry.register(
    'TasteListEnvelope',
    tasteListEnvelopeSchema,
  )
  const tasteEnvelope = registry.register('TasteEnvelope', tasteEnvelopeSchema)

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
    path: '/api/tastes',
    responses: {
      200: {
        description: 'All tastes ordered by sortOrder, then Thai name',
        content: { 'application/json': { schema: tasteList } },
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/tastes',
    security: [{ cookieAuth: [] }],
    request: {
      body: { content: { 'application/json': { schema: createTaste } } },
    },
    responses: {
      201: {
        description: 'Created taste',
        content: { 'application/json': { schema: tasteEnvelope } },
      },
      400: error('Invalid request'),
      ...adminErrors,
      409: error('Thai or English name already exists'),
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/tastes/{id}',
    security: [{ cookieAuth: [] }],
    request: {
      params: tasteIdParamsSchema,
      body: { content: { 'application/json': { schema: updateTaste } } },
    },
    responses: {
      200: {
        description: 'Updated taste',
        content: { 'application/json': { schema: tasteEnvelope } },
      },
      400: error('Invalid request'),
      ...adminErrors,
      404: error('Taste not found'),
      409: error('Thai or English name already exists'),
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/tastes/{id}',
    security: [{ cookieAuth: [] }],
    request: { params: tasteIdParamsSchema },
    responses: {
      204: { description: 'Taste deleted' },
      ...adminErrors,
      404: error('Taste not found'),
      409: error('Menu items still use this taste'),
    },
  })
}
