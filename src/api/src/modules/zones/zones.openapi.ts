import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import { localizationSchema } from '@/shared/localization'
import {
  createZoneSchema,
  updateZoneSchema,
  zoneEnvelopeSchema,
  zoneIdParamsSchema,
  zoneListEnvelopeSchema,
} from './zones.dto'

export function registerZonesOpenApi(registry: OpenAPIRegistry) {
  registry.register('Localization', localizationSchema)
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  const createZone = registry.register('CreateZoneRequest', createZoneSchema)
  const updateZone = registry.register('UpdateZoneRequest', updateZoneSchema)
  const zoneList = registry.register('ZoneListEnvelope', zoneListEnvelopeSchema)
  const zoneEnvelope = registry.register('ZoneEnvelope', zoneEnvelopeSchema)

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
    path: '/api/zones',
    responses: {
      200: {
        description: 'All zones ordered by sortOrder, then Thai name',
        content: { 'application/json': { schema: zoneList } },
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/zones',
    security: [{ cookieAuth: [] }],
    request: {
      body: { content: { 'application/json': { schema: createZone } } },
    },
    responses: {
      201: {
        description: 'Created zone',
        content: { 'application/json': { schema: zoneEnvelope } },
      },
      400: error('Invalid request'),
      ...adminErrors,
      409: error('Thai or English name already exists'),
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/zones/{id}',
    security: [{ cookieAuth: [] }],
    request: {
      params: zoneIdParamsSchema,
      body: { content: { 'application/json': { schema: updateZone } } },
    },
    responses: {
      200: {
        description: 'Updated zone',
        content: { 'application/json': { schema: zoneEnvelope } },
      },
      400: error('Invalid request'),
      ...adminErrors,
      404: error('Zone not found'),
      409: error('Thai or English name already exists'),
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/zones/{id}',
    security: [{ cookieAuth: [] }],
    request: { params: zoneIdParamsSchema },
    responses: {
      204: { description: 'Zone deleted' },
      ...adminErrors,
      404: error('Zone not found'),
      409: error('Restaurants still reference this zone'),
    },
  })
}
