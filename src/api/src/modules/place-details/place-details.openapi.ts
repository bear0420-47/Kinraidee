import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import {
  placeDetailsEnvelopeSchema,
  placeDetailsParamsSchema,
} from './place-details.dto'

export function registerPlaceDetailsOpenApi(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/api/restaurants/{restaurantId}/place-details',
    request: { params: placeDetailsParamsSchema },
    responses: {
      200: {
        description:
          'Transient Google Places evidence, or null when unavailable',
        content: { 'application/json': { schema: placeDetailsEnvelopeSchema } },
      },
      404: {
        description: 'Restaurant not found',
        content: { 'application/json': { schema: errorEnvelopeSchema } },
      },
    },
  })
}
