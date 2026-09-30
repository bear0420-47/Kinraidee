import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import {
  bulkMenuItemEnvelopeSchema,
  bulkMenuItemSchema,
  createMenuItemSchema,
  menuItemEnvelopeSchema,
  menuItemIdParamsSchema,
  menuItemListEnvelopeSchema,
  menuItemListQuerySchema,
  updateMenuItemSchema,
} from './menu-items.dto'

export function registerMenuItemsOpenApi(registry: OpenAPIRegistry) {
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  const createMenuItem = registry.register(
    'CreateMenuItemRequest',
    createMenuItemSchema,
  )
  const updateMenuItem = registry.register(
    'UpdateMenuItemRequest',
    updateMenuItemSchema,
  )
  const bulkMenuItems = registry.register(
    'BulkMenuItemsRequest',
    bulkMenuItemSchema,
  )
  const menuItemEnvelope = registry.register(
    'MenuItemEnvelope',
    menuItemEnvelopeSchema,
  )
  const menuItemListEnvelope = registry.register(
    'MenuItemListEnvelope',
    menuItemListEnvelopeSchema,
  )
  const bulkMenuItemEnvelope = registry.register(
    'BulkMenuItemEnvelope',
    bulkMenuItemEnvelopeSchema,
  )

  const error = (description: string) => ({
    description,
    content: { 'application/json': { schema: errorEnvelope } },
  })
  const adminErrors = {
    401: error('Missing, invalid, or expired token'),
    403: error('Authenticated user is not an administrator'),
  }
  const notFound = { 404: error('MenuItem or referenced record not found') }

  registry.registerPath({
    method: 'get',
    path: '/api/menu-items',
    security: [{ cookieAuth: [] }],
    request: { query: menuItemListQuerySchema },
    responses: {
      200: {
        description: 'Paginated administrator MenuItem list',
        content: { 'application/json': { schema: menuItemListEnvelope } },
      },
      400: error('Invalid query'),
      ...adminErrors,
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/menu-items/{id}',
    security: [{ cookieAuth: [] }],
    request: { params: menuItemIdParamsSchema },
    responses: {
      200: {
        description: 'MenuItem detail, including soft-deleted records',
        content: { 'application/json': { schema: menuItemEnvelope } },
      },
      ...adminErrors,
      ...notFound,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/menu-items',
    security: [{ cookieAuth: [] }],
    request: {
      body: { content: { 'application/json': { schema: createMenuItem } } },
    },
    responses: {
      201: {
        description: 'Created MenuItem',
        content: { 'application/json': { schema: menuItemEnvelope } },
      },
      400: error('Invalid request'),
      409: error('Referenced Restaurant is deleted'),
      ...adminErrors,
      ...notFound,
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/menu-items/{id}',
    security: [{ cookieAuth: [] }],
    request: {
      params: menuItemIdParamsSchema,
      body: { content: { 'application/json': { schema: updateMenuItem } } },
    },
    responses: {
      200: {
        description: 'Updated MenuItem',
        content: { 'application/json': { schema: menuItemEnvelope } },
      },
      400: error('Invalid request'),
      409: error('Referenced Restaurant is deleted'),
      ...adminErrors,
      ...notFound,
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/menu-items/{id}',
    security: [{ cookieAuth: [] }],
    request: { params: menuItemIdParamsSchema },
    responses: {
      204: { description: 'MenuItem soft-deleted' },
      ...adminErrors,
      ...notFound,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/menu-items/{id}/restore',
    security: [{ cookieAuth: [] }],
    request: { params: menuItemIdParamsSchema },
    responses: {
      200: {
        description: 'MenuItem restored under an active Restaurant',
        content: { 'application/json': { schema: menuItemEnvelope } },
      },
      409: error('Owning Restaurant is deleted'),
      ...adminErrors,
      ...notFound,
    },
  })

  for (const [path, description] of [
    ['/api/menu-items/bulk-delete', 'Bulk soft-delete MenuItems'],
    ['/api/menu-items/bulk-restore', 'Bulk restore MenuItems'],
  ] as const) {
    registry.registerPath({
      method: 'post',
      path,
      security: [{ cookieAuth: [] }],
      request: {
        body: { content: { 'application/json': { schema: bulkMenuItems } } },
      },
      responses: {
        200: {
          description,
          content: { 'application/json': { schema: bulkMenuItemEnvelope } },
        },
        400: error('Invalid or unknown MenuItem IDs'),
        ...(path.endsWith('bulk-restore')
          ? { 409: error('A target Restaurant is deleted') }
          : {}),
        ...adminErrors,
      },
    })
  }
}
