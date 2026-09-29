import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import {
  uploadErrorEnvelopeSchema,
  uploadFileNameParameterSchema,
  uploadImageEnvelopeSchema,
  uploadMultipartSchema,
} from './uploads.dto'

export function registerUploadsOpenApi(registry: OpenAPIRegistry) {
  const imageEnvelope = registry.register(
    'UploadImageEnvelope',
    uploadImageEnvelopeSchema,
  )
  const errorEnvelope = registry.register(
    'UploadErrorEnvelope',
    uploadErrorEnvelopeSchema,
  )

  registry.registerPath({
    method: 'post',
    path: '/api/uploads/images',
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        content: { 'multipart/form-data': { schema: uploadMultipartSchema } },
      },
    },
    responses: {
      201: {
        description: 'Stored local image',
        content: { 'application/json': { schema: imageEnvelope } },
      },
      400: {
        description: 'Invalid upload',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      401: {
        description: 'Authentication required',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      403: {
        description: 'Administrator access required',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      413: {
        description: 'Image exceeds the configured limit',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      415: {
        description: 'Unsupported image type',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      503: {
        description: 'Local upload storage unavailable',
        content: { 'application/json': { schema: errorEnvelope } },
      },
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/uploads/images/{fileName}',
    security: [{ cookieAuth: [] }],
    request: { params: uploadFileNameParameterSchema },
    responses: {
      204: { description: 'Deleted local image' },
      400: {
        description: 'Invalid generated file name',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      401: {
        description: 'Authentication required',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      403: {
        description: 'Administrator access required',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      404: {
        description: 'Upload not found',
        content: { 'application/json': { schema: errorEnvelope } },
      },
      503: {
        description: 'Local upload storage unavailable',
        content: { 'application/json': { schema: errorEnvelope } },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/uploads/{fileName}',
    request: { params: uploadFileNameParameterSchema },
    responses: {
      200: {
        description: 'Local image in development or test',
        content: {
          'image/jpeg': { schema: z.string().meta({ format: 'binary' }) },
          'image/png': { schema: z.string().meta({ format: 'binary' }) },
          'image/webp': { schema: z.string().meta({ format: 'binary' }) },
        },
      },
      404: { description: 'Image unavailable' },
    },
  })
}
