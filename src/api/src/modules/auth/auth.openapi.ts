import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import { AUTH_COOKIE_NAME } from '@/config/auth'
import {
  authCredentialsSchema,
  authErrorEnvelopeSchema,
  authUserEnvelopeSchema,
} from './auth.dto'

export function registerAuthOpenApi(registry: OpenAPIRegistry) {
  registry.registerComponent('securitySchemes', 'cookieAuth', {
    type: 'apiKey',
    in: 'cookie',
    name: AUTH_COOKIE_NAME,
  })

  const credentials = registry.register(
    'AuthCredentials',
    authCredentialsSchema,
  )
  const userEnvelope = registry.register(
    'AuthUserEnvelope',
    authUserEnvelopeSchema,
  )
  const errorEnvelope = registry.register(
    'ErrorEnvelope',
    authErrorEnvelopeSchema,
  )

  registry.registerPath({
    method: 'post',
    path: '/api/auth/register',
    request: {
      body: { content: { 'application/json': { schema: credentials } } },
    },
    responses: {
      201: {
        description: 'Registered user',
        content: { 'application/json': { schema: userEnvelope } },
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      409: {
        description: 'Email already registered',
        content: { 'application/json': { schema: errorEnvelope } },
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/auth/login',
    request: {
      body: { content: { 'application/json': { schema: credentials } } },
    },
    responses: {
      200: {
        description: 'Authenticated user',
        content: { 'application/json': { schema: userEnvelope } },
      },
      400: {
        description: 'Invalid request',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      401: {
        description: 'Invalid credentials',
        content: { 'application/json': { schema: errorEnvelope } },
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/auth/logout',
    responses: { 204: { description: 'Logged out' } },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/auth/me',
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: 'Current user',
        content: { 'application/json': { schema: userEnvelope } },
      },
      401: {
        description: 'Missing, invalid, or expired token',
        content: { 'application/json': { schema: errorEnvelope } },
      },
    },
  })
}
