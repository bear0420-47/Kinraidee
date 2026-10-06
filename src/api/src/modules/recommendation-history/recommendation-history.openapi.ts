import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import {
  historyEnvelopeSchema,
  historyListEnvelopeSchema,
  historyListQuerySchema,
  recordHistorySchema,
} from './recommendation-history.dto'

export function registerRecommendationHistoryOpenApi(
  registry: OpenAPIRegistry,
) {
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  const recordRequest = registry.register(
    'RecordHistoryRequest',
    recordHistorySchema,
  )
  const historyEnvelope = registry.register(
    'HistoryEnvelope',
    historyEnvelopeSchema,
  )
  const listEnvelope = registry.register(
    'HistoryListEnvelope',
    historyListEnvelopeSchema,
  )

  const error = (description: string) => ({
    description,
    content: { 'application/json': { schema: errorEnvelope } },
  })
  const unauthenticated = { 401: error('Missing, invalid, or expired token') }

  registry.registerPath({
    method: 'get',
    path: '/api/recommendation-history',
    security: [{ cookieAuth: [] }],
    request: { query: historyListQuerySchema },
    responses: {
      200: {
        description:
          'The signed-in user selected-menu history, newest first, including unavailable items',
        content: { 'application/json': { schema: listEnvelope } },
      },
      400: error('Invalid page or page size'),
      ...unauthenticated,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/recommendation-history',
    security: [{ cookieAuth: [] }],
    request: {
      body: { content: { 'application/json': { schema: recordRequest } } },
    },
    responses: {
      201: {
        description: 'One selection recorded (repeats are separate rows)',
        content: { 'application/json': { schema: historyEnvelope } },
      },
      400: error('Missing MenuItem ID or an unknown field'),
      ...unauthenticated,
      404: error('MenuItem not found'),
      409: error('The MenuItem or its Restaurant is deleted'),
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/recommendation-history',
    security: [{ cookieAuth: [] }],
    responses: {
      204: { description: 'All of the user history cleared (idempotent)' },
      ...unauthenticated,
    },
  })
}
