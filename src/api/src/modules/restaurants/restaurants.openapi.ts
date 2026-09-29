import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import {
  createRestaurantSchema,
  restaurantEnvelopeSchema,
  restaurantIdParamsSchema,
  restaurantListEnvelopeSchema,
  restaurantListQuerySchema,
  updateRestaurantSchema,
} from './restaurants.dto'

export function registerRestaurantsOpenApi(registry: OpenAPIRegistry) {
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  const createRestaurant = registry.register(
    'CreateRestaurantRequest',
    createRestaurantSchema,
  )
  const updateRestaurant = registry.register(
    'UpdateRestaurantRequest',
    updateRestaurantSchema,
  )
  const restaurantEnvelope = registry.register(
    'RestaurantEnvelope',
    restaurantEnvelopeSchema,
  )
  const restaurantListEnvelope = registry.register(
    'RestaurantListEnvelope',
    restaurantListEnvelopeSchema,
  )

  const error = (description: string) => ({
    description,
    content: { 'application/json': { schema: errorEnvelope } },
  })
  const adminErrors = {
    401: error('Missing, invalid, or expired token'),
    403: error('Authenticated user is not an administrator'),
  }
  const notFound = {
    404: error('Restaurant or referenced zone not found'),
  }

  registry.registerPath({
    method: 'get',
    path: '/api/restaurants',
    security: [{ cookieAuth: [] }],
    request: { query: restaurantListQuerySchema },
    responses: {
      200: {
        description: 'Paginated administrator Restaurant list',
        content: { 'application/json': { schema: restaurantListEnvelope } },
      },
      400: error('Invalid query'),
      ...adminErrors,
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/restaurants/{id}',
    security: [{ cookieAuth: [] }],
    request: { params: restaurantIdParamsSchema },
    responses: {
      200: {
        description: 'Restaurant detail, including soft-deleted records',
        content: { 'application/json': { schema: restaurantEnvelope } },
      },
      ...adminErrors,
      ...notFound,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/restaurants',
    security: [{ cookieAuth: [] }],
    request: {
      body: { content: { 'application/json': { schema: createRestaurant } } },
    },
    responses: {
      201: {
        description: 'Created Restaurant',
        content: { 'application/json': { schema: restaurantEnvelope } },
      },
      400: error('Invalid request'),
      ...adminErrors,
      ...notFound,
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/restaurants/{id}',
    security: [{ cookieAuth: [] }],
    request: {
      params: restaurantIdParamsSchema,
      body: { content: { 'application/json': { schema: updateRestaurant } } },
    },
    responses: {
      200: {
        description: 'Updated Restaurant',
        content: { 'application/json': { schema: restaurantEnvelope } },
      },
      400: error('Invalid request'),
      ...adminErrors,
      ...notFound,
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/restaurants/{id}',
    security: [{ cookieAuth: [] }],
    request: { params: restaurantIdParamsSchema },
    responses: {
      204: {
        description: 'Restaurant and active child MenuItems soft-deleted',
      },
      ...adminErrors,
      ...notFound,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/restaurants/{id}/restore',
    security: [{ cookieAuth: [] }],
    request: { params: restaurantIdParamsSchema },
    responses: {
      200: {
        description: 'Restaurant restored without restoring MenuItems',
        content: { 'application/json': { schema: restaurantEnvelope } },
      },
      ...adminErrors,
      ...notFound,
    },
  })
}
