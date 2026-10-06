import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { errorEnvelopeSchema } from '@/shared/errorEnvelope'
import { preferenceEnvelopeSchema, preferenceSchema } from './preferences.dto'

export function registerPreferencesOpenApi(registry: OpenAPIRegistry) {
  const errorEnvelope = registry.register('ErrorEnvelope', errorEnvelopeSchema)
  // Both the PUT body and the saved value in responses.
  const preference = registry.register('Preference', preferenceSchema)
  const envelope = registry.register(
    'PreferenceEnvelope',
    preferenceEnvelopeSchema,
  )

  const error = (description: string) => ({
    description,
    content: { 'application/json': { schema: errorEnvelope } },
  })
  const saved = (description: string) => ({
    description,
    content: { 'application/json': { schema: envelope } },
  })
  const unauthenticated = { 401: error('Missing, invalid, or expired token') }

  registry.registerPath({
    method: 'get',
    path: '/api/preferences',
    security: [{ cookieAuth: [] }],
    responses: {
      200: saved('The signed-in user preference, or null when none is saved'),
      ...unauthenticated,
    },
  })

  registry.registerPath({
    method: 'put',
    path: '/api/preferences',
    security: [{ cookieAuth: [] }],
    request: {
      body: { content: { 'application/json': { schema: preference } } },
    },
    responses: {
      200: saved('The saved preference (a full replacement)'),
      400: error(
        'All fields null, an unknown field or budget, or an unknown master-data ID',
      ),
      ...unauthenticated,
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/preferences',
    security: [{ cookieAuth: [] }],
    responses: {
      204: { description: 'Preference cleared (idempotent)' },
      ...unauthenticated,
    },
  })
}
