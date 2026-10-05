import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import {
  recommendationEnvelopeSchema,
  recommendationRequestSchema,
} from './recommendations.dto'

export function registerRecommendationsOpenApi(registry: OpenAPIRegistry) {
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  const request = registry.register(
    'RecommendationRequest',
    recommendationRequestSchema,
  )
  const response = registry.register(
    'RecommendationEnvelope',
    recommendationEnvelopeSchema,
  )

  registry.registerPath({
    method: 'post',
    path: '/api/recommendations',
    request: {
      body: { content: { 'application/json': { schema: request } } },
    },
    responses: {
      200: {
        description: 'Stateless recommendation shortlist or no-match result',
        content: { 'application/json': { schema: response } },
      },
      400: {
        description: 'Invalid conditions, exclusions, or count',
        content: { 'application/json': { schema: errorEnvelope } },
      },
    },
  })
}
