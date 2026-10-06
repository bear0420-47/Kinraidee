import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import {
  favoriteListEnvelopeSchema,
  favoriteParamsSchema,
  favoriteStateEnvelopeSchema,
} from './favorites.dto'

export function registerFavoritesOpenApi(registry: OpenAPIRegistry) {
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  const listEnvelope = registry.register(
    'FavoriteListEnvelope',
    favoriteListEnvelopeSchema,
  )
  const stateEnvelope = registry.register(
    'FavoriteStateEnvelope',
    favoriteStateEnvelopeSchema,
  )

  const error = (description: string) => ({
    description,
    content: { 'application/json': { schema: errorEnvelope } },
  })
  const state = (description: string) => ({
    description,
    content: { 'application/json': { schema: stateEnvelope } },
  })
  const unauthenticated = { 401: error('Missing, invalid, or expired token') }
  const notFound = { 404: error('MenuItem not found') }
  const unavailable = {
    409: error(
      'The MenuItem or its Restaurant is deleted, so it cannot be added',
    ),
  }

  registry.registerPath({
    method: 'get',
    path: '/api/favorites',
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description:
          'The signed-in user favorites, newest first, including unavailable ones',
        content: { 'application/json': { schema: listEnvelope } },
      },
      ...unauthenticated,
    },
  })

  registry.registerPath({
    method: 'put',
    path: '/api/favorites/{menuItemId}',
    security: [{ cookieAuth: [] }],
    request: { params: favoriteParamsSchema },
    responses: {
      200: state('Favorited (idempotent)'),
      ...unauthenticated,
      ...notFound,
      ...unavailable,
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/favorites/{menuItemId}',
    security: [{ cookieAuth: [] }],
    request: { params: favoriteParamsSchema },
    responses: {
      200: state('Not favorited (idempotent, also for unavailable items)'),
      ...unauthenticated,
      ...notFound,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/favorites/{menuItemId}/toggle',
    security: [{ cookieAuth: [] }],
    request: { params: favoriteParamsSchema },
    responses: {
      200: state('The favorite state after flipping it'),
      ...unauthenticated,
      ...notFound,
      ...unavailable,
    },
  })
}
